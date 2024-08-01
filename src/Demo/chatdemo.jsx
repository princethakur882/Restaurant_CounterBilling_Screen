import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  useWindowDimensions,
  Pressable,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import {ApiContext} from '../../Context/ApiProvider';
import AddToCartButton from './CartButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

const HomeMenu = ({navigation}) => {
  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    cartItems,
    totalPrice,
    printReceipt,
    resetCart,
    increment,
    decrement,
    count,
  } = useContext(ApiContext);
  const {width: screenWidth} = useWindowDimensions();
  const cartBarAnimation = useRef(new Animated.Value(0)).current;
  const modalSlideAnimation = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [creditModalVisible, setCreditModalVisible] = useState(false);
  const [toggleIcon, setToggleIcon] = useState(false);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);

  const totalItems = cartItems.reduce((acc, curr) => {
    return acc + curr.count;
  }, 0);

  useEffect(() => {
    const fetchParties = async () => {
      const snapshot = await firestore().collection('parties').get();
      const fetchedParties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setParties(fetchedParties);
    };

    fetchParties();
  }, []);

  useEffect(() => {
    Animated.timing(cartBarAnimation, {
      toValue: totalItems > 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [totalItems]);

  const cartBarTranslateY = cartBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const renderItem = ({item}) => {
    return (
      <View style={styles.itemContainer}>
        <Image source={{uri: item.data.imageUrl}} style={styles.itemimg} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.data.name}</Text>
          <Text style={styles.itemPrice}>
            {'\u20B9'}
            {item.data.price}
          </Text>
        </View>
        <AddToCartButton item={item} />
      </View>
    );
  };

  const itemsPerRow = Math.floor(screenWidth / 120);

  const rows = filteredData
    ? filteredData.reduce((acc, curr, index) => {
        if (index % itemsPerRow === 0) acc.push([curr]);
        else acc[acc.length - 1].push(curr);
        return acc;
      }, [])
    : [];

  const renderRow = ({item}) => (
    <View style={styles.rowContainer}>
      {item.map(i => (
        <View key={i.id} style={{flex: 1}}>
          {renderItem({item: i})}
        </View>
      ))}
    </View>
  );

  const createOrder = async (cartItems) => {
    try {
      const orderRef = await firestore()
        .collection('orders')
        .add({
          items: cartItems.map(item => ({
            name: item.data.name,
            price: item.data.price,
            quantity: item.count,
            imageUrl: item.data.imageUrl,
          })),
          total: totalPrice,
          createdAt: firestore.FieldValue.serverTimestamp(),
          status: 'received',
          party: selectedParty ? firestore().collection('parties').doc(selectedParty.id) : null,
        });
  
      console.log('Order added!', orderRef.id);
  
      const batch = firestore().batch();
      cartItems.forEach(item => {
        const itemRef = firestore().collection('items').doc(item.id);
        batch.update(itemRef, {
          quantity: firestore.FieldValue.increment(-item.count),
        });
      });
  
      await batch.commit();
      console.log('Items quantity updated!');
  
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order: ', error);
    }
  };
  
  const handleCashPayment = async () => {
    const orderId = await createOrder(cartItems);
    if (orderId) {
      printReceipt(orderId); 
      resetCart();
    }
  };

  const handleCreditPayment = () => {
    setCreditModalVisible(true);
  };

  const handleSelectParty = (party) => {
    setSelectedParty(party);
    setCreditModalVisible(false);
    handleCashPayment();
  };

  const renderCartItem = ({item}) =>
    item.count > 0 && (
      <View style={styles.cartItemContainer}>
        <Image source={{uri: item.data.imageUrl}} style={styles.itembillImage} />
        <Text style={styles.billitemName}>{item.data.name}</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            onPress={() => decrement(item.id)}
            style={styles.decrement}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{count(item.id)}</Text>
          <TouchableOpacity
            onPress={() => increment(item.id)}
            style={styles.increment}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itembillPrice}>
          {'\u20B9'}
          {item.data.price * item.count}
        </Text>
      </View>
    );

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalSlideAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    setToggleIcon(true);
  };

  const closeModal = () => {
    Animated.timing(modalSlideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
    setToggleIcon(false);
  };

  const modalTranslateY = modalSlideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.login}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('HomeMenu')}>
          <Text style={styles.text}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adminbtn}
          onPress={() => navigation.navigate('AdminLogIn')}>
          <Text style={styles.admintext}>Admin</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
      />
      <FlatList
        style={[styles.flatList]}
        data={rows}
        renderItem={renderRow}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No data available.</Text>
        }
      />
      <Animated.View
        style={[
          styles.cartBar,
          {
            transform: [{translateY: cartBarTranslateY}],
            opacity: cartBarAnimation,
          },
        ]}>
        <View style={styles.outercart}>
          <Icon name="shopping-cart" size={28} color={'white'} />
          <Text style={styles.cartText}>
            {totalItems} Items | {'\u20B9'} {totalPrice}
          </Text>
          <Pressable onPress={openModal}>
            <Icon
              name={toggleIcon ? 'expand-less' : 'expand-more'}
              size={28}
              color={'white'}
            />
          </Pressable>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Pressable
            style={styles.payButton}
            onPress={handleCreditPayment}>
            <Text style={styles.payText}>CREDIT</Text>
          </Pressable>
          <Pressable
            style={styles.payButton}
            onPress={handleCashPayment}>
            <Text style={styles.payText}>CASH</Text>
          </Pressable>
          <Pressable
            style={styles.payButton}
            onPress={() => navigation.navigate('BillDetails')}>
            <Text style={styles.payText}>PAY</Text>
          </Pressable>
        </View>
      </Animated.View>
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {transform: [{translateY: modalTranslateY}]},
            ]}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item, index) => index.toString()}
            />
            <Text style={styles.totalPrice}>
              Total: {'\u20B9'} {totalPrice}
            </Text>
          </Animated.View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={creditModalVisible}
        onRequestClose={() => setCreditModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.creditModalContainer}>
            <Text style={styles.creditModalTitle}>Select Party</Text>
            <ScrollView>
              {parties.map(party => (
                <TouchableOpacity
                  key={party.id}
                  style={styles.partyItem}
                  onPress={() => handleSelectParty(party)}>
                  <Text style={styles.partyName}>{party.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCreditModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  login: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  btn: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  adminbtn: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  admintext: {
    color: 'white',
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderColor: 'gray',
    borderWidth: 1,
  },
  flatList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  itemContainer: {
    backgroundColor: 'white',
    margin: 5,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  itemimg: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  itemDetails: {
    alignItems: 'center',
    marginTop: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: 'gray',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  outercart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cartText: {
    color: 'white',
    fontSize: 16,
  },
  payButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    flex: 1,
    alignItems: 'center',
  },
  payText: {
    color: 'white',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'red',
  },
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itembillImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  billitemName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decrement: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  countText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  increment: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,
  },
  itembillPrice: {
    fontSize: 16,
    marginLeft: 10,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  creditModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  creditModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  partyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  partyName: {
    fontSize: 16,
  },
});

export default HomeMenu;
