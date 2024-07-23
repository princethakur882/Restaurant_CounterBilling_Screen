import React, { useContext } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { ApiContext } from '../../Context/ApiProvider';

const Payment = () => {
  const { printReceipt, loading, boundAddress } = useContext(ApiContext);

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