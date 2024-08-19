import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OrderCompleted from '../OrderTabs/Completed';
import OrdersReceived from '../OrderTabs/Received';
import PendingOrder from '../OrderTabs/Pending';




// Define Tab Navigator
const Tab = createMaterialTopTabNavigator();

// Define TabLabel component
const TabLabel = ({ title, count, isActive }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={[styles.tabLabelText, isActive && styles.tabLabelActive]}>
      {title}
    </Text>
    {count > 0 && (
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{count}</Text>
      </View>
    )}
  </View>
);

// Define MyTabs component
const MyTabs = () => {
  const [orders, setOrders] = useState([]);
  const [receivedCount, setReceivedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getAllOrders();
  }, []);

  const getAllOrders = async () => {
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
    
    setOrders(tempData);
    setReceivedCount(
      tempData.filter(order => order.data.status === 'received').length
    );
    setPendingCount(
      tempData.filter(order => order.data.status === 'pending').length
    );
  };
  

  const handleAccept = async orderId => {
    await firestore()
      .collection('orders')
      .doc(orderId)
      .update({ status: 'pending' });
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { ...order, data: { ...order.data, status: 'pending' } }
          : order
      )
    );
    setReceivedCount(prevCount => prevCount - 1);
    setPendingCount(prevCount => prevCount + 1);
  };

  const handleCancel = async orderId => {
    await firestore()
      .collection('orders')
      .doc(orderId)
      .update({ status: 'canceled' });
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { ...order, data: { ...order.data, status: 'canceled' } }
          : order
      )
    );
    setReceivedCount(prevCount => prevCount - 1);
  };

  const handleComplete = async orderId => {
    await firestore()
      .collection('orders')
      .doc(orderId)
      .update({ status: 'completed' });
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { ...order, data: { ...order.data, status: 'completed' } }
          : order
      )
    );
    setPendingCount(prevCount => prevCount - 1);
  };

  const handleRefund = async orderId => {
    await firestore()
      .collection('orders')
      .doc(orderId)
      .update({ status: 'refund' });
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { ...order, data: { ...order.data, status: 'refund' } }
          : order
      )
    );
  };
  
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Received"
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel
              title="Received"
              count={receivedCount}
              isActive={focused}
            />
          ),
        }}
      >
        {props => (
          <OrdersReceived
            {...props}
            orders={orders}
            handleAccept={handleAccept}
            handleCancel={handleCancel}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Preparation"
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel
              title="Preparation"
              count={pendingCount}
              isActive={focused}
            />
          ),
        }}
      >
        {props => (
          <PendingOrder
            {...props}
            orders={orders}
            handleComplete={handleComplete}
            setOrders={setOrders}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Completed"
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel
              title="Completed"
              count={
                orders.filter(order => order.data.status === 'completed').length
              }
              isActive={focused}
            />
          ),
        }}
      >
        {props => <OrderCompleted {...props} orders={orders} handleRefund={handleRefund} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabLabelText: {
    fontSize: 14,
    color: '#FF7722',
  },
  tabLabelActive: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF7722',
  },
  countBadge: {
    backgroundColor: '#FF7722',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  countBadgeText: {
    color: 'white',
    fontSize: 12,
  },
});

export default MyTabs;