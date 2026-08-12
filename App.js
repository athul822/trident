import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar as RNStatusBar,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Header from './src/components/Header';
import GoogleLogo from './src/components/GoogleLogo';
import SearchBar from './src/components/SearchBar';
import ShortcutsGrid from './src/components/ShortcutsGrid';
import DiscoverFeed from './src/components/DiscoverFeed';
import BrowserView from './src/components/BrowserView';
import VoiceSearchModal from './src/components/VoiceSearchModal';
import LensModal from './src/components/LensModal';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('home'); // 'home' | 'browser'
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [lensModalVisible, setLensModalVisible] = useState(false);
  const [tabCount, setTabCount] = useState(1);

  // Handle hardware Back button when modals are open in home view
  useEffect(() => {
    const onBackPress = () => {
      if (voiceModalVisible) {
        setVoiceModalVisible(false);
        return true;
      }
      if (lensModalVisible) {
        setLensModalVisible(false);
        return true;
      }
      return false;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandlerSubscription.remove();
  }, [voiceModalVisible, lensModalVisible]);


  const handleSearchSubmit = (searchTerm) => {
    let url = searchTerm.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = `https://${url}`;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    setBrowserUrl(url);
    setActiveView('browser');
  };

  const handleShortcutPress = (shortcut) => {
    if (shortcut.isAdd) {
      return;
    }
    if (shortcut.url) {
      setBrowserUrl(shortcut.url);
      setActiveView('browser');
    }
  };

  const handlePostPress = (post) => {
    if (post.url) {
      setBrowserUrl(post.url);
      setActiveView('browser');
    }
  };

  const handleNewTab = () => {
    setTabCount((prev) => prev + 1);
    setActiveView('home');
  };

  const statusBarPadding = Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 0;

  if (activeView === 'browser') {
    return (
      <View
        style={[
          styles.flexContainer,
          {
            backgroundColor: isDarkMode ? '#202124' : '#FFFFFF',
            paddingTop: statusBarPadding,
          },
        ]}
      >
        <StatusBar
          style={isDarkMode ? 'light' : 'dark'}
          backgroundColor={isDarkMode ? '#202124' : '#FFFFFF'}
        />
        <BrowserView
          initialUrl={browserUrl}
          onGoHome={() => setActiveView('home')}
          onNewTab={handleNewTab}
          isDarkMode={isDarkMode}
          tabCount={tabCount}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.flexContainer,
        {
          backgroundColor: isDarkMode ? '#202124' : '#FFFFFF',
          paddingTop: statusBarPadding,
        },
      ]}
    >
      <StatusBar
        style={isDarkMode ? 'light' : 'dark'}
        backgroundColor={isDarkMode ? '#202124' : '#FFFFFF'}
      />

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Bar Header (Profile, Tabs Badge, Dropdown Menu) */}
            <Header
              tabCount={tabCount}
              onNewTab={handleNewTab}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            />

            {/* Authentic Google Logo */}
            <GoogleLogo isDarkMode={isDarkMode} />

            {/* Functional Omnibox Search Bar */}
            <SearchBar
              onSearchSubmit={handleSearchSubmit}
              onOpenVoice={() => setVoiceModalVisible(true)}
              onOpenLens={() => setLensModalVisible(true)}
              isDarkMode={isDarkMode}
            />

            {/* Shortcuts Grid (Most Visited Sites) */}
            <ShortcutsGrid
              onShortcutPress={handleShortcutPress}
              isDarkMode={isDarkMode}
            />

            {/* Discover Feed ("Posts like that") */}
            <DiscoverFeed
              onPostPress={handlePostPress}
              isDarkMode={isDarkMode}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onQuerySubmit={handleSearchSubmit}
        isDarkMode={isDarkMode}
      />

      {/* Google Lens Camera Modal */}
      <LensModal
        visible={lensModalVisible}
        onClose={() => setLensModalVisible(false)}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});
