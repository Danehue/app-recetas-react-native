import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BottomBar = () => {
  const navigate = useNavigate();
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.button} onPress={() => navigate('/', {state: ''})}>
        <Icon name="home" size={32} color="#000" style={styles.plusIcon}/>
        <Text style={styles.buttonText}>Inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={() => navigate('/recipe/add')}>
        <Icon name="plus" size={20} color="#000" style={styles.plusIcon}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigate('supplies')}>
        <Icon name="book" size={32} color="#000" />
        <Text style={styles.buttonText}>Precios</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#666'
  },
  addButton: {
    width: 60, // Ancho del botón
    height: 60,
    // position: 'absolute',
    // top: -45,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#777',
    backgroundColor: '#add8e6',
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 15,
    // paddingHorizontal: 15,
    // paddingVertical: 15,
    // fontSize: 20
  },
  plusIcon: {
    // alignSelf: 'center',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});

export default BottomBar;
