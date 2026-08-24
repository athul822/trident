import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { POPULAR_SEARCHES } from '../data/mockData';

export default function SearchBar({
  onSearchSubmit,
  onOpenVoice,
  onOpenLens,
  isDarkMode,
}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const theme = isDarkMode ? darkStyles : lightStyles;

  const handleSubmit = (textToSearch) => {
    const searchTerm = textToSearch || query;
    if (!searchTerm.trim()) return;

    Keyboard.dismiss();
    setIsFocused(false);
    onSearchSubmit(searchTerm.trim());
  };

  const filteredSuggestions = query.trim()
    ? POPULAR_SEARCHES.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_SEARCHES.slice(0, 5);

  return (
    <View style={styles.wrapper}>
      {/* Search Omnibox Pill */}
      <View
        style={[
          styles.container,
          theme.container,
          isFocused && theme.containerFocused,
        ]}
      >
        {/* Left: Google G or Search Icon */}
        <TouchableOpacity style={styles.leftIconBtn} onPress={() => handleSubmit()}>
          <Ionicons
            name="search-outline"
            size={20}
            color={isDarkMode ? '#9AA0A6' : '#5F6368'}
          />
        </TouchableOpacity>

        {/* Input Field */}
        <TextInput
          style={[styles.input, theme.input]}
          placeholder="Search or type URL"
          placeholderTextColor={isDarkMode ? '#9AA0A6' : '#80868B'}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Keep focused briefly if selecting a suggestion
          }}
          onSubmitEditing={() => handleSubmit()}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Clear Button (when typing) */}
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setQuery('')}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={isDarkMode ? '#9AA0A6' : '#5F6368'}
            />
          </TouchableOpacity>
        )}

        {/* Voice Microphone Icon */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onOpenVoice}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="microphone"
            size={18}
            color={isDarkMode ? '#E8EAED' : '#4285F4'}
          />
        </TouchableOpacity>

        {/* Google Lens Camera Icon */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onOpenLens}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="camera-outline"
            size={20}
            color={isDarkMode ? '#EA4335' : '#EA4335'}
          />
        </TouchableOpacity>
      </View>

      {/* Auto-complete Suggestions Dropdown */}
      {isFocused && (
        <View style={[styles.suggestionsBox, theme.suggestionsBox]}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredSuggestions.map((item, index) => (
              <TouchableOpacity
                key={index.toString()}
                style={[styles.suggestionItem, theme.suggestionItem]}
                onPress={() => {
                  setQuery(item);
                  handleSubmit(item);
                }}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={18}
                  color={isDarkMode ? '#9AA0A6' : '#5F6368'}
                  style={styles.suggestionIcon}
                />
                <Text style={[styles.suggestionText, theme.suggestionText]}>
                  {item}
                </Text>
                <Ionicons
                  name="arrow-back-outline"
                  size={16}
                  color={isDarkMode ? '#70757A' : '#9AA0A6'}
                  style={{ transform: [{ rotate: '135deg' }] }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    zIndex: 10,
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftIconBtn: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  actionBtn: {
    padding: 6,
    marginLeft: 4,
  },
  suggestionsBox: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  suggestionIcon: {
    marginRight: 14,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#303134',
    borderColor: '#3C4043',
  },
  containerFocused: {
    borderColor: '#8AB4F8',
  },
  input: {
    color: '#E8EAED',
  },
  suggestionsBox: {
    backgroundColor: '#303134',
    borderColor: '#3C4043',
  },
  suggestionItem: {
    borderBottomColor: '#3C4043',
  },
  suggestionText: {
    color: '#E8EAED',
  },
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  containerFocused: {
    borderColor: '#4285F4',
  },
  input: {
    color: '#202124',
  },
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  suggestionItem: {
    borderBottomColor: '#F1F3F4',
  },
  suggestionText: {
    color: '#202124',
  },
});
