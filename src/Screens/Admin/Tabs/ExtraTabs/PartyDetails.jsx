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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.partyDetailsContainer}>
        <Text style={styles.headerText}>Party Details</Text>
        <Text style={styles.itemText}>Name: <Text style={styles.valueText}>{party.name}</Text></Text>
        <Text style={styles.itemText}>Address: <Text style={styles.valueText}>{party.address}</Text></Text>
        <Text style={styles.itemText}>Phone Number: <Text style={styles.valueText}>{party.phoneNumber}</Text></Text>
        <Text style={styles.itemText}>GST Number: <Text style={styles.valueText}>{party.gstNumber}</Text></Text>
        <Text style={styles.itemText}>Due Amount: <Text style={styles.valueText}>{party.dueAmount}</Text></Text>
      </View>
      
      <Text style={styles.orderHeader}>Orders</Text>
      {orders.length > 0 ? (
        orders.map(order => (
          <View key={order.id} style={styles.orderContainer}>
            <Text style={styles.orderText}>Order ID: <Text style={styles.valueText}>{order.id}</Text></Text>
            <Text style={styles.orderText}>Status: <Text style={styles.valueText}>{order.status}</Text></Text>
            <Text style={styles.orderText}>Total: <Text style={styles.valueText}>{'\u20B9'}{order.total}</Text></Text>
            <Text style={styles.orderText}>Created At: <Text style={styles.valueText}>{order.createdAt}</Text></Text>
            <Text style={styles.orderText}>Items:</Text>
            {order.items.map((item, index) => (
              <Text key={index} style={styles.orderItemText}>
                <Text style={styles.valueText}>{item.name}</Text> - {item.quantity} x {'\u20B9'}{item.price}
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
    backgroundColor: '#f2f2f2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  partyDetailsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  itemText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  valueText: {
    fontWeight: 'bold',
    color: '#555',
  },
  orderHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  orderContainer: {
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  orderItemText: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3,
    color: '#555',
  },
  noOrdersText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default PartyDetails;
