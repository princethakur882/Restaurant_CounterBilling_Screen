import React, {createContext, useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import { BluetoothManager, BluetoothEscposPrinter, ALIGN, FONTTYPE } from "tp-react-native-bluetooth-printer";

const ApiContext = createContext();

const ApiProvider = ({children}) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [boundAddress, setBoundAddress] = useState(null);

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

  // Filter data based on search 
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

  // Bluetooth connection and printing logic
  useEffect(() => {
    connectToDevice();
  }, []);

  const connectToDevice = async () => {
    setLoading(true);
    try {
      const address = "03:77:3E:72:DA:0E"; 
      await BluetoothManager.connect(address);
      setBoundAddress(address);
      console.log("Connected to device:", address);
    } catch (error) {
      console.error("Error connecting to device:", error);
      alert("Error connecting to printer");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString();   
  };

  const formatTime = () => {
    const now = new Date(); 
    return now.toLocaleTimeString(); 
  };

  const printReceipt = async (orderId) => {
    try {
      if (!boundAddress) {
        alert("Printer not connected");
        return;
      }

      const date = formatDate();
      const time = formatTime();

      await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
      await BluetoothEscposPrinter.setBold(2);
      await BluetoothEscposPrinter.printText(`Order No: #${orderId}\n`, {
        codepage: 0,
        widthtimes: 0.5,
        heigthtimes: 0.5,
        fonttype: FONTTYPE.FONT_A,
      });
      await BluetoothEscposPrinter.printerAlign(ALIGN.RIGHT);
      await BluetoothEscposPrinter.setBold(2);
      await BluetoothEscposPrinter.printText(`Date:${date}\n${time}\n`, {
        codepage: 0,
        widthtimes: 0.5,
        heigthtimes: 0.5,
        fonttype: FONTTYPE.FONT_A,
      });
      await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
      await BluetoothEscposPrinter.setBold(5);
      await BluetoothEscposPrinter.printText(`Squad Kitchen\n\n`, {
        codepage: 0,
        widthtimes: 0.8,
        heigthtimes: 0.5,
        fonttype: FONTTYPE.FONT_A,
      });
      await BluetoothEscposPrinter.setBold(0);
      await BluetoothEscposPrinter.printText("Items            Qty     Total", {
        codepage: 0,
        widthtimes: 0.5,
        heigthtimes: 0.5,
        fonttype: FONTTYPE.FONT_A,
      });
      await BluetoothEscposPrinter.printText("\n--------------------------------\n", { codepage: 0 });

      for (const item of cartItems) {
        const itemName = item.data.name.padEnd(15, ' '); 
        const itemCount = item.count.toString().padStart(4, ' '); 
        const itemTotal = (item.data.price * item.count).toFixed(2).padStart(11, ' '); 
        const itemLine = `${itemName} ${itemCount} ${itemTotal}\n`;
        
        await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
        await BluetoothEscposPrinter.printText(itemLine, {
          codepage: 0,
          widthtimes: 0.5,
          heigthtimes: 0.5,
          fonttype: FONTTYPE.FONT_A,
        });
      }

      await BluetoothEscposPrinter.printText("--------------------------------\n", { codepage: 0 });
      await BluetoothEscposPrinter.setBold(2);
      await BluetoothEscposPrinter.printerAlign(ALIGN.RIGHT);
      await BluetoothEscposPrinter.printText(`Grand Total: ${totalPrice.toFixed(2)}\n\n\n`, {
        codepage: 0,
        widthtimes: 0.5,
        heigthtimes: 0.5,
        fonttype: FONTTYPE.FONT_A,
      });
      // await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
      // await BluetoothEscposPrinter.setBold(2);
      // await BluetoothEscposPrinter.printText("Thanks for your purchase!\n\n\n", {
      //   encoding: "GBK",
      //   codepage: 0,
      //   widthtimes: 0.5,
      //   heigthtimes: 0.5,
      //   fonttype: FONTTYPE.FONT_B,
      // });

    } catch (error) {
      console.error("Error printing:", error);
      alert("Error printing receipt");
    }
  };

  const resetCart = () => {
    setCartItems([]);
    setTotalPrice(0);
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
        printReceipt,
        loading,
        boundAddress,
        resetCart
      }}>
      {children}
    </ApiContext.Provider>
  );
};

export {ApiContext, ApiProvider};
