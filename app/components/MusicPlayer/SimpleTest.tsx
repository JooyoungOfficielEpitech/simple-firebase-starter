import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * 간단한 테스트 컴포넌트
 * 메트로놈과 Pitch 컨트롤이 렌더링되는지 확인용
 */
export const SimpleTest = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 간단한 테스트 컴포넌트</Text>
      <Text style={styles.text}>이 텍스트가 보이면 컴포넌트 렌더링 성공!</Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>빨간 박스</Text>
      </View>
      <View style={styles.box2}>
        <Text style={styles.boxText}>파란 박스</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffff00',
    padding: 20,
    margin: 10,
    borderWidth: 3,
    borderColor: '#ff0000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  box: {
    backgroundColor: '#ff0000',
    padding: 15,
    marginVertical: 5,
  },
  box2: {
    backgroundColor: '#0000ff',
    padding: 15,
    marginVertical: 5,
  },
  boxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
