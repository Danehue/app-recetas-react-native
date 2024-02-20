import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <View style={styles.searchBar}>
       <TextInput
        style={styles.searchInput}
        placeholder="Buscar..."
        placeholderTextColor="#999"
        value={searchTerm} // Asignar valor del estado al TextInput
        onChangeText={setSearchTerm} // Actualizar el estado al escribir
      />
      <TouchableOpacity style={styles.searchButton}>
        <Icon name="search" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
  },
  searchButton: {
    paddingHorizontal: 10,
  },
  searchButtonText: {
    fontSize: 16,
    color: 'black',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 20,
    fontSize: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});

export default SearchBar;
