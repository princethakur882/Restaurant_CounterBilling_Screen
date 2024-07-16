import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeMenu from './Screens/DefaultMenu/HomeMenu';
import Payment from './Screens/DefaultMenu/Printer';
import { ApiProvider } from './Context/ApiProvider';
import SelectLogin from './Screens/LogIn/SelectLogin';
import AdminLogIn from './Screens/LogIn/AdminLogIn';
import UserLogin from './Screens/LogIn/UserLogin';
import AdminDashboard from './Screens/Admin/AdminDashboard';
import BillDetails from './Screens/DefaultMenu/BillDetails';
import EditItem from './Screens/Admin/EditItem';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <ApiProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeMenu">
          <Stack.Screen
            name="SelectLogin"
            component={SelectLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AdminLogIn"
            component={AdminLogIn}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserLogin"
            component={UserLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeMenu"
            component={HomeMenu}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BillDetails"
            component={BillDetails}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Payment"
            component={Payment}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditItems"
            component={EditItem}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ApiProvider>
  );
};

export default App;
