import React, {createContext, useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';

const ApiContext = createContext();

const ApiProvider = ({children}) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch data from the API

  useEffect(() => {
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
        setData(tempData);
        setFilteredData(tempData);
      })
      .catch(error => console.error(error));
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (data.length > 0) {
      const filteredItems = data.filter(item =>
        item.data.name &&
        item.data.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredData(filteredItems);
    }
  }, [searchQuery, data]);

  const calculateTotalPrice = items => {
    const total = items.reduce((acc, item) => acc + item.data.price * item.count, 0);
    setTotalPrice(total);
  };

  const count = id => {
    const item = cartItems.find(item => item.id === id);
    return item ? item.count : 0;
  };

  const increment = id => {
    setCartItems(prevCartItems => {
      const updatedCart = prevCartItems.map(item =>
        item.id === id ? {...item, count: item.count + 1} : item,
      );
      calculateTotalPrice(updatedCart);
      return updatedCart;
    });
  };

  const decrement = id => {
    setCartItems(prevCartItems => {
      const updatedCart = prevCartItems.map(item =>
        item.id === id ? {...item, count: Math.max(0, item.count - 1)} : item,
      );
      calculateTotalPrice(updatedCart);
      return updatedCart;
    });
  };

  // Add item to cart
  const handleAddToCart = item => {
    setCartItems(prevCartItems => {
      const existingItem = prevCartItems.find(
        cartItem => cartItem.id === item.id,
      );
      let updatedCart;
      if (existingItem) {
        updatedCart = prevCartItems.map(cartItem =>
          cartItem.id === item.id
            ? {...cartItem, count: cartItem.count + 1}
            : cartItem,
        );
      } else {
        updatedCart = [...prevCartItems, {...item, count: 1}];
      }
      calculateTotalPrice(updatedCart);
      return updatedCart;
    });
  };

  // Remove item from cart
  const handleRemoveFromCart = itemId => {
    setCartItems(prevCartItems => {
      const updatedCart = prevCartItems
        .map(cartItem =>
          cartItem.id === itemId
            ? {...cartItem, count: cartItem.count - 1}
            : cartItem,
        )
        .filter(cartItem => cartItem.count > 0);
      calculateTotalPrice(updatedCart);
      return updatedCart;
    });
  };

  return (
    <ApiContext.Provider
      value={{
        data,
        filteredData,
        handleAddToCart,
        handleRemoveFromCart,
        setSearchQuery,
        cartItems,
        totalPrice,
        count,
        increment,
        decrement,
      }}>
      {children}
    </ApiContext.Provider>
  );
};

export {ApiContext, ApiProvider};
