import React, {useState, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';

const Party = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gstNumber, setgstNumber] = useState('');

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
      });
      setName('');
      setAddress('');
      setPhoneNumber('');
      setgstNumber('');
      setModalVisible(false);
    } else {
      alert('Please fill all fields');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={{marginBottom: 50}}
        data={users}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.userItem}>
            <Text style={styles.itemtext}>{item.name}</Text>
            <Text style={styles.itemtext}>Due Amt.{item.dueAmount}</Text>
            <TouchableOpacity
              style={styles.viewmore}
              onPress={() =>
                navigation.navigate('PartyDetails', {partyId: item.id})
              }>
              <Text>View More</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icons name="add" size={45} color="#fff" />
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
              <Icons name="cancel" size={25} color="gray" />
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
              placeholder="GST Number"
              value={gstNumber}
              onChangeText={setgstNumber}
            />
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handleAddUser}>
              <Text style={{color: '#Fff'}}>Add Party</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  userItem: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FF8225',
    margin: 5,
    color: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    position: 'absolute',
    bottom: 5,
    right: 35,
    backgroundColor: '#FF7722',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    marginBottom: 50,
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
  itemtext: {
    fontSize: 15,
    fontWeight: '600',
    width: '33%',
  },
  viewmore: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    width: '23%',
  },
  uploadBtn: {
    backgroundColor: '#FF7722',
    width: '100%',
    height: 40,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Party;
