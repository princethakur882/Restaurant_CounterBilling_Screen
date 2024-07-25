import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const OrdersRecevied = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAllOrders();
  }, []);

  const getAllOrders = async () => {
    firestore()
      .collection('orders')
      .get()
      .then(querySnapshot => {
        console.log('Total orders: ', querySnapshot.size);
        let tempData = [];
        querySnapshot.forEach(documentSnapshot => {
          tempData.push({
            orderId: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setOrders(tempData);
      });
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
    <Text style={styles.totalText}>Order No: {item.orderId}</Text>
      <FlatList
        data={item.data.items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderProduct}
      />
      <Text style={styles.totalText}>Total: {item.data.total}</Text>
      <Text style={styles.dateText}>Date: {item.data.createdAt?.toDate().toString()}</Text>
    </View>
  );

  const renderOrderProduct = ({ item }) => (
    <View style={styles.itemView}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.nameText}>
          {'Price: ' + item.price + ', Qty: ' + item.quantity}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
      style={{marginBottom:60}}
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderItem}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  orderItem: {
    width: '90%',
    borderRadius: 10,
    elevation: 5,
    alignSelf: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 10,
    padding: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  itemView: {
    margin: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 20,
    marginTop: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});

export default OrdersRecevied;