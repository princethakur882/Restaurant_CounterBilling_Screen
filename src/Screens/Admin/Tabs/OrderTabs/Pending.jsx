// PendingOrder.js

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
import ProgressBar from 'react-native-progress/Bar';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PendingOrder = ({ orders, handleComplete, setOrders }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const calculateProgress = items => {
    const completedItems = items.filter(item => item.completed).length;
    return (completedItems / items.length) * 100;
  };

  const handleCompleteItem = async (orderId, itemId) => {
    const orderRef = firestore().collection('orders').doc(orderId);

    const orderSnapshot = await orderRef.get();
    const currentItems = orderSnapshot.data().items;

    const updatedItems = currentItems.map(item =>
      item.id === itemId ? { ...item, completed: true } : item,
    );

    await orderRef.update({ items: updatedItems });

    // Update the state locally
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.orderId === orderId) {
          const allCompleted = updatedItems.every(item => item.completed);
          const updatedOrder = {
            ...order,
            data: { ...order.data, items: updatedItems },
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

  const toggleExpandOrder = orderId => {
    setExpandedOrder(prevOrderId => (prevOrderId === orderId ? null : orderId));
  };

  const renderOrderItem = ({ item }) => {
    const progress = calculateProgress(item.data.items);
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
    ({ item }) =>
      (
        <View style={styles.itemView}>
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.nameText}>
              {'Price: ' + item.price + ', Qty: ' + item.quantity}
            </Text>
            <View style={styles.itemActions}>
              <ProgressBar
                styleAttr="Horizontal"
                indeterminate={false}
                progress={item.completed ? 1 : 0}
                color="green"
                style={styles.itemProgressBar}
              />
              {!item.completed && (
                <TouchableOpacity
                  style={styles.completeItemButton}
                  onPress={() => handleCompleteItem(orderId, item.id)}
                >
                  <Text style={styles.completeButtonText}>Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
  cartText: {
    color: '#fff',
  },
  completeButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#B43F3F',
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
  itemInfo: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemProgressBar: {
    flex: 1,
  },
  completeItemButton: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  expandButton: {
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
});

export default PendingOrder;
