import React, { useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { ApiContext } from '../../Context/ApiProvider'; 
const BillDetails = ({ navigation }) => {
  const { cartItems, totalPrice, increment, decrement, count } = useContext(ApiContext);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No items in the cart.</Text>}
        ListFooterComponent={
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: {'\u20B9'}{totalPrice}</Text>
          </View>
        }
      />
      <Pressable
        style={styles.cartpay}
        onPress={() => navigation.navigate('Payment', { cartItems, totalPrice })}
      >
        <Text style={styles.payText}>PAY</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  itemContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
  },
  counterContainer: {
    borderWidth: 1.5,
    borderColor: '#FF7722',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
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
  cartpay: {
    textAlign: 'center',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    margin: 10,
    backgroundColor: '#FF7722',
    borderRadius: 8,
    elevation: 2,
    zIndex: 1,
    height: 50,
  },
  payText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default BillDetails;


