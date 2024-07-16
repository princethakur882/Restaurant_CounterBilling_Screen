import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';

const SelectLogin = ({navigation}) => {
  return (
    <View style={styles.login}>
      <Text style={styles.texttype}>Select login Type</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('AdminLogIn')}>
        <Text style={styles.text}>Admin LogIn</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('UserLogin')}>
        <Text style={styles.text}>User LogIn</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectLogin;

const styles = StyleSheet.create({
  login: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texttype: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom:30
  },
  btn: {
    backgroundColor: '#FF7722',
    height: 50,
    width: '90%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'centre',
    marginBottom:30,
    
  },
  text: {
        fontSize:18,
        fontWeight:'600',
        color:'#fff',
        textAlign:'center'
  },
});
