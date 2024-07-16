const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');

const app = express();

const MERCHANT_ID = 'MERCHANTUAT';
const PHONE_PE_HOST_URL = 'https://mercury-t2.phonepe.com/v3/qr/init';
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
  // let storeId = uniqid();
  // let transactionId = uniqid();
  let normalPayLoad = {
    merchantId: MERCHANT_ID,
    transactionId: "TX32321849644234",
    storeId: "234555",
    amount: 1000,
    expiresIn: 1800,
  };

  let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), 'utf8');
  let base64EncodedPayload = bufferObj.toString('base64');
  let string = base64EncodedPayload + '/v3/qr/init' + SALT_KEY;
  let sha256_val = sha256(string);
  let xVerifyChecksum = sha256_val + '###' + SALT_INDEX;

  try {
    const response = await axios.post(
      PHONE_PE_HOST_URL,
      
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyChecksum,
          accept: 'application/json',
        },
        data:{ request: base64EncodedPayload },
      }
    );
    res.json({ url: response.data.data.instrumentResponse.redirectInfo.url });
    res.send(ur)
  } catch (error) {
    res.status(500).send(error.response ? error.response.data : error.message);
  }
});

app.get('/payment/validate/:merchantTransactionId', async (req, res) => {
  const { merchantTransactionId } = req.params;
  if (merchantTransactionId) {
    let statusUrl = `${PHONE_PE_HOST_URL}/status/${MERCHANT_ID}/${merchantTransactionId}`;
    let string = `/v3/qr/init/status/${MERCHANT_ID}/${merchantTransactionId}${SALT_KEY}`;
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
      res.status(500).send(error.response ? error.response.data : error.message);
    }
  } else {
    res.status(400).send('Invalid request');
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`PhonePe application listening on port ${port}`);
});
