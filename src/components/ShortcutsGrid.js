import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { SHORTCUTS } from '../data/mockData';

export default function ShortcutsGrid({ onShortcutPress, isDarkMode }) {
  const theme = isDarkMode ? darkStyles : lightStyles;

  return (
    <View style={styles.gridContainer}>
      {SHORTCUTS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.shortcutItem}
          activeOpacity={0.7}
          onPress={() => onShortcutPress(item)}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#F1F3F4' },
            ]}
          >
            {item.isAdd ? (
              <Ionicons
                name="add"
                size={22}
                color={isDarkMode ? '#E8EAED' : '#5F6368'}
              />
            ) : (
              <FontAwesome
                name={item.icon}
                size={20}
                color={item.color}
              />
            )}
          </View>
          <Text
            style={[styles.shortcutTitle, theme.shortcutTitle]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  shortcutItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  shortcutTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: 70,
  },
});

const darkStyles = StyleSheet.create({
  shortcutTitle: {
    color: '#BDC1C6',
  },
});

const lightStyles = StyleSheet.create({
  shortcutTitle: {
    color: '#3C4043',
  },
});
