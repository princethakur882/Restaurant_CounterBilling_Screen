import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrdersReceived = ({ orders, handleAccept, handleCancel }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

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

        {isExpanded && (
          <FlatList
            data={item.data.items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderOrderProduct}
          />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAccept(item.orderId)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item.orderId)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
        data={orders.filter(order => order.data.status === 'received')}
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
    backgroundColor: '#FFF2E5',
    margin: 10,
    borderColor: '#FF7722',
    borderWidth: 1,
    shadowColor: '#FF7722',
    shadowOpacity: 0.3,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#2E7D32',
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFD5B0',
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
    color: '#333',
  },
  expandButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    // padding: 5,
  },
  cartText: {
    color: '#333',
    marginTop: 5,
  },
});

export default OrdersReceived;
