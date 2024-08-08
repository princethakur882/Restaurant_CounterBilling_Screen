import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ProgressBar from 'react-native-progress/Bar';

const Tab = createMaterialTopTabNavigator();

const OrdersReceived = ({orders, handleAccept}) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleExpandOrder = orderId => {
    setExpandedOrder(prevOrderId => (prevOrderId === orderId ? null : orderId));
  };

  const renderOrderItem = ({item}) => {
    const isExpanded = expandedOrder === item.orderId;
    return (
      <TouchableOpacity onPress={() => toggleExpandOrder(item.orderId)}>
        <View style={styles.orderItem}>
          <Text style={styles.totalText}>Order No: {item.orderId}</Text>
          <Text style={styles.totalText}>Total: {item.data.total}</Text>
          <Text style={styles.dateText}>
            Date: {item.data.createdAt?.toDate().toString()}
          </Text>
          {isExpanded && (
            <FlatList
              data={item.data.items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderOrderProduct}
            />
          )}
          <TouchableOpacity
            style={[
              styles.acceptButton,
              isExpanded && styles.acceptButtonExpanded,
            ]}
            onPress={() => handleAccept(item.orderId)}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderProduct = ({item}) => (
    <View style={styles.itemView}>
      <Image source={{uri: item.imageUrl}} style={styles.itemImage} />
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
        style={{marginBottom: 60}}
        data={orders.filter(order => order.data.status === 'received')}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderItem}
      />
    </View>
  );
};

const PendingOrder = ({orders, handleComplete, setOrders}) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const calculateProgress = items => {
    const completedItems = items.filter(item => item.completed).length;
    return (completedItems / items.length) * 100;
  };

  const handleCompleteItem = async (orderId, itemId) => {
    const orderRef = firestore().collection('orders').doc(orderId);

    // Get the current items
    const orderSnapshot = await orderRef.get();
    const currentItems = orderSnapshot.data().items;

    // Update the item's completion status
    const updatedItems = currentItems.map(item =>
      item.id === itemId ? {...item, completed: true} : item,
    );

    // Update the order in Firestore
    await orderRef.update({items: updatedItems});

    // Update the state locally
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.orderId === orderId) {
          const allCompleted = updatedItems.every(item => item.completed);
          const updatedOrder = {
            ...order,
            data: {...order.data, items: updatedItems},
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

  const renderOrderItem = ({item}) => {
    const progress = calculateProgress(item.data.items);
    const isExpanded = expandedOrder === item.orderId;

    return (
      <TouchableOpacity onPress={() => toggleExpandOrder(item.orderId)}>
        <View style={styles.orderItem}>
          <Text style={styles.totalText}>Order No: {item.orderId}</Text>
          <Text style={styles.totalText}>Total: {item.data.total}</Text>
          <Text style={styles.dateText}>
            Date: {item.data.createdAt?.toDate().toString()}
          </Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              styleAttr="Horizontal"
              indeterminate={false}
              progress={progress / 100}
              color="#FF7722"
            />
            <Text style={styles.progressText}>{`${progress.toFixed(0)}%`}</Text>
          </View>
          {isExpanded ? (
            <FlatList
              data={item.data.items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderOrderProduct(item.orderId)}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleComplete(item.orderId)}>
                  <Text style={styles.completeButtonText}>Complete Order</Text>
                </TouchableOpacity>
              }
            />
          ) : (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleComplete(item.orderId)}>
              <Text style={styles.completeButtonText}>Complete Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderProduct =
    orderId =>
    ({item}) =>
      (
        <View style={styles.itemView}>
          <Image source={{uri: item.imageUrl}} style={styles.itemImage} />
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
                  onPress={() => handleCompleteItem(orderId, item.id)}>
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
        style={{marginBottom: 60}}
        data={orders.filter(order => order.data.status === 'pending')}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderItem}
      />
    </View>
  );
};

const OrderCompleted = ({orders}) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleRefund = async orderId => {
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

  const renderOrderItem = ({item}) => (
    <TouchableOpacity onPress={() => setExpandedOrder(item.orderId)}>
      <View style={styles.orderItem}>
        <Text style={styles.totalText}>Order No: {item.orderId}</Text>
        <Text style={styles.totalText}>Total: {item.data.total}</Text>
        <Text style={styles.dateText}>
          Date: {item.data.createdAt?.toDate().toString()}
        </Text>
        {expandedOrder === item.orderId && (
          <>
            <FlatList
              data={item.data.items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderOrderProduct}
            />
            <TouchableOpacity
              style={styles.refundButton}
              onPress={() => handleRefund(item.orderId)}>
              <Text style={styles.refundButtonText}>Refund</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderOrderProduct = ({item}) => (
    <View style={styles.itemView}>
      <Image source={{uri: item.imageUrl}} style={styles.itemImage} />
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
        style={{marginBottom: 60}}
        data={orders.filter(order => order.data.status === 'completed')}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderOrderItem}
      />
    </View>
  );
};

const TabLabel = ({title, count, isActive}) => (
  <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
    setReceivedCount(
      tempData.filter(order => order.data.status === 'received').length,
    );
    setPendingCount(
      tempData.filter(order => order.data.status === 'pending').length,
    );
  };

  const handleAccept = async orderId => {
    await firestore()
      .collection('orders')
      .doc(orderId)
      .update({status: 'pending'});
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? {...order, data: {...order.data, status: 'pending'}}
          : order,
      ),
    );
    setReceivedCount(prevCount => prevCount - 1);
    setPendingCount(prevCount => prevCount + 1);
  };

  const handleComplete = async orderId => {
    await firestore()
      .collection('orders')
      .doc(orderId)
      .update({status: 'completed'});
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? {...order, data: {...order.data, status: 'completed'}}
          : order,
      ),
    );
    setPendingCount(prevCount => prevCount - 1);
  };

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Received"
        options={{
          tabBarLabel: ({focused}) => (
            <TabLabel
              title="Received"
              count={receivedCount}
              isActive={focused}
            />
          ),
        }}>
        {props => (
          <OrdersReceived
            {...props}
            orders={orders}
            handleAccept={handleAccept}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Preparation"
        options={{
          tabBarLabel: ({focused}) => (
            <TabLabel
              title="Preparation"
              count={pendingCount}
              isActive={focused}
            />
          ),
        }}>
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
          tabBarLabel: ({focused}) => (
            <TabLabel
              title="Completed"
              count={
                orders.filter(order => order.data.status === 'completed').length
              }
              isActive={focused}
            />
          ),
        }}>
        {props => <OrderCompleted {...props} orders={orders} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  orderItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  acceptButton: {
    backgroundColor: '#FF7722',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
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
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  nameText: {
    fontSize: 14,
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
    marginRight: 10,
  },
  completeItemButton: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
  },
  tabLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabLabelActive: {
    color: '#FF7722',
  },
  countBadge: {
    backgroundColor: '#FF7722',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 12,
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
  refundButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
});

export default MyTabs;
