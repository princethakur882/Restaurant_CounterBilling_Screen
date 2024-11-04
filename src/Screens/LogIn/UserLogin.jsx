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

const UserLogin = ({navigation}) => {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const storedEmail = await AsyncStorage.getItem('USER_EMAIL');
      if (storedEmail) {
        navigation.navigate('HomeMenu');
      }
    };

    checkLoggedInUser();
  }, [navigation]);

  const userLogin = async data => {
    const {username, password} = data;
    try {
      const userCredential = await auth().signInWithEmailAndPassword(username, password);
      if (userCredential) {
        await AsyncStorage.setItem('USER_EMAIL', username);
        navigation.navigate('HomeMenu');
      }
    } catch (error) {
      console.error('Login error:', error); // Log the error for debugging
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Wrong email or password');
      } else {
        Alert.alert('Error', 'An error occurred during login');
      }
    }
  };

  const onSubmit = data => {
    userLogin(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Login</Text>

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
      <Text style={styles.linkText}>Don't have an account?</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('UserSignUp')}
      >
        <Text style={styles.linkText}>Sign up</Text>
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

export default UserLogin;
