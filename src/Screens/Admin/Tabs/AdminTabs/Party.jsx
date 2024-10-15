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
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Party = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gstNumber, setgstNumber] = useState('');
  const [dueAmount, setdueAmount] = useState('');

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
    if (name && address && phoneNumber && gstNumber) {
      await firestore().collection('parties').add({
        name,
        address,
        phoneNumber,
        gstNumber,
        dueAmount: dueAmount || 0,
        creditAmount: 0,
      });

      setModalVisible(false);
      clearFields();
    } else {
      Alert.alert('Error', 'Please fill all fields');
    }
  };

  const clearFields = () => {
    setName('');
    setAddress('');
    setPhoneNumber('');
    setgstNumber('');
    setdueAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Party List</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PartyDetails', { partyId: item.id })}
            style={styles.userCard}
          >
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userDetail}>{item.phoneNumber}</Text>
            <Text style={styles.userDetail}>{item.address}</Text>
            <Text style={styles.userDetail}>{item.gstNumber}</Text>
            <Text style={styles.userDetail}>Due Amount: {'\u20B9'}{item.dueAmount}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Add Party" onPress={() => setModalVisible(true)} />
      
      {/* Modal for Adding New Party */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Party</Text>
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
              placeholder="GST Number"
              value={gstNumber}
              onChangeText={setgstNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Due Amount"
              value={dueAmount}
              onChangeText={setdueAmount}
              keyboardType="numeric"
            />
            <Button title="Add" onPress={handleAddUser} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
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
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  userCard: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default Party;
