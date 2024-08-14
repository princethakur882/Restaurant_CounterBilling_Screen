import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  PermissionsAndroid,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const Items = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState();
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (isFocused) {
      getItems();
    }
  }, [isFocused]);

  const getItems = () => {
    firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        const tempData = [];
        querySnapshot.forEach(documentSnapshot => {
          tempData.push({
            id: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setItems(tempData);
      });
  };

  const deleteItem = docId => {
    firestore()
      .collection('items')
      .doc(docId)
      .delete()
      .then(() => {
        getItems();
      });
  };

  const handleAddItem = () => {
    if (name && price && quantity && imageData) {
      uploadImage();
    } else {
      alert('Please fill all fields');
    }
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'OpenStore Camera Permission',
          message:
            'OpenStore needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        openGallery();
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.didCancel) {
    } else {
      console.log(result);
      setImageData(result);
    }
  };

  const uploadImage = async () => {
    const reference = storage().ref(imageData.assets[0].fileName);
    const pathToFile = imageData.assets[0].uri;
    // uploads file
    await reference.putFile(pathToFile);
    const url = await storage()
      .ref(imageData.assets[0].fileName)
      .getDownloadURL();
    console.log(url);
    uploadItem(url);
  };

  const uploadItem = url => {
    firestore()
      .collection('items')
      .add({
        name,
        price,
        quantity: Number(quantity),
        imageUrl: url,
      })
      .then(() => {
        console.log('Item added!');
        resetForm();
      });
  };

  const handleQuantityChange = (text) => {
    const numericQuantity = Number(text);
    setQuantity(numericQuantity);
  };

  const resetForm = () => {
    setImageData(null);
    setName('');
    setPrice('');
    setQuantity('');
    setImageUrl('');
    setModalVisible(false);
  };

  const renderItem = ({ item }) => {
    const { name, price, imageUrl, quantity } = item.data;
    return (
      <View style={styles.itemView}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        <View style={styles.nameView}>
          <Text style={styles.nameText}>{name}</Text>
          <View style={styles.priceView}>
            <Text style={styles.priceText}>{'\u20B9' + price}</Text>
          </View>
          <View style={styles.qty}>
            <Text style={styles.qtyText}>{'Qty. ' + quantity}</Text>
          </View>
        </View>
        <View style={{ margin: 10 }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('EditItems', {
                data: item.data,
                id: item.id,
              });
            }}>
            <Icon
              name="edit"
              size={20}
              style={[styles.icon, { color: 'green' }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              deleteItem(item.id);
            }}>
            <Icon
              name="delete"
              size={20}
              style={[styles.icon, { marginTop: 20, color: 'red' }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.login}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('HomeMenu')}>
          <Text style={styles.text}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adminbtn}
          onPress={() => navigation.navigate('AdminLogIn')}>
          <Text style={styles.admintext}>Admin</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={{ marginBottom: 60 }}
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={45} color="#fff" />
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={{ marginLeft: 260 }}
              onPress={() => setModalVisible(false)}>
              <Icon name="cancel" size={25} color="gray" />
            </TouchableOpacity>
            {imageData !== null ? (
              <Image
                source={{ uri: imageData.assets[0].uri }}
                style={styles.imageStyle}
              />
            ) : null}
            <TextInput
              placeholder="Enter Item Name"
              style={styles.inputStyle}
              value={name}
              onChangeText={text => setName(text)}
            />
            <TextInput
              placeholder="Enter Item Price"
              style={styles.inputStyle}
              value={price}
              onChangeText={text => setPrice(text)}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Enter Item Quantity"
              style={styles.inputStyle}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Enter Item Image URL"
              style={styles.inputStyle}
              value={imageUrl}
              onChangeText={text => setImageUrl(text)}
            />
            <Text style={{ alignSelf: 'center', marginTop: 20 }}>OR</Text>
            <TouchableOpacity
              style={styles.pickBtn}
              onPress={() => {
                requestCameraPermission();
              }}>
              <Text>Pick Image From Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handleAddItem}>
              <Text style={{ color: '#fff' }}>Upload Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Items;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemView: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 10,
    borderRadius: 10,
    height: 100,
    marginBottom: 10,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    margin: 5,
  },
  nameView: {
    justifyContent: 'space-between',
    width: '53%',
    margin: 10,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  descText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceText: {
    paddingTop: 5,
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  discountText: {
    fontSize: 17,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    marginLeft: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  login: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminbtn: {
    backgroundColor: '#FF7722',
    height: 40,
    width: '45%',
    borderRadius: 10,
    margin: 10,
  },
  btn: {
    backgroundColor: '#FFF',
    height: 40,
    width: '45%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF7722',
    margin: 10,
  },
  admintext: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    paddingTop: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF7722',
    textAlign: 'center',
    paddingTop: 8,
  },
  qty: {
    borderRadius: 5,
    width: 55,
    backgroundColor: '#C5C6C7',
    alignItems: 'center',
    height: 30,
  },
  qtyText: {
    paddingTop: 6,
    fontSize: 13,
    color: 'black',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 35,
    right: 35,
    backgroundColor: '#FF7722',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    marginBottom: 50,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  imageStyle: {
    height: 200,
    width: 200,
    marginBottom: 20,
  },
  inputStyle: {
    height: 40,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  pickBtn: {
    height: 40,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 10,
  },
  uploadBtn: {
    height: 40,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7722',
    marginTop: 20,
    borderRadius: 10,
  },
});
