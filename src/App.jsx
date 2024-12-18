import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectLogin from './Screens/LogIn/SelectLogin';
import AdminLogIn from './Screens/LogIn/AdminLogIn';
import UserLogin from './Screens/LogIn/UserLogin';
import { ApiProvider } from './Context/ApiProvider';
import AdminDashboard from './Screens/Dashboard/AdminDashboard';
import HomeMenu from './Screens/Dashboard/HomeMenu';
import BillDetails from './Screens/DefaultMenu/BillDetails';
import Payment from './Screens/DefaultMenu/Printer';
import EditItem from './Screens/Admin/Tabs/ExtraTabs/EditItem';
import Party from './Screens/Admin/Tabs/AdminTabs/Party';
import PartyDetails from './Screens/Admin/Tabs/ExtraTabs/PartyDetails';
import MyTabs from './Screens/Admin/Tabs/AdminTabs/Orders';
import AdminSignUp from './Screens/LogIn/AdminSignUp';
import UserSignUp from './Screens/LogIn/UserSignUp';
import HomeOption from './Screens/Admin/Tabs/ExtraTabs/HomeOption';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <ApiProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SelectLogin">
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
            name="AdminSignUp"
            component={AdminSignUp}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserLogin"
            component={UserLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserSignUp"
            component={UserSignUp}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeMenu"
            component={HomeMenu}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeOption"
            component={HomeOption}
            options={{
              headerShown: true,
              animation: 'slide_from_right'
            }}
          />
          <Stack.Screen
            name="AdminDashboard" 
            component={AdminDashboard}
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
          <Stack.Screen
            name="Party"
            component={Party}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PartyDetails"
            component={PartyDetails}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Order"
            component={MyTabs}
            options={{ headerShown: true }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ApiProvider>
  );
};

export default App;
