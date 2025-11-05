import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const UrgentDebug = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 긴급 디버그 컴포넌트 🚨</Text>
      <Text style={styles.text}>이게 보이면 import는 정상 작동!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff00ff',
    padding: 30,
    margin: 20,
    borderWidth: 10,
    borderColor: '#00ff00',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
});
