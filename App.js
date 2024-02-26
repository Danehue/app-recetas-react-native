import React from 'react';
import Main from './src/components/Main.jsx'
import { View, StyleSheet } from 'react-native'
import BottomBar from './src/components/BottomBar.jsx'
import { NativeRouter } from 'react-router-native';
import { StatusBar } from 'react-native';

export default function App() {
  StatusBar.setBarStyle('dark-content');
  
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
    flex: 1,
    width: '100%',
    height: '100%',
    paddingBottom: 95
  },
});




