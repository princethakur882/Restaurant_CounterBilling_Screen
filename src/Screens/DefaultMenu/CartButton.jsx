import React, {useContext, useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { ApiContext } from '../../Context/ApiProvider';

const AddToCartButton = ({item}) => {
  const {handleAddToCart, handleRemoveFromCart, count} = useContext(ApiContext);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (count(item.id) > 0) {
      setIsAdded(true);
    } else {
      setIsAdded(false);
    }
  }, [count(item.id)]);

  const addToCart = () => {
    handleAddToCart(item);
    setIsAdded(true);
  };

  const increment = () => {
    handleAddToCart(item);
  };

  const decrement = () => {
    handleRemoveFromCart(item.id);
    if (count(item.id) <= 1) {
      setIsAdded(false);
    }
  };

  return (
    <View style={styles.container}>
      {isAdded ? (
        <View style={styles.counterContainer}>
          <TouchableOpacity onPress={decrement} style={[styles.increment]}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{count(item.id)}</Text>
          <TouchableOpacity onPress={increment} style={[styles.decrement]}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={addToCart} style={styles.addButton}>
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  addButton: {
    padding: 6,
    width: 70,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF7722',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#FF7722',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 8,
    backgroundColor: '#FF7722',
    borderRadius: 5,
  },
  decrement: {
    padding: 8,
    backgroundColor: '#FF7722',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  increment: {
    padding: 8,
    backgroundColor: '#FF7722',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  countText: {
    color: '#fff',
    padding: 8,
    backgroundColor: '#FF7722',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default AddToCartButton;
