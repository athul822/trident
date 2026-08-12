import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function GoogleLogo({ isDarkMode }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>
        <Text style={{ color: '#4285F4' }}>G</Text>
        <Text style={{ color: '#EA4335' }}>o</Text>
        <Text style={{ color: '#FBBC05' }}>o</Text>
        <Text style={{ color: '#4285F4' }}>g</Text>
        <Text style={{ color: '#34A853' }}>l</Text>
        <Text style={{ color: '#EA4335' }}>e</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 54,
    fontWeight: '500',
    letterSpacing: -1.5,
    fontFamily: 'System',
  },
});
