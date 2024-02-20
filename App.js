import React from 'react';
import Main from './src/components/Main.jsx'
import Constants from 'expo-constants'
import { View, Text, StyleSheet } from 'react-native'
import BottomBar from './src/components/BottomBar.jsx'
import SearchBar from './src/components/SearchBar.jsx'
import { NativeRouter } from 'react-router-native';

export default function App() {
    
  return (
    <View style={styles.container}>
      <NativeRouter>
        <Main/>
        <BottomBar/>
      </NativeRouter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    width: '100%',
    height: '100%',
    paddingBottom: 65
  },
  title: {
  }
  
});




