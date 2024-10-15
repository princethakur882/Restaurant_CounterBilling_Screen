import React, {useEffect} from 'react';
import {View, Text, Alert, TouchableOpacity, StyleSheet, BackHandler} from 'react-native';
import {createDrawerNavigator, DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Items from '../Admin/Tabs/AdminTabs/Items';
import Party from '../Admin/Tabs/AdminTabs/Party';
import User from '../Admin/Tabs/AdminTabs/User';
import MyTabs from '../Admin/Tabs/AdminTabs/Orders';
import Cancel from '../Admin/Tabs/AdminTabs/Cancel';
import Refund from '../Admin/Tabs/AdminTabs/Refund';
import OrderCompleted from '../Admin/Tabs/AdminTabs/Completed';
import {useNavigation, getFocusedRouteNameFromRoute} from '@react-navigation/native';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await AsyncStorage.removeItem('ADMIN_EMAIL'); 
            props.navigation.navigate('SelectLogin'); 
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const AdminDashboard = () => {
  // const navigation = useNavigation();

  // useEffect(() => {
  //   const backAction = () => {
  //     const currentRoute = getFocusedRouteNameFromRoute(navigation.getState());

  //     if (currentRoute && currentRoute !== 'AdminDashboard') {
  //       navigation.navigate('AdminDashboard');
  //     } else {
  //       BackHandler.exitApp();
  //     }

  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,   
  //                   const backhandler = Backhandler.addEventListner
  //                    if (currentRout !== "AdminDashboard"){
  //                           navigation.navigate('AdminDashboard');
  //                   } else {
  //                    BackHandler.exitApp(); 
  //                    }
  //                      return () => backhandler.remove();
  //                      navigation
  //   );

  //   return () => backHandler.remove();
  // }, [navigation]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="AdminDashboard" 
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
      })}
    >
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

const styles = StyleSheet.create({
  logoutContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoutButton: {
    backgroundColor: '#FF7722',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginTop: 400,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AdminDashboard;
