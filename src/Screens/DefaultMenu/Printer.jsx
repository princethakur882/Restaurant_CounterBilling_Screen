import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { BluetoothManager, BluetoothEscposPrinter, ALIGN, FONTTYPE } from "tp-react-native-bluetooth-printer";

const Payment = ({ route }) => {
  const { cartItems, totalPrice } = route.params;
  const [loading, setLoading] = useState(false);
  const [boundAddress, setBoundAddress] = useState(null);

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
    const date = now.toLocaleDateString();   
    return `${date}`;
  };
  const formatTime = () => {
    const now = new Date(); 
    const time = now.toLocaleTimeString(); 
    return `${time}`;
  };


  const printReceipt = async () => {
    try {
      if (!boundAddress) {
        alert("Printer not connected");
        return;
      }
  
      const date = formatDate();
      const time = formatTime();
  
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
        const itemName = item.name.padEnd(15, ' '); 
        const itemCount = item.count.toString().padStart(4, ' '); 
        const itemTotal = (item.price * item.count).toFixed(2).padStart(11, ' '); 
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
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Payment Screen</Text>
      <Button title="Print Receipt" onPress={printReceipt} disabled={loading || !boundAddress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Payment;
