import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  SafeAreaView,
  Keyboard,
  BackHandler,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';

export default function BrowserView({
  initialUrl,
  onGoHome,
  onNewTab,
  isDarkMode,
  tabCount = 1,
}) {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSecure, setIsSecure] = useState(initialUrl.startsWith('https'));
  const [menuVisible, setMenuVisible] = useState(false);

  const theme = isDarkMode ? darkStyles : lightStyles;

  // Handle hardware Back button on Android
  useEffect(() => {
    const onBackPress = () => {
      if (menuVisible) {
        setMenuVisible(false);
        return true;
      }
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevent default app exit
      } else {
        onGoHome();
        return true; // Return to Chrome Home screen without exiting app
      }
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandlerSubscription.remove();
  }, [canGoBack, onGoHome, menuVisible]);

  const handleNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
    setInputUrl(navState.url);
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setIsLoading(navState.loading);
    setIsSecure(navState.url.startsWith('https'));
  };

  const handleUrlSubmit = () => {
    let target = inputUrl.trim();
    if (!target) return;

    Keyboard.dismiss();

    // Check if valid URL or search term
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }

    setCurrentUrl(target);
    setInputUrl(target);
  };

  const handleSharePage = async () => {
    setMenuVisible(false);
    try {
      await Share.share({
        title: 'Web page link',
        url: currentUrl,
        message: currentUrl,
      });
    } catch (err) {
      console.log('Error sharing page:', err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, theme.container]}>
      {/* Top Chrome Header Bar */}
      <View style={[styles.topBar, theme.topBar]}>
        {/* Left Side: Home Icon */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={onGoHome}
          activeOpacity={0.7}
        >
          <Ionicons
            name="home-outline"
            size={22}
            color={isDarkMode ? '#E8EAED' : '#3C4043'}
          />
        </TouchableOpacity>

        {/* Center: Search / Omnibox Pill Input */}
        <View style={[styles.addressPill, theme.addressPill]}>
          {/* Lock Icon */}
          <Ionicons
            name={isSecure ? 'lock-closed' : 'warning-outline'}
            size={14}
            color={isSecure ? '#34A853' : '#EA4335'}
            style={styles.lockIcon}
          />

          {/* URL Input */}
          <TextInput
            style={[styles.addressInput, theme.addressInput]}
            value={inputUrl}
            onChangeText={setInputUrl}
            onSubmitEditing={handleUrlSubmit}
            returnKeyType="go"
            autoCapitalize="none"
            autoCorrect={false}
            selectTextOnFocus={true}
          />

          {/* Reload / Stop button */}
          <TouchableOpacity
            style={styles.reloadBtn}
            onPress={() => {
              if (isLoading && webViewRef.current) {
                webViewRef.current.stopLoading();
              } else if (webViewRef.current) {
                webViewRef.current.reload();
              }
            }}
          >
            <Ionicons
              name={isLoading ? 'close' : 'reload'}
              size={16}
              color={isDarkMode ? '#9AA0A6' : '#5F6368'}
            />
          </TouchableOpacity>
        </View>

        {/* Right Side: New Tab (+) + Tab Badge (1) + Three Dots (⋮) */}
        <View style={styles.rightActions}>
          {/* New Tab (+) Button */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onNewTab}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add"
              size={24}
              color={isDarkMode ? '#E8EAED' : '#3C4043'}
            />
          </TouchableOpacity>

          {/* Tab Number Badge */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onNewTab}
            activeOpacity={0.7}
          >
            <View style={[styles.tabBadge, theme.tabBadge]}>
              <Text style={[styles.tabBadgeText, theme.tabBadgeText]}>
                {tabCount}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Three Dots Options Menu */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color={isDarkMode ? '#E8EAED' : '#3C4043'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading Progress Line */}
      {isLoading && (
        <View style={styles.loadingBarContainer}>
          <ActivityIndicator
            size="small"
            color="#4285F4"
            style={{ alignSelf: 'flex-start' }}
          />
        </View>
      )}

      {/* Main Web View (No bottom bar below!) */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingView}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={[styles.loadingText, theme.loadingText]}>
              Loading web page...
            </Text>
          </View>
        )}
        style={styles.webView}
      />

      {/* Dropdown Options Menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.menuContainer, theme.menuContainer]}>
              {/* Forward / Back / Bookmark Row */}
              <View style={styles.menuQuickRow}>
                <TouchableOpacity
                  style={styles.quickNavBtn}
                  disabled={!canGoBack}
                  onPress={() => {
                    setMenuVisible(false);
                    webViewRef.current && webViewRef.current.goBack();
                  }}
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={
                      canGoBack
                        ? isDarkMode
                          ? '#E8EAED'
                          : '#3C4043'
                        : isDarkMode
                        ? '#5F6368'
                        : '#BDC1C6'
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickNavBtn}
                  disabled={!canGoForward}
                  onPress={() => {
                    setMenuVisible(false);
                    webViewRef.current && webViewRef.current.goForward();
                  }}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={
                      canGoForward
                        ? isDarkMode
                          ? '#E8EAED'
                          : '#3C4043'
                        : isDarkMode
                        ? '#5F6368'
                        : '#BDC1C6'
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickNavBtn}
                  onPress={() => setMenuVisible(false)}
                >
                  <Ionicons
                    name="star-outline"
                    size={20}
                    color={isDarkMode ? '#E8EAED' : '#3C4043'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickNavBtn}
                  onPress={() => {
                    setMenuVisible(false);
                    webViewRef.current && webViewRef.current.reload();
                  }}
                >
                  <Ionicons
                    name="reload"
                    size={20}
                    color={isDarkMode ? '#E8EAED' : '#3C4043'}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, theme.divider]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onNewTab();
                }}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>New tab</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSharePage}
              >
                <Feather
                  name="share-2"
                  size={18}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>Share...</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setMenuVisible(false)}
              >
                <MaterialCommunityIcons
                  name="desktop-mac"
                  size={18}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>
                  Desktop site
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onGoHome();
                }}
              >
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>
                  Go to Home
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  homeBtn: {
    padding: 8,
    marginRight: 2,
  },
  addressPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  lockIcon: {
    marginRight: 6,
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  reloadBtn: {
    padding: 4,
    marginLeft: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  iconBtn: {
    padding: 6,
    marginLeft: 2,
  },
  tabBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingBarContainer: {
    height: 3,
    backgroundColor: '#E8EAED',
    justifyContent: 'center',
  },
  webView: {
    flex: 1,
  },
  loadingView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 45,
    paddingRight: 10,
  },
  menuContainer: {
    width: 220,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuQuickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  quickNavBtn: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 14,
    marginLeft: 14,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#202124',
  },
  topBar: {
    backgroundColor: '#202124',
    borderBottomColor: '#3C4043',
  },
  addressPill: {
    backgroundColor: '#303134',
  },
  addressInput: {
    color: '#E8EAED',
  },
  tabBadge: {
    borderColor: '#E8EAED',
  },
  tabBadgeText: {
    color: '#E8EAED',
  },
  loadingText: {
    color: '#E8EAED',
  },
  menuContainer: {
    backgroundColor: '#2D2E31',
  },
  menuText: {
    color: '#E8EAED',
  },
  divider: {
    backgroundColor: '#3C4043',
  },
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E8EAED',
  },
  addressPill: {
    backgroundColor: '#F1F3F4',
  },
  addressInput: {
    color: '#202124',
  },
  tabBadge: {
    borderColor: '#3C4043',
  },
  tabBadgeText: {
    color: '#3C4043',
  },
  loadingText: {
    color: '#202124',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
  },
  menuText: {
    color: '#3C4043',
  },
  divider: {
    backgroundColor: '#E8EAED',
  },
});
