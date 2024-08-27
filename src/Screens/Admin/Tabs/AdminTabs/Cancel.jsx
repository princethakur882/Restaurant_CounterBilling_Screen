import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderCanceled = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const snapshot = await firestore().collection('orders').get();
      let tempData = [];

      snapshot.forEach(documentSnapshot => {
        const data = documentSnapshot.data();
        
        // Convert Firestore timestamp to Date or formatted string
        if (data.createdAt && data.createdAt._seconds) {
          data.createdAt = new Date(data.createdAt._seconds * 1000).toLocaleString();
        }

        tempData.push({
          orderId: documentSnapshot.id,
          data: data,
        });
      });

      setOrders(tempData.filter(order => order.data.status === 'canceled'));
    } catch (error) {
      console.error('Error fetching orders: ', error);
    }
  };

  const handleReactivate = async (orderId) => {
    try {
      // Example action: Mark the order as 'pending' or handle it as needed
      await firestore().collection('orders').doc(orderId).update({ status: 'pending' });
      console.log(`Order ${orderId} status updated to 'pending'`);
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId
            ? { ...order, data: { ...order.data, status: 'pending' } }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status: ', error);
    }
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(prevOrderId => (prevOrderId === orderId ? null : orderId));
  };

  const renderOrderItem = ({ item }) => {
    const isExpanded = expandedOrder === item.orderId;

    return (
      <View style={styles.orderItem}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.totalText}>Order No: #{item.orderId}</Text>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleExpandOrder(item.orderId)}
          >
            <Icon
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color="#FF7722"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.cartText}>
          {item.data.items.length} Items | {'\u20B9'} {item.data.total}
        </Text>
        <Text style={styles.dateText}>{item.data.createdAt}</Text>

        {isExpanded && (
          <FlatList
            data={item.data.items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderOrderProduct}
          />
        )}

        <TouchableOpacity
          style={[styles.reactivateButton, isExpanded && styles.expandedReactivateButton]}
          onPress={() => handleReactivate(item.orderId)}
        >
          <Text style={styles.reactivateButtonText}>Reactivate</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
    backgroundColor: '#FFF2E5',
  },
  orderItem: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#FFF2E5',
    margin: 10,
    borderColor: '#FF7722',
    borderWidth: 1,
    shadowColor: '#FF7722',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  reactivateButton: {
    backgroundColor: '#3498DB',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  expandedReactivateButton: {
    marginTop: 10,
  },
  reactivateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  expandButton: {
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  cartText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: "#4c81ba",
    borderRadius: 10,
    padding: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  nameText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default OrderCanceled;
