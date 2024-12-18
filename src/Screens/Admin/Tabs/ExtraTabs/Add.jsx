import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  ScrollView,
  CheckBox,
} from 'react-native';
import React, {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const Add = () => {
  const [imageData, setImageData] = useState(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState();
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState({
    veg: false,
    nonVeg: false,
    drinks: false,
    dessert: false,
  });

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
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.didCancel) {
    } else {
      console.log(result);
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

  const uploadItem = url => {
    const selectedCategories = Object.keys(categories).filter(key => categories[key]);
    const numericQuantity = Number(quantity);
    firestore()
      .collection('items')
      .add({
        name: name,
        price: price,
        quantity: numericQuantity,
        imageUrl: url + '',
        categories: selectedCategories,
      })
      .then(() => {
        console.log('item added!');
        resetForm();
      });
  };

  const handleQuantityChange = text => {
    const numericQuantity = Number(text);
    setQuantity(numericQuantity);
  };

  const resetForm = () => {
    setImageData(null);
    setName('');
    setPrice('');
    setQuantity('');
    setImageUrl('');
    setCategories({
      veg: false,
      nonVeg: false,
      drinks: false,
      dessert: false,
    });
  };

  const handleCategoryChange = category => {
    setCategories(prevState => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Add Item</Text>
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
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Enter Item Quantity"
          style={styles.inputStyle}
          value={quantity}
          onChangeText={handleQuantityChange}
          keyboardType="numeric"
        />

        {/* Category Selection */}
        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Select Categories:</Text>
          <View style={styles.checkboxItem}>
            <CheckBox
              value={categories.veg}
              onValueChange={() => handleCategoryChange('veg')}
            />
            <Text>Veg</Text>
          </View>
          <View style={styles.checkboxItem}>
            <CheckBox
              value={categories.nonVeg}
              onValueChange={() => handleCategoryChange('nonVeg')}
            />
            <Text>Non-Veg</Text>
          </View>
          <View style={styles.checkboxItem}>
            <CheckBox
              value={categories.drinks}
              onValueChange={() => handleCategoryChange('drinks')}
            />
            <Text>Drinks</Text>
          </View>
          <View style={styles.checkboxItem}>
            <CheckBox
              value={categories.dessert}
              onValueChange={() => handleCategoryChange('dessert')}
            />
            <Text>Dessert</Text>
          </View>
        </View>

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
          }}>
          <Text style={{color: '#FFF'}}>Upload Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Add;

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
    backgroundColor: '#FF7722',
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
  checkboxContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 30,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});
