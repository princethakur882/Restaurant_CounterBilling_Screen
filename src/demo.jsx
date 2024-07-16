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


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// import React, {useContext} from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   Image,
//   FlatList,
//   TextInput,
//   useWindowDimensions,
//   Pressable,
//   TouchableOpacity,
// } from 'react-native';
// import {ApiContext} from '../../Context/ApiProvider';
// import AddToCartButton from './CartButton';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const HomeMenu = ({navigation}) => {
//   const {filteredData, searchQuery, setSearchQuery, cartItems, totalPrice} =
//     useContext(ApiContext);
//   const {width: screenWidth} = useWindowDimensions();

//   const renderItem = ({item}) => {
//     return (
//       <View style={styles.itemContainer}>
//         <Image source={{uri: item.data.imageUrl}} style={styles.itemimg} />
//         <View style={styles.itemDetails}>
//           <Text style={styles.itemName}>{item.data.name}</Text>
//           <Text style={styles.itemPrice}>
//             {'\u20B9'}
//             {item.data.price}
//           </Text>
//         </View>
//         <AddToCartButton item={item} />
//       </View>
//     );
//   };

//   const itemsPerRow = Math.floor(screenWidth / 120);

//   const totalItems = cartItems.reduce((acc, curr) => {
//     return acc + curr.count;
//   }, 0);

//   const rows = filteredData
//     ? filteredData.reduce((acc, curr, index) => {
//         if (index % itemsPerRow === 0) acc.push([curr]);
//         else acc[acc.length - 1].push(curr);
//         return acc;
//       }, [])
//     : [];

//   const renderRow = ({item}) => (
//     <View style={styles.rowContainer}>
//       {item.map(i => (
//         <View key={i.id} style={{flex: 1}}>
//           {renderItem({item: i})}
//         </View>
//       ))}
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.login}>
//         <TouchableOpacity
//           style={styles.btn}
//           onPress={() => navigation.navigate('HomeMenu')}>
//           <Text style={styles.text}>Menu</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.adminbtn}
//           onPress={() => navigation.navigate('AdminLogIn')}>
//           <Text style={styles.admintext}>Admin</Text>
//         </TouchableOpacity>
//       </View>
//       <TextInput
//         style={styles.searchBar}
//         placeholder="Search"
//         value={searchQuery}
//         onChangeText={text => setSearchQuery(text)}
//       />
//       <FlatList
//         style={styles.flatList}
//         data={rows}
//         renderItem={renderRow}
//         keyExtractor={(item, index) => index.toString()}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No data available.</Text>
//         }
//       />
//       {/* <View style={styles.thanks}>
//         <Text style={styles.thankstext}>Thanks for Shopping </Text>
//       </View> */}
//       {totalItems>0 &&(
//         <View
//         style={styles.cartBar}
//         onPress={() => navigation.navigate('BillDetails')}>
//         <View style={styles.outercart}>
//           <Icon name="shopping-cart" size={28} color={'white'} />
//           <Text style={styles.cartText}>{totalItems} Items | {'\u20B9'} {totalPrice}</Text>
//         </View>
//         <Pressable
//           style={styles.pay}
//           onPress={() => navigation.navigate('BillDetails')}>
//           <Text style={styles.pay}>PAY</Text>
//         </Pressable>
//       </View>
//       )}
      
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   login: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   btn: {
//     backgroundColor: '#FF7722',
//     height: 40,
//     width: '45%',
//     borderRadius: 10,
//     margin: 10,
//   },
//   adminbtn: {
//     backgroundColor: '#FFF',
//     height: 40,
//     width: '45%',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#FF7722',
//     margin: 10,
//   },
//   text: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#fff',
//     textAlign: 'center',
//     paddingTop: 8,
//   },
//   admintext: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#FF7722',
//     textAlign: 'center',
//     paddingTop: 8,
//   },
//   flatList: {
//     paddingTop: 60,
//     paddingHorizontal: 4,
//   },
//   rowContainer: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   searchBar: {
//     position: 'absolute',
//     top: 50,
//     left: 0,
//     right: 0,
//     padding: 10,
//     margin: 10,
//     backgroundColor: '#fff',
//     borderColor: '#FF7722',
//     borderWidth: 1,
//     borderRadius: 8,
//     elevation: 2,
//     zIndex: 1,
//   },
//   itemContainer: {
//     width: 120,
//     margin: 4,
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     alignItems: 'center',
//   },
//   itemimg: {
//     width: 100,
//     height: 80,
//     resizeMode: 'cover',
//     marginBottom: 8,
//     borderRadius: 5,
//   },
//   itemDetails: {
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     marginTop: 5,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#000',
//   },
//   itemPrice: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 50,
//   },
//   cartBar: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 10,
//     margin: 10,
//     backgroundColor: '#FF7722',
//     borderRadius: 8,
//     elevation: 2,
//     zIndex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     textAlign: 'center',
//     alignItems: 'center',
//     height: 50,
//   },
//   outercart:{
//     flexDirection:'row',
//     alignItems:'center'
//   },
//   cartText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: 'white',
//     paddingLeft:5
//   },
//   thanks: {
//     marginVertical: 80,
//     alignItems: 'center',
//     textAlign: 'center',
//   },
//   thankstext: {
//     color: '#FF7722',
//     fontSize: 20,
//     fontWeight: '700',
//   },
//   pay: {
//     backgroundColor:'white',
//     fontSize: 15,
//     fontWeight: '900',
//     color: '#FF7722',
//     padding:3,
//     borderRadius:10
//   },
// });

// export default HomeMenu;

