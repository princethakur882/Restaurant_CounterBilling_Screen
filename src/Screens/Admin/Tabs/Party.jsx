import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icons from 'react-native-vector-icons/MaterialIcons';

const Party = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [adharNumber, setAdharNumber] = useState('');

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('parties')
      .onSnapshot(snapshot => {
        const fetchedUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
      });
    return () => unsubscribe();
  }, []);

  const handleAddUser = async () => {
    if (name && address && phoneNumber && adharNumber) {
      await firestore().collection('parties').add({
        name,
        address,
        phoneNumber,
        adharNumber,
      });
      setName('');
      setAddress('');
      setPhoneNumber('');
      setAdharNumber('');
      setModalVisible(false);
    } else {
      alert("Please fill all fields");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
      style={{marginBottom:50}}
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>Name: {item.name}</Text>
            <Text>Address: {item.address}</Text>
            <Text>Phone: {item.phoneNumber}</Text>
            <Text>Aadhar: {item.adharNumber}</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icons name="add" size={45} color='#fff' />
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
          <TouchableOpacity
          style={{marginLeft: 260}}
          onPress={() => setModalVisible(false)}>
          <Icons name="cancel" size={25} color='gray' />
          </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Aadhar Number"
              value={adharNumber}
              onChangeText={setAdharNumber}
            />
            <Button title="Add User" onPress={handleAddUser} />
            
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addButton: {
    position: 'absolute',
    bottom: 35,
    right: 25,
    backgroundColor: '#FF7722',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    marginBottom:50,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default Party;
