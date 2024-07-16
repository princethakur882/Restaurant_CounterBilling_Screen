import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';

const UserLogin = ({navigation}) => {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const onSubmit = data => {
    // Handle login logic here
    console.log(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Login</Text>

      <Controller
        control={control}
        rules={{
          required: 'Username is required',
        }}
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
        rules={{
          required: 'Password is required',
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

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          handleSubmit(onSubmit)();
          navigation.navigate('Home');
        }}>
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
    alignItems: 'centre',
    marginBottom: 30,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default UserLogin;
