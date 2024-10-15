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
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminLogIn = ({navigation}) => {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const storedEmail = await AsyncStorage.getItem('ADMIN_EMAIL');
      if (storedEmail) {
        navigation.navigate('AdminDashboard');
      }
    };

    checkLoggedInUser();
  }, [navigation]);

  const adminLogin = async data => {
    const {username, password} = data;
    try {
      // Firebase Authentication Sign-In
      await auth().signInWithEmailAndPassword(username, password);
      await AsyncStorage.setItem('ADMIN_EMAIL', username);
      navigation.navigate('AdminDashboard');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No user found with this email');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password');
      } else {
        Alert.alert('Error', 'An error occurred during login');
      }
      console.error('Login error: ', error);
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

      <TouchableOpacity onPress={() => navigation.navigate('AdminSignUp')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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
  linkText: {
    color: '#FF7722',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdminLogIn;
