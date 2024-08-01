import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const PartyDetails = ({ route }) => {
  const { partyId } = route.params;
  const [party, setParty] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchPartyDetails = async () => {
      const partyDoc = await firestore().collection('parties').doc(partyId).get();
      setParty({ id: partyDoc.id, ...partyDoc.data() });
    };

    const fetchPartyOrders = async () => {
      const ordersSnapshot = await firestore()
        .collection('orders')
        .where('party', '==', firestore().collection('parties').doc(partyId))
        .get();
      const fetchedOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
    };

    fetchPartyDetails();
    fetchPartyOrders();
  }, [partyId]);

  if (!party) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.itemText}>Name: {party.name}</Text>
      <Text style={styles.itemText}>Address: {party.address}</Text>
      <Text style={styles.itemText}>Phone Number: {party.phoneNumber}</Text>
      <Text style={styles.itemText}>GST Number: {party.gstNumber}</Text>
      <Text style={styles.itemText}>Due Amount: {party.dueAmount}</Text>
      
      <Text style={styles.orderHeader}>Orders:</Text>
      {orders.length > 0 ? (
        orders.map(order => (
          <View key={order.id} style={styles.orderContainer}>
            <Text style={styles.orderText}>Order ID: {order.id}</Text>
            <Text style={styles.orderText}>Status: {order.status}</Text>
            <Text style={styles.orderText}>Total: {'\u20B9'}{order.total}</Text>
            <Text style={styles.orderText}>Created At: {order.createdAt?.toDate().toLocaleString()}</Text>
            <Text style={styles.orderText}>Items:</Text>
            {order.items.map((item, index) => (
              <Text key={index} style={styles.orderItemText}>
                {item.name} - {item.quantity} x {'\u20B9'}{item.price}
              </Text>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.noOrdersText}>No orders found for this party.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  itemText: {
    fontSize: 18,
    marginBottom: 10,
  },
  orderHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  orderContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
  },
  orderItemText: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default PartyDetails;
