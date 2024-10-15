const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');

const app = express();

const MERCHANT_ID = 'MERCHANTUAT';
const PHONE_PE_HOST_URL = 'https://mercury-uat.phonepe.com/enterprise-sandbox';
const SALT_INDEX = 1;
const SALT_KEY = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const APP_BE_URL = 'http://localhost:3002';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('PhonePe Integration APIs!');
});

app.get('/pay', async (req, res) => {
  const amount = +req.query.amount;
  let userId = 'MUID123';
  let merchantTransactionId = uniqid();
  let normalPayLoad = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: amount * 100,
    redirectUrl: `${APP_BE_URL}/payment/validate/${merchantTransactionId}`,
    redirectMode: 'REDIRECT',
    mobileNumber: '9999999999',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), 'utf8');
  let base64EncodedPayload = bufferObj.toString('base64');
  let string = base64EncodedPayload + '/v3/qr/init' + SALT_KEY;
  let sha256_val = sha256(string);
  let xVerifyChecksum = sha256_val + '###' + SALT_INDEX;

  try {
    const response = await axios.post(
      `${PHONE_PE_HOST_URL}/pay`,
      { request: base64EncodedPayload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyChecksum,
          accept: 'application/json',
        },
      }
    );
    res.json({ url: response.data.data.instrumentResponse.redirectInfo.url });
  } catch (error) {
    res.status(500).send(error.response.data);
  }
});

app.get('/payment/validate/:merchantTransactionId', async (req, res) => {
  const { merchantTransactionId } = req.params;
  if (merchantTransactionId) {
    let statusUrl = `${PHONE_PE_HOST_URL}/status/${MERCHANT_ID}/` + merchantTransactionId;
    let string = `/v3/qr/init${MERCHANT_ID}/` + merchantTransactionId + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + '###' + SALT_INDEX;

    try {
      const response = await axios.get(statusUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyChecksum,
          accept: 'application/json',
        },
      });
      if (response.data && response.data.success) {
        res.send(response.data);
      } else {
        res.send('Payment failed or pending');
      }
    } catch (error) {
      res.status(500).send(error.response.data);
    }
  } else {
    res.status(400).send('Invalid request');
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`PhonePe application listening on port ${port}`);
});

