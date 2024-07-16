

import React, { useContext, useEffect, useRef } from 'react';
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
} from 'react-native';
import { ApiContext } from '../../Context/ApiProvider';
import AddToCartButton from './CartButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeMenu = ({ navigation }) => {
  const { filteredData, searchQuery, setSearchQuery, cartItems, totalPrice } = useContext(ApiContext);
  const { width: screenWidth } = useWindowDimensions();
  const cartBarAnimation = useRef(new Animated.Value(0)).current;

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

  return (
    <View style={styles.container}>
      <View style={styles.login}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('HomeMenu')}>
          <Text style={styles.text}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adminbtn} onPress={() => navigation.navigate('AdminLogIn')}>
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
        ListEmptyComponent={<Text style={styles.emptyText}>No data available.</Text>}
      />
      <Animated.View
        style={[
          styles.cartBar,
          {
            transform: [{ translateY: cartBarTranslateY }],
            opacity: cartBarAnimation,
          },
        ]}
      >
        <View style={styles.outercart}>
          <Icon name="shopping-cart" size={28} color={'white'} />
          <Text style={styles.cartText}>{totalItems} Items | {'\u20B9'} {totalPrice}</Text>
        </View>
        <Pressable style={styles.payButton} onPress={() => navigation.navigate('BillDetails')}>
          <Text style={styles.payText}>PAY</Text>
        </Pressable>
      </Animated.View>
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
    zIndex: 1,
  },
  itemContainer: {
    width: 120,
    margin: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  itemPrice: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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
    margin: 10,
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
  },
  payText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FF7722',
  },
});

export default HomeMenu;
