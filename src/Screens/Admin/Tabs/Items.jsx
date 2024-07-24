import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Items = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  useEffect(() => {
    getItems();
  }, [isFocused]);
  const getItems = () => {
    firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        let tempData = [];
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

  // const Homerender = () => {
  //   useEffect(() => {
  //     getItems();
  //   }, []);
  // };

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
        data={items}
        renderItem={({item}) => {
          const {name, price, imageUrl, quantity} = item.data;
          return (
            <View style={styles.itemView}>
              <Image source={{uri: imageUrl}} style={styles.itemImage} />
              <View style={styles.nameView}>
                <Text style={styles.nameText}>{name}</Text>
                <View style={styles.priceView}>
                  <Text style={styles.priceText}>{'\u20B9' + price}</Text>
                </View>
                <View style={styles.qty}>
                  <Text style={styles.qtyText}>{'Qty. ' + quantity}</Text>
                </View>
              </View>
              <View style={{margin: 10}}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('EditItems', {
                      data: item.data,
                      id: item.id,
                    });
                  }}>
                  <Icon
                    name="edit-document"
                    size={20}
                    style={[styles.icon, {color: 'green'}]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteItem(item.id);
                  }}>
                  <Icon
                    name="delete"
                    size={20}
                    style={[styles.icon, {marginTop: 20, color: 'red'}]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
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
    justifyContent:'space-between',
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
    // borderWidth:1,
    // borderColor:'black',
    // borderRadius:5,
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
  qty:{
    borderRadius:5,
    width:55,
    backgroundColor:"#C5C6C7",
    alignItems:'center',
    height:30
  },
  qtyText:{
    paddingTop:6,
    fontSize:13,
    color:'black',
    fontWeight:'bold'
  },
});
