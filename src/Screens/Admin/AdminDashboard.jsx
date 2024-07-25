import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React, {useState} from 'react';
import Items from './Tabs/Items';
import Add from './Tabs/Add';
import Orders from './Tabs/Orders';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import User from './Tabs/User';


const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <View style={styles.container}>
      {selectedTab == 0 ? (
        <Items />
      ) : selectedTab == 1 ? (
        <Add />
      ) : selectedTab == 2 ? (
        <Orders />
      ) : selectedTab == 3 ? (
        <User />
      ) : (
        <Notifications />
      )}

      <View style={styles.bottomView}>
        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => {
            setSelectedTab(0);
          }}>
          <Icon
            name="collections"
            size={26}
            color={selectedTab == 0 ? '#FF7722' : 'gray'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => {
            setSelectedTab(1);
          }}>
          <Icons
            name="plus-circle"
            size={26}
            color={selectedTab == 1 ? '#FF7722' : 'gray'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => {
            setSelectedTab(2);
          }}>
          <Icon
            name="shopping-cart"
            size={28}
            color={selectedTab == 2 ? '#FF7722' : 'gray'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => {
            setSelectedTab(3);
          }}>
          <Icons
            name="user-alt"
            size={23}
            color={selectedTab == 3 ? '#FF7722' : 'gray'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AdminDashboard;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomView: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
  },
  bottomTab: {
    height: '100%',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabImg: {
    width: 24,
    height: 24,
  },
});