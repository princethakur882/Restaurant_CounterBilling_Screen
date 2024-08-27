import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Items from '../Admin/Tabs/AdminTabs/Items';
import Party from '../Admin/Tabs/AdminTabs/Party';
import User from '../Admin/Tabs/AdminTabs/User';
import MyTabs from '../Admin/Tabs/AdminTabs/Orders';
import Cancel from '../Admin/Tabs/AdminTabs/Cancel';
import Refund from '../Admin/Tabs/AdminTabs/Refund';
import OrderCompleted from '../Admin/Tabs/AdminTabs/Completed';
const Drawer = createDrawerNavigator();

const AdminDashboard = () => {
  return (
    <Drawer.Navigator
      screenOptions={({route}) => ({
        drawerIcon: ({focused, size}) => {
          let iconName;
          let IconComponent;
          let color = focused ? '#FF7722' : 'gray';

          if (route.name === 'Items') {
            iconName = 'collections';
            IconComponent = MaterialIcons;
          } else if (route.name === 'Party') {
            iconName = 'user-tie';
            IconComponent = FontAwesome5;
          } else if (route.name === 'Orders') {
            iconName = 'shopping-cart';
            IconComponent = MaterialIcons;
          } else if (route.name === 'Cancel') {
            iconName = 'cancel';
            IconComponent = MaterialIcons;
          } else if (route.name === 'Completed') {
            iconName = 'check-circle';
            IconComponent = MaterialIcons;
          } else if (route.name === 'Refund') {
            iconName = 'retweet';
            IconComponent = FontAwesome5;
          } else if (route.name === 'User') {
            iconName = 'user-alt';
            IconComponent = FontAwesome5;
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
      })}>
      <Drawer.Screen name="Items" component={Items} />
      <Drawer.Screen name="Party" component={Party} />
      <Drawer.Screen name="Orders" component={MyTabs} />
      <Drawer.Screen name="Cancel" component={Cancel} />
      <Drawer.Screen name="Completed" component={OrderCompleted} />
      <Drawer.Screen name="Refund" component={Refund} />
      <Drawer.Screen name="User" component={User} />
    </Drawer.Navigator>
  );
};

export default AdminDashboard;
