import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { getWordSuggestions } from './src/services/mistralService';

import Header from './src/components/Header';
import GoogleLogo from './src/components/GoogleLogo';
import SearchBar from './src/components/SearchBar';
import ShortcutsGrid from './src/components/ShortcutsGrid';
import DiscoverFeed from './src/components/DiscoverFeed';
import BrowserView from './src/components/BrowserView';
import VoiceSearchModal from './src/components/VoiceSearchModal';
import LensModal from './src/components/LensModal';
import SettingsModal from './src/components/SettingsModal';

// Setup push notifications to show even when app is open (SDK 57 requires shouldShowBanner + shouldShowList)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // legacy support
    shouldShowBanner: true,  // SDK 51+ required for foreground banner
    shouldShowList: true,    // SDK 51+ required for notification tray
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('home'); // 'home' | 'browser'
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [lensModalVisible, setLensModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [tabCount, setTabCount] = useState(1);
  const [searchHistory, setSearchHistory] = useState([]);

  // ── Setup Notifications & Retrieve Push Token for Background Alerts ──
  const setupNotifications = useCallback(async () => {
    setIsFetchingToken(true);
    setTokenError(null);
    try {
      // 1. Request permissions (Required for Android 13+ and iOS)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      const granted = finalStatus === 'granted';
      setHasNotificationPermission(granted);

      // 2. Set up Android Channel with MAX importance (Crucial for background & screen wake)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          enableVibrate: true,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // 3. Fetch Push Token (Try Expo Push Token, fallback to native FCM token)
      if (granted) {
        let token = null;
        let lastErr = null;
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          if (tokenData?.data) {
            token = tokenData.data;
          }
        } catch (e1) {
          lastErr = e1;
          console.warn('[Expo Push Token Fetch Failed]:', e1.message);
          try {
            const deviceToken = await Notifications.getDevicePushTokenAsync();
            if (deviceToken?.data) {
              token = deviceToken.data;
            }
          } catch (e2) {
            console.warn('[Native Device Token Fetch Failed]:', e2.message);
            lastErr = new Error(`Expo Token: ${e1.message}\nDevice Token: ${e2.message}`);
          }
        }

        if (token) {
          setPushToken(token);
          setTokenError(null);
          console.log('[Trident Push Token Resolved]:', token);
        } else if (lastErr) {
          setTokenError(lastErr.message || String(lastErr));
        }
      } else {
        setTokenError('Notification permission was denied. Please enable in Android App Settings.');
      }
    } catch (err) {
      console.error('[Notification Setup Failed]:', err);
      setTokenError(err.message || String(err));
    } finally {
      setIsFetchingToken(false);
    }
  }, []);

  useEffect(() => {
    setupNotifications();

    // Listen for notification interactions (e.g. user taps notification when app was closed)
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Trident Notification Tapped]:', response.notification.request.content);
    });

    return () => {
      responseSub.remove();
    };
  }, [setupNotifications]);

  // ── Trident Session State ──
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionWords, setSessionWords] = useState([]); // max 3 words

  // Extract search query from a google search URL and add to history (max 10)
  const addToSearchHistory = useCallback(
    (url) => {
      try {
        let term = null;

        // Reliably parse the 'q' parameter from Google Search URLs (never 'oq')
        try {
          const parsed = new URL(url);
          if (
            parsed.hostname.includes('google.') &&
            (parsed.pathname === '/search' || parsed.pathname.startsWith('/search'))
          ) {
            const q = parsed.searchParams.get('q');
            if (q) {
              term = q.trim();
            }
          }
        } catch {
          // Fallback if URL parsing fails: match ?q= or &q=, never &oq=
          const match = url.match(/[?&]q=([^&#]+)/i);
          if (match && match[1]) {
            term = decodeURIComponent(match[1].replace(/\+/g, ' ')).trim();
          }
        }

        if (term) {
          // Add to general history
          setSearchHistory((prev) => {
            const filtered = prev.filter(
              (item) => item.trim().toLowerCase() !== term.toLowerCase()
            );
            return [term, ...filtered].slice(0, 10);
          });

          // Track session words if session is active
          if (sessionActive) {
            setSessionWords((prev) => {
              if (prev.length >= 3) return prev;
              const normalizedTerm = term.toLowerCase();

              // Skip duplicate words
              if (prev.some((w) => w.trim().toLowerCase() === normalizedTerm)) {
                return prev;
              }

              // Word2 and word3 must have different first letters.
              // Only check when adding word3 (prev.length === 2),
              // comparing against word2 (prev[1]).
              if (prev.length === 2) {
                const word2FirstLetter = prev[1].trim().charAt(0).toLowerCase();
                const newFirstLetter = term.charAt(0).toLowerCase();
                if (newFirstLetter === word2FirstLetter) {
                  console.log(
                    `[Trident Session] Skipping "${term}" because first letter matches word2 ("${prev[1]}")`
                  );
                  return prev; // skip, same first letter
                }
              }

              const nextWords = [...prev, term];
              console.log(
                `[Trident Session] Word ${nextWords.length}/3 added: "${term}" | Current words:`,
                nextWords
              );
              return nextWords;
            });
          }
        }
      } catch (e) {
        // ignore malformed URLs
      }
    },
    [sessionActive]
  );

  // ── Generate prompt and call Gemini when 3rd session word arrives ──
  useEffect(() => {
    if (sessionActive && sessionWords.length === 3) {
      const [word1, word2, word3] = sessionWords;
      const firstLetter = word2.charAt(0).toUpperCase();
      const secondLetter = word3.charAt(0).toUpperCase();

      // Create a user-friendly prompt string for ChatGPT
      const chatGptPrompt = `I am playing a word puzzle game. Find words that satisfy ALL three clues:

1. CATEGORY: The word belongs to the same category as "${word1}"
2. STARTS WITH: The word starts with the letter "${firstLetter}"
3. SECOND LETTER: The second letter of the word is "${secondLetter}"

Please list 5 to 10 matching words.`;

      const openChatGPT = async () => {
        // We still copy to clipboard as a fallback in case the app doesn't support the ?q parameter
        await Clipboard.setStringAsync(chatGptPrompt);
        
        // The ?q parameter will pre-fill and auto-send the prompt on the ChatGPT website.
        // If the user has the ChatGPT app installed, Android/iOS may intercept this URL and route it to the app.
        const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(chatGptPrompt)}`;
        Linking.openURL(chatGptUrl);
        
        setSessionActive(false);
        setSessionWords([]);
      };

      // Silently add a push notification with the words in order
      Notifications.scheduleNotificationAsync({
        identifier: `trident-session-${Date.now()}`,
        content: {
          title: word1,
          body: `${firstLetter}${secondLetter.toLowerCase()}`,
        },
        trigger: null, // trigger immediately
      });

      // Call Mistral API silently
      getWordSuggestions(word1, word2, word3)
        .then((words) => {
          if (words.length === 0) {
            Notifications.scheduleNotificationAsync({
              identifier: `trident-results-${Date.now()}`,
              content: {
                title: 'No matches',
                body: 'No matching words found.',
              },
              trigger: null,
            });
            setSessionActive(false);
            setSessionWords([]);
            return;
          }

          const [firstWord, ...rest] = words;
          const remainingWords = rest.join(', ');

          // Schedule via OS AlarmManager — correct trigger format for expo-notifications SDK 57
          Notifications.scheduleNotificationAsync({
            identifier: `trident-results-${Date.now()}`,
            content: {
              title: firstWord,
              body: remainingWords,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 10,
            },
          });

          setSessionActive(false);
          setSessionWords([]);
        })
        .catch((err) => {
          Notifications.scheduleNotificationAsync({
            identifier: `trident-error-${Date.now()}`,
            content: {
              title: '🔱 Trident Error',
              body: `Could not get results: ${err.message}`,
            },
            trigger: null,
          });

          setSessionActive(false);
          setSessionWords([]);
        });
    }
  }, [sessionActive, sessionWords]);

  // ── Toggle session on tab badge press ──
  const handleTabBadgePress = () => {
    if (sessionActive) {
      setSessionActive(false);
      setSessionWords([]);
    } else {
      setSessionWords([]);
      setSessionActive(true);
    }
  };

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

  const statusBarPadding =
    Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 0;

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
          searchHistory={searchHistory}
          onUrlChange={addToSearchHistory}
          onSearchHistorySelect={(term) => {
            setBrowserUrl(
              `https://www.google.com/search?q=${encodeURIComponent(term)}`
            );
          }}
          sessionActive={sessionActive}
          onTabBadgePress={handleTabBadgePress}
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
              searchHistory={searchHistory}
              onSearchHistorySelect={(term) => {
                handleSearchSubmit(term);
              }}
              sessionActive={sessionActive}
              onTabBadgePress={handleTabBadgePress}
              onOpenSettings={() => setSettingsModalVisible(true)}
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

      {/* Trident Push Notifications Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        isDarkMode={isDarkMode}
        pushToken={pushToken}
        tokenError={tokenError}
        isFetchingToken={isFetchingToken}
        onRetryToken={setupNotifications}
        hasNotificationPermission={hasNotificationPermission}
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
