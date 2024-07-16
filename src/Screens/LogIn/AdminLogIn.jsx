
import React, {useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminLogIn = ({navigation}) => {

  
  // useEffect(() => {
  //   firestore()
  //   .collection('admin').add({
  //     email: 'test@gmail.com',
  //      password: 'admin123'
  //  })
  //    .then(()=>{
  //      console.log('admin added')
  //    })
  //    }, [])


  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const storedEmail = await AsyncStorage.getItem('EMAIL');
      if (storedEmail) {
        navigation.navigate('AdminDashboard');
      }
    };

    checkLoggedInUser();
  }, [navigation]);

  const adminLogin = async data => {
    const {username, password} = data;
    try {
      const users = await firestore().collection('admin').get();
      const user = users.docs[0]?._data;

      if (user && username === user.email && password === user.password) {
        await AsyncStorage.setItem('EMAIL', username);
        navigation.navigate('AdminDashboard');
      } else {
        Alert.alert('Error', 'Wrong email or password');
      }
    } catch (error) {
      console.error('Login error: ', error);
      Alert.alert('Error', 'An error occurred during login');
    }
  };

  const onSubmit = data => {
    adminLogin(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>

      <Controller
        control={control}
        rules={{required: 'Username is required'}}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Username"
          />
        )}
        name="username"
        defaultValue=""
      />
      {errors.username && (
        <Text style={styles.error}>{errors.username.message}</Text>
      )}

      <Controller
        control={control}
        rules={{required: 'Password is required'}}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Password"
            secureTextEntry
          />
        )}
        name="password"
        defaultValue=""
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.text}>LogIn</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: 'black',
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 2,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: '#FF7722',
    height: 50,
    width: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default AdminLogIn;
