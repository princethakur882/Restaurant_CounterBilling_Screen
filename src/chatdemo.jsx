import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { ApiContext } from '../../Context/ApiProvider';
import AddToCartButton from './CartButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeMenu = ({ navigation }) => {
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
  const { width: screenWidth } = useWindowDimensions();
  const cartBarAnimation = useRef(new Animated.Value(0)).current;
  const modalSlideAnimation = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [toggleIcon, setToggleIcon] = useState(false);

  const totalItems = cartItems.reduce((acc, curr) => {
    return acc + curr.count;
  }, 0);

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

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.data.imageUrl }} style={styles.itemimg} />
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

  const renderRow = ({ item }) => (
    <View style={styles.rowContainer}>
      {item.map(i => (
        <View key={i.id} style={{ flex: 1 }}>
          {renderItem({ item: i })}
        </View>
      ))}
    </View>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemContainer}>
      <Text style={styles.itemName}>{item.data.name}</Text>
      <View style={styles.counterContainer}>
        <TouchableOpacity onPress={() => decrement(item.id)} style={styles.decrement}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.countText}>{count(item.id)}</Text>
        <TouchableOpacity onPress={() => increment(item.id)} style={styles.increment}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.itemPrice}>{'\u20B9'}{item.data.price * item.count}</Text>
    </View>
  );

  const toggleIconPress = () => {
    setToggleIcon(!toggleIcon);
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalSlideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalSlideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
    toggleIconPress(); // Reset icon when modal is closed
  };

  const modalTranslateY = modalSlideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0], // Adjust the outputRange values as per your requirement
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
        style={styles.flatList}
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
            transform: [{ translateY: cartBarTranslateY }],
            opacity: cartBarAnimation,
          },
        ]}>
        <View style={styles.outercart}>
          <Icon name="shopping-cart" size={28} color={'white'} />
          <Text style={styles.cartText}>
            {totalItems} Items | {'\u20B9'} {totalPrice}
          </Text>
          <Pressable onPress={openModal}>
            <Icon name={toggleIcon ? "expand-less" : "expand-more"} size={28} color={'white'} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Pressable
            style={styles.payButton}
            onPress={() => {
              printReceipt();
              resetCart();
            }}>
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
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalTranslateY }] }]}>
            <Pressable
              style={styles.closeButton}
              onPress={closeModal}>
              <Icon name="close" size={28} color={'white'} />
            </Pressable>
            <ScrollView style={styles.scrollView}>
              {cartItems.map((item) => (
                renderCartItem({ item })
              ))}
            </ScrollView>
            
            <View style={styles.modalTotalContainer}>
              <Text style={styles.cartText}>
                {totalItems} Items | {'\u20B9'} {totalPrice}
              </Text>
            </View>
          </Animated.View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    backgroundColor: '#FF7722',
    height: 40,
    width: '45%',
    borderRadius: 10,
    margin: 10,
  },
  adminbtn: {
    backgroundColor: '#FFF',
    height: 40,
    width: '45%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF7722',
    margin: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    paddingTop: 8,
  },
  admintext: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF7722',
    textAlign: 'center',
    paddingTop: 8,
  },
  flatList: {
    paddingTop: 60,
    paddingHorizontal: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    padding: 10,
    margin: 10,
    backgroundColor: '#fff',
    borderColor: '#FF7722',
    borderWidth: 1,
    borderRadius: 8,
    elevation: 2,
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 5,
  },
  itemimg: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  itemDetails: {
    padding: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7722',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#FF7722',
    borderRadius: 8,
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
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  payText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FF7722',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end', // Align items to the bottom
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%', // Full width
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF7722',
    padding: 5,
    borderRadius: 5,
  },
  scrollView: {
    marginBottom: 20,
  },
  modalTotalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 10,
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
    shadowOffset: { width: 0, height: 2 },
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
});

export default HomeMenu;
