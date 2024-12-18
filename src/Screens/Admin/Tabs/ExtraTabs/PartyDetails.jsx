import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const PartyDetails = ({ route }) => {
  const { partyId } = route.params;
  const [party, setParty] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [creditInput, setCreditInput] = useState(''); 
  const [paymentReceived, setPaymentReceived] = useState(false); 

  useEffect(() => {
    const fetchPartyDetails = async () => {
      try {
        const partyDoc = await firestore().collection('parties').doc(partyId).get();
        if (partyDoc.exists) {
          setParty({ id: partyDoc.id, ...partyDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching party details:', error);
      }
    };

    const fetchPartyOrders = async () => {
      try {
        const ordersSnapshot = await firestore()
          .collection('orders')
          .where('party.id', '==', partyId)
          .get();

        const fetchedOrders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);

        // Calculate total amount of all orders
        const totalAmount = fetchedOrders.reduce((sum, order) => sum + order.total, 0);
        setTotalOrderAmount(totalAmount);
      } catch (error) {
        console.error('Error fetching party orders:', error);
      }
    };

    fetchPartyDetails();
    fetchPartyOrders();
  }, [partyId]);

  // Calculate due amount and update in Firestore
  useEffect(() => {
    const updateDueAmount = async () => {
      if (party && totalOrderAmount !== 0) {
        const dueAmount = totalOrderAmount - (party.creditAmount || 0);
        const updatedDueAmount = Math.max(dueAmount);

        await firestore().collection('parties').doc(partyId).update({
          dueAmount: updatedDueAmount,
        });
        setParty(prev => ({ ...prev, dueAmount: updatedDueAmount }));
      }
    };
    updateDueAmount();
  }, [party, totalOrderAmount]);

  const handlePay = async () => {
    const creditValue = parseFloat(creditInput);
    if (isNaN(creditValue) || creditValue <= 0) {
      i
      Alert.alert('Invalid Input', 'Please enter a valid credit amount.');
      return;
    }

    const updatedCreditAmount = (party.creditAmount || 0) + creditValue;

    const updatedDueAmount = totalOrderAmount - updatedCreditAmount;

    const newDueAmount = Math.max(updatedDueAmount, 0);

    // Update party's credit amount and due amount in Firestore
    await firestore().collection('parties').doc(partyId).update({
      creditAmount: updatedCreditAmount,
      dueAmount: newDueAmount,
    });

    // Update local state
    setParty(prev => ({ ...prev, creditAmount: updatedCreditAmount, dueAmount: newDueAmount, }));
    setCreditInput(''); // Clear the input
    setPaymentReceived(true);

    // Create a "Payment Received" order card
    const paymentOrder = {
      id: `payment-${Date.now()}`,
      status: 'Payment Received',
      total: creditValue,
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [...prev, paymentOrder]);
  };

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
        <Text style={styles.itemText}>Total Order Amount: <Text style={styles.valueText}>{'\u20B9'}{totalOrderAmount}</Text></Text>
        <Text style={styles.itemText}>Credit Amount: <Text style={styles.valueText}>{'\u20B9'}{party.creditAmount || 0}</Text></Text>
        <Text style={styles.itemText}>Due Amount: <Text style={styles.valueText}>{'\u20B9'}{party.dueAmount}</Text></Text>
      </View>

      <View style={styles.paymentContainer}>
        <TextInput
          style={styles.input}
          value={creditInput}
          onChangeText={setCreditInput}
          placeholder="Enter credit amount"
          keyboardType="numeric"
        />
        <Button title="Pay" onPress={handlePay} />
      </View>

      <Text style={styles.orderHeader}>Orders</Text>
      {orders.length > 0 ? (
        orders.map(order => (
          <View key={order.id} style={[
              styles.orderContainer,
              order.status === 'Payment Received' &&
                styles.paymentOrderContainer, 
            ]}>
            <Text style={styles.orderText}>Order ID: <Text style={styles.valueText}>{order.id}</Text></Text>
            <Text style={styles.orderText}>Status: <Text style={styles.valueText}>{order.status}</Text></Text>
            <Text style={styles.orderText}>Total: <Text style={styles.valueText}>{'\u20B9'}{order.total}</Text></Text>
            <Text style={styles.orderText}>Created At: <Text style={styles.valueText}>{order.createdAt}</Text></Text>
            <Text style={styles.orderText}>Items:</Text>
            {order.items && order.items.map((item, index) => (
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
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  paymentOrderContainer: {
    backgroundColor: '#d4edda', 
    borderColor: '#c3e6cb', 
  }
});

export default PartyDetails;
