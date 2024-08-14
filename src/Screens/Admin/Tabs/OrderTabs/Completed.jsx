import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderCompleted = ({ orders }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(prevOrderId => (prevOrderId === orderId ? null : orderId));
  };

  const handleRefund = async (orderId) => {
    try {
      // Update the status of the order to 'refund'
      await firestore().collection('orders').doc(orderId).update({
        status: 'refund',
      });
      console.log(`Order ${orderId} status updated to 'refund'`);
    } catch (error) {
      console.error('Error updating order status: ', error);
    }
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
              color="#000"
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
          style={[styles.refundButton, isExpanded && styles.expandedRefundButton]}
          onPress={() => handleRefund(item.orderId)}
        >
          <Text style={styles.refundButtonText}>Refund</Text>
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
        style={{ marginBottom: 60 }}
        data={orders.filter(order => order.data.status === 'completed')}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  orderItem: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#173B45',
    margin: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  dateText: {
    fontSize: 14,
    color: '#fff',
  },
  refundButton: {
    height: 40,
    borderRadius: 5,
    backgroundColor: 'red',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  expandedRefundButton: {
    marginTop: 10, // Adjust spacing if needed
  },
  refundButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  expandButton: {
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  cartText: {
    color: '#fff',
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: "#B43F3F",
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

export default OrderCompleted;
