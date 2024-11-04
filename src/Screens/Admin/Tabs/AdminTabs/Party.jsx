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
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

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
      setModalVisible(false);
      clearFields();
      await firestore()
        .collection('parties')
        .add({
          name,
          address,
          phoneNumber,
          gstNumber,
          dueAmount: dueAmount || 0,
          creditAmount: 0,
        });

      
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
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PartyDetails', {partyId: item.id})
            }
            style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userDetail}>{item.phoneNumber}</Text>
            </View>
            <View style={{flex:1, flexDirection:'row-reverse'}}> 
              <Text style={styles.userDetail}>
                Due Amount: {'\u20B9'}
                {item.dueAmount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

<TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={45} color="#fff" />
      </TouchableOpacity>

      {/* Modal for Adding New Party */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <TouchableOpacity
              style={{marginLeft: 260}}
              onPress={() => setModalVisible(false)}>
              <Icon name="cancel" size={25} color="gray" />
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.uploadBtn} onPress={handleAddUser}>
              <Text style={{color: '#fff'}}>ADD PARTY</Text>
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    // alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 5, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: '#FF8225', // Orange background
  },
  userInfo: {
    flex: 1,
    flexDirection:'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 3,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 5,
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
  uploadBtn: {
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7722',
    marginTop: 20,
    borderRadius: 10,
  },
});

export default Party;
