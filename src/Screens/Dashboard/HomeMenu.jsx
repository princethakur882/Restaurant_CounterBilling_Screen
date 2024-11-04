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
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import Icons from 'react-native-vector-icons/FontAwesome';
import AddToCartButton from '../DefaultMenu/CartButton';
import {ApiContext} from '../../Context/ApiProvider';
import {format} from 'date-fns';

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
  const [selectedButton, setSelectedButton] = useState(null);

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

  const buttonData = [
    {label: 'Veg', color: '#4CAF50'},
    {label: 'Non-Veg', color: '#F44336'},
    {label: 'Soup', color: '#FF9800'},
    {label: 'Rice', color: '#FFEB3B'},
    {label: 'Thali', color: '#2196F3'},
    {label: 'Drinks', color: '#9C27B0'},
  ];

  const [filteredItems, setFilteredItems] = useState([]);  

// Function to handle button press and fetch items by category
const handlePress = async (category) => {
  try {
    
    const itemsSnapshot = await firestore()
      .collection('items')  
      .where('category', '==', category) 
      .get();

    const items = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setFilteredItems(items);
  } catch (error) {
    console.error('Error fetching items:', error);
  }
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


  const generateUniqueOrderId = async () => {
    let orderId;
    let isUnique = false;
    while (!isUnique) {
      orderId = Math.floor(100000 + Math.random() * 900000).toString();
      const orderRef = await firestore().collection('orders').doc(orderId).get();
      isUnique = !orderRef.exists;
    }
    return orderId;
  };
  

  const createOrder = async (cartItems,partyData) => {
    try {
      const orderId = await generateUniqueOrderId();
      const timestamp = firestore.FieldValue.serverTimestamp();
      const formattedTimestamp = format(new Date(), 'dd/MM/yyyy, hh:mm:ss a');

      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.data.name,
          price: item.data.price,
          quantity: item.count,
          imageUrl: item.data.imageUrl,
          completed: false,
        })),
        total: totalPrice,
        createdAt: formattedTimestamp,
        status: 'received',
        party: partyData ? partyData : null,
      };
      

      
      await firestore().collection('orders').doc(orderId).set(orderData);
      console.log('Order added with ID:', orderId,'--------->', orderData.party);

      // Update the quantity of items in the items collection
      const batch = firestore().batch();
      cartItems.forEach(item => {
        const itemRef = firestore().collection('items').doc(item.id);
        batch.update(itemRef, {
          quantity: firestore.FieldValue.increment(-item.count),
        });
      });

      await batch.commit();
      return orderId;
    } catch (error) {
      console.error('Error creating order: ', error);
      throw new Error('Order creation failed');
    }
  };

  const handleCashPayment = async (partyData) => {
    const orderId = await createOrder(cartItems,partyData);
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
    handleCashPayment(party);
  };

  const renderCartItem = ({item}) =>
    item.count > 0 && (
      <View key={item.id} style={styles.cartItemContainer}>
        <Image
          source={{uri: item.data.imageUrl}}
          style={styles.itembillImage}
        />
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
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('HomeOption')}>
          <Icons
            name="user"
            size={28}
            color={'white'}
            style={{paddingVertical: 6}}
          />
        </TouchableOpacity>
      </View>
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
        style={[styles.scrollbutton, {backgroundColor:'#FF7722'}]}
        >
          <Icon name="filter-list" size={24} color="#000" />
        </TouchableOpacity>
        {buttonData.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.scrollbutton,
              {
                borderColor:
                  selectedButton === index ? button.color : '#f0f0f0',
              },
            ]}
            onPress={() => handlePress(index)}>
            <Text style={styles.scrollbuttonText}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}
      <FlatList
        style={[styles.flatList]}
        data={rows}
        renderItem={renderRow}
        keyExtractor={(item, index) => item[0].id.toString()}
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
          <Pressable style={styles.payButton} onPress={handleCreditPayment}>
            <Text style={styles.payText}>CREDIT</Text>
          </Pressable>
          <Pressable style={styles.payButton} onPress={handleCashPayment}>
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
              <Icon name="cancel" size={30} color="gray" />
            </TouchableOpacity>
            <ScrollView>
              {cartItems.map(item => renderCartItem({item}))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={creditModalVisible}
        onRequestClose={() => setCreditModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.creditModalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCreditModalVisible(false)}>
              <Icon name="cancel" size={25} color="gray" />
            </TouchableOpacity>
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
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  login: {
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    backgroundColor: '#FF7722',
    width: '10%',
    borderRadius: 50,
    margin: 10,
    alignItems: 'center',
  },
  restn: {
    color: '#FF7722',
    margin: 10,
    fontWeight: '500',
    fontSize: 28,
  },
  flatList: {
    paddingHorizontal: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchBar: {
    height: 40,
    // paddingHorizontal:130,
    width: '80%',
    paddingVertical: 5,
    margin: 10,
    backgroundColor: '#fff',
    borderColor: '#FF7722',
    borderWidth: 1,
    borderRadius: 8,
    elevation: 2,
  },
  itemContainer: {
    width: 120,
    margin: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  itemimg: {
    width: 100,
    height: 80,
    resizeMode: 'cover',
    marginBottom: 8,
    borderRadius: 5,
  },
  itemDetails: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  billitemName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#000',
    width: '30%',
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  itembillPrice: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    width: '15%',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    // margin: 1,
    marginBottom: 0,
    backgroundColor: '#FF7722',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    elevation: 2,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlign: 'center',
    alignItems: 'center',
    height: 50,
  },
  outercart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    paddingLeft: 5,
  },
  payButton: {
    height: 35,
    backgroundColor: 'white',
    padding: 5,
    paddingTop: 8,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  payText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FF7722',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 50,
    // paddingBottom: 60,
    paddingTop: 50,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    // elevation: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  creditModalContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    // elevation: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cartItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  counterContainer: {
    borderWidth: 1.5,
    borderColor: '#FF7722',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  decrement: {
    padding: 5,
  },
  increment: {
    padding: 5,
  },
  buttonText: {
    color: '#FF7722',
    fontSize: 16,
    fontWeight: '900',
    paddingHorizontal: 8,
  },
  countText: {
    color: '#FF7722',
    padding: 8,
    backgroundColor: '#fff',
    fontSize: 15.5,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 6,
  },
  totalContainer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itembillImage: {
    width: '15%',
    height: 45,
    borderRadius: 5,
    margin: 5,
  },
  creditModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
  },
  partyItem: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FF8225',
    margin: 5,
    color: 'black',
  },
  partyName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 1,
    padding: 1,
    borderRadius: 5,
    alignItems: 'flex-end',
  },
  scrollContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  scrollbutton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
    borderWidth:2
  },
  scrollbuttonText: {
    // margin: 5,
    color: '#000',
    fontSize: 15,
  },
});

export default HomeMenu;
