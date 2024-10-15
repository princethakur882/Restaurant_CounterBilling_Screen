import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FilterButtons = () => {
  const [selectedButton, setSelectedButton] = useState(null);

  const buttons = [
    { name: 'veg', icon: 'grass', color: 'green' },
    { name: 'non-veg', icon: 'restaurant', color: 'red' },
    { name: 'chineese', icon: 'ramen-dining', color: 'orange' },
    { name: 'fast food', icon: 'fastfood', color: 'blue' },
    { name: 'drinks', icon: 'local-drink', color: 'purple' },
  ];

  const handlePress = (name) => {
    setSelectedButton(name);
  };

  return (
    <View style={styles.container}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.button,
            selectedButton === button.name && { backgroundColor: button.color }
          ]}
          onPress={() => handlePress(button.name)}
        >
          <MaterialIcons
            name={button.icon}
            size={30}
            color={selectedButton === button.name ? '#fff' : '#000'}
          />
          <Text style={styles.buttonText}>{button.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    marginTop: 5,
    color: '#000',
  },
});

export default FilterButtons;
