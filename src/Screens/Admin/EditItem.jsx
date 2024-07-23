import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {useRoute} from '@react-navigation/native';
const EditItem = ({navigation}) => {
  const route = useRoute();
  const [imageData, setImageData] = useState({
    assets: [{uri: route.params.data.imageUrl}],
  });
  const [name, setName] = useState(route.params.data.name);
  const [quantity, setQuantity] = useState(route.params.data.quantity);
  const [price, setPrice] = useState(route.params.data.price);
  const [imageUrl, setImageUrl] = useState('');
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
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
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.didCancel) {
    } else {
      
      setImageData(result);
    }
  };

  const uplaodImage = async () => {
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

  const uploadItem = () => {
    firestore()
      .collection('items')
      .doc(route.params.id)
      .update({
        name: name,
        price: price,
        quantity: quantity,
        imageUrl: route.params.data.imageUrl + '',
      })
      .then(() => {
        navigation.goBack();
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Edit Item</Text>
        </View>

        {imageData !== null ? (
          <Image
            source={{uri: imageData.assets[0].uri}}
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
        />
        <TextInput
          placeholder="Enter Item Quantity"
          style={styles.inputStyle}
          value={quantity}
          onChangeText={text => setQuantity(text)}
        />
        <TextInput
          placeholder="Enter Item Image URL"
          style={styles.inputStyle}
          value={imageUrl}
          onChangeText={text => setImageUrl(text)}
        />
        <Text style={{alignSelf: 'center', marginTop: 20}}>OR</Text>
        <TouchableOpacity
          style={styles.pickBtn}
          onPress={() => {
            requestCameraPermission();
          }}>
          <Text>Pick Image From Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => {
            uplaodImage();
            uploadItem();
          }}>
          <Text style={{color: '#Fff'}}>Update Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditItem;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    width: '100%',
    backgroundColor: '#fff',
    elevation: 5,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputStyle: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 30,
    alignSelf: 'center',
  },
  pickBtn: {
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  uploadBtn: {
    backgroundColor: '#5246f2',
    width: '90%',
    height: 50,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 70,
  },
  imageStyle: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
});
