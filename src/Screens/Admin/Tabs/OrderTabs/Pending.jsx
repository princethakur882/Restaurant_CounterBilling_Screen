import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/AntDesign';

const PendingOrder = ({ orders, handleComplete, setOrders }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleCompleteItem = async (orderId, itemId) => {
    const orderRef = firestore().collection('orders').doc(orderId);

    const orderSnapshot = await orderRef.get();
    const currentItems = orderSnapshot.data().items;

    const updatedItems = currentItems.map(item =>
      item.id === itemId ? { ...item, completed: true } : item,
    );

    // Sort the updated items so that completed ones are at the top
    const sortedItems = updatedItems.sort((a, b) => b.completed - a.completed);

    await orderRef.update({ items: sortedItems });

    // Update the state locally
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.orderId === orderId) {
          const allCompleted = sortedItems.every(item => item.completed);
          const updatedOrder = {
            ...order,
            data: { ...order.data, items: sortedItems },
          };
          if (allCompleted) {
            handleComplete(orderId);
          }
          return updatedOrder;
        }
        return order;
      }),
    );
  };

  const handleDeleteItem = async (orderId, itemId) => {
    const orderRef = firestore().collection('orders').doc(orderId);

    const orderSnapshot = await orderRef.get();
    const currentItems = orderSnapshot.data().items;

    const updatedItems = currentItems.filter(item => item.id !== itemId);
    const updatedTotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await orderRef.update({ items: updatedItems, total: updatedTotal });

    // Update the state locally
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.orderId === orderId) {
          return {
            ...order,
            data: { ...order.data, items: updatedItems, total: updatedTotal },
          };
        }
        return order;
      }),
    );
  };

  const toggleExpandOrder = orderId => {
    setExpandedOrder(prevOrderId => (prevOrderId === orderId ? null : orderId));
  };

  const renderOrderItem = ({ item }) => {
    const isExpanded = expandedOrder === item.orderId;

    return (
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
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

        {isExpanded ? (
          <FlatList
            data={item.data.items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderOrderProduct(item.orderId)}
          />
        ) : (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleComplete(item.orderId)}
          >
            <Text style={styles.completeButtonText}>Complete Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderOrderProduct =
    orderId =>
    ({ item }) => (
      <View
        style={[
          styles.itemView,
          { backgroundColor: item.completed ? '#95e381' : '#E74C3C' },
        ]}
      >
        <CheckBox
          value={item.completed}
          onValueChange={() => handleCompleteItem(orderId, item.id)}
          style={styles.itemCheckbox}
        />
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text
            style={[
              styles.nameText,
              { color: item.completed ? '#2E7D32' : '#fff' },
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.detailText,
              { color: item.completed ? '#2E7D32' : '#fff' },
            ]}
          >
            {'Price: ' + item.price + ', Qty: ' + item.quantity}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteItem(orderId, item.id)}
          style={styles.deleteButton}
        >
          <Icons name="minuscircle" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        style={{ marginBottom: 60 }}
        data={orders.filter(order => order.data.status === 'pending')}
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cartText: {
    marginTop: 5,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#388E3C',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFE0B2',
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
    fontSize: 16,
    color: '#424242',
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
  },
  itemInfo: {
    flex: 1,
  },
  itemCheckbox: {
    marginRight: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  expandButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
});

export default PendingOrder;
