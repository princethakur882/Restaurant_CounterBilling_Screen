import React from 'react';
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
import firestore from '@react-native-firebase/firestore'; // Import Firestore

const UserSignUp = ({navigation}) => {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const userSignUp = async data => {
    const {username, password} = data;
    try {
      // Create the user using Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(username, password);
      const userId = userCredential.user.uid; 

      await firestore().collection('users').doc(userId).set({
        email: username,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Account created successfully');
      navigation.navigate('UserLogin');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'That email address is invalid!');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password should be at least 6 characters long!');
      } else {
        Alert.alert('Error', 'An error occurred during sign up');
      }
    }
  };

  const onSubmit = data => {
    userSignUp(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Sign Up</Text>

      <Controller
        control={control}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: 'Invalid email address',
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Email"
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
        rules={{
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters long',
          },
        }}
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
        <Text style={styles.text}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
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

export default UserSignUp;
