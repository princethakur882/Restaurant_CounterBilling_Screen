import React from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

const UserLogout = props => {
  const navigation = useNavigation();

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
            await AsyncStorage.removeItem('USER_EMAIL');
            props.navigation.navigate('SelectLogin');
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#FF7722',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UserLogout;
