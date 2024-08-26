import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeMenu from './Screens/Dashboard/HomeMenu';
import AdminDashboard from './Screens/Dashboard/AdminDashboard';
import MyTabs from './Screens/Admin/Tabs/AdminTabs/Orders';
import Party from './Screens/Admin/Tabs/AdminTabs/Party';
import Payment from './Screens/DefaultMenu/Printer';
import BillDetails from './Screens/DefaultMenu/BillDetails';
import EditItem from './Screens/Admin/Tabs/ExtraTabs/EditItem';
import PartyDetails from './Screens/Admin/Tabs/ExtraTabs/PartyDetails';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="HomeMenu">
      <Drawer.Screen name="HomeMenu" component={HomeMenu} />
      <Drawer.Screen name="AdminDashboard" component={AdminDashboard} />
      <Drawer.Screen name="Orders" component={MyTabs} />
      <Drawer.Screen name="Party" component={Party} />
      <Drawer.Screen name="Payment" component={Payment} />
      <Drawer.Screen name="BillDetails" component={BillDetails} />
      <Drawer.Screen name="EditItems" component={EditItem} />
      <Drawer.Screen name="PartyDetails" component={PartyDetails} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
