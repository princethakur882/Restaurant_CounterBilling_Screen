import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const OrdersReceived = ({ orders, handleAccept }) => {
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.totalText}>Order No: {item.orderId}</Text>
      <FlatList
        data={item.data.items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderProduct}
      />
      <Text style={styles.totalText}>Total: {item.data.total}</Text>
      <Text style={styles.dateText}>
        Date: {item.data.createdAt?.toDate().toString()}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.orderId)}>
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineButton} onPress={() => {}}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
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
        style={{ marginBottom: 60 }}
        data={orders.filter(order => order.data.status === 'received')}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderItem}
      />
    </View>
  );
};

const PendingOrder = ({ orders, handleCancel, handleComplete }) => {
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.totalText}>Order No: {item.orderId}</Text>
      <FlatList
        data={item.data.items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderProduct}
      />
      <Text style={styles.totalText}>Total: {item.data.total}</Text>
      <Text style={styles.dateText}>
        Date: {item.data.createdAt?.toDate().toString()}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.completeButton} onPress={() => handleComplete(item.orderId)}>
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item.orderId)}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
        style={{ marginBottom: 60 }}
        data={orders.filter(order => order.data.status === 'pending')}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderItem}
      />
    </View>
  );
};

const OrderCompleted = ({ orders }) => {
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.totalText}>Order No: {item.orderId}</Text>
      <FlatList
        data={item.data.items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderProduct}
      />
      <Text style={styles.totalText}>Total: {item.data.total}</Text>
      <Text style={styles.dateText}>
        Date: {item.data.createdAt?.toDate().toString()}
      </Text>
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
        style={{ marginBottom: 60 }}
        data={orders.filter(order => order.data.status === 'completed')}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderItem}
      />
    </View>
  );
};

const TabLabel = ({ title, count, isActive }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={[styles.tabLabelText, isActive && styles.tabLabelActive]}>{title}</Text>
    {count > 0 && (
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{count}</Text>
      </View>
    )}
  </View>
);

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
      tempData.push({
        orderId: documentSnapshot.id,
        data: documentSnapshot.data(),
      });
    });
    setOrders(tempData);
    setReceivedCount(tempData.filter(order => order.data.status === 'received').length);
    setPendingCount(tempData.filter(order => order.data.status === 'pending').length);
  };

  const handleAccept = async (orderId) => {
    await firestore().collection('orders').doc(orderId).update({ status: 'pending' });
    setOrders(prevOrders => prevOrders.map(order => 
      order.orderId === orderId ? { ...order, data: { ...order.data, status: 'pending' } } : order
    ));
    setReceivedCount(prevCount => prevCount - 1);
    setPendingCount(prevCount => prevCount + 1);
  };

  const handleCancel = async (orderId) => {
    await firestore().collection('orders').doc(orderId).update({ status: 'canceled' });
    setOrders(prevOrders => prevOrders.map(order => 
      order.orderId === orderId ? { ...order, data: { ...order.data, status: 'canceled' } } : order
    ));
    setPendingCount(prevCount => prevCount - 1);
  };

  const handleComplete = async (orderId) => {
    await firestore().collection('orders').doc(orderId).update({ status: 'completed' });
    setOrders(prevOrders => prevOrders.map(order => 
      order.orderId === orderId ? { ...order, data: { ...order.data, status: 'completed' } } : order
    ));
    setPendingCount(prevCount => prevCount - 1);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#FF7722',
        tabBarInactiveTintColor: '#777',
        tabBarLabelStyle: { fontSize: 15, fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: 'lightgray' },
        tabBarIndicatorStyle: { backgroundColor: '#FF7722', height: 4 },
        tabBarLabel: ({ color, focused }) => {
          let title;
          let count;
          switch (route.name) {
            case 'Received':
              title = 'RECEIVED';
              count = receivedCount;
              break;
            case 'Pending':
              title = 'PENDING';
              count = pendingCount;
              break;
            case 'Completed':
              title = 'COMPLETED';
              count = 0;
              break;
          }
          return <TabLabel title={title} count={count} isActive={focused} />;
        },
      })}>
      <Tab.Screen name="Received">
        {() => <OrdersReceived orders={orders} handleAccept={handleAccept} />}
      </Tab.Screen>
      <Tab.Screen name="Pending">
        {() => <PendingOrder orders={orders} handleCancel={handleCancel} handleComplete={handleComplete} />}
      </Tab.Screen>
      <Tab.Screen name="Completed">
        {() => <OrderCompleted orders={orders} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MyTabs;

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
  acceptButton: {
    width: '40%',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'green',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginLeft: 14,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  declineButton: {
    width: '40%',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'red',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  declineButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  completeButton: {
    width: '40%',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'blue',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginLeft: 14,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  cancelButton: {
    width: '40%',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'red',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  pendingHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
    backgroundColor: 'lightgray',
  },
  countBadge: {
    backgroundColor: '#FF7722',
    borderRadius: 50,
    padding: 5,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width:30,
  },
  countBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize:18,
  },
  tabLabelText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#777', 
  },
  tabLabelActive: {
    color: '#FF7722',
  },
});
