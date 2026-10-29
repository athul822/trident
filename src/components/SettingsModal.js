import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsModal({
  visible,
  onClose,
  isDarkMode,
  pushToken,
  tokenError,
  isFetchingToken,
  onRetryToken,
  hasNotificationPermission,
}) {
  const [copied, setCopied] = useState(false);
  const [copiedError, setCopiedError] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const theme = isDarkMode ? darkStyles : lightStyles;

  const handleCopyToken = async () => {
    if (!pushToken) return;
    await Clipboard.setStringAsync(pushToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyError = async () => {
    if (!tokenError) return;
    await Clipboard.setStringAsync(tokenError);
    setCopiedError(true);
    setTimeout(() => setCopiedError(false), 2500);
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `test-notification-${Date.now()}`,
        content: {
          title: '🔱 Trident Notification Test',
          body: 'Notifications are working! You will receive AI word suggestions even when the app is closed.',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3,
        },
      });
      setTimeout(() => setTestSent(false), 4000);
    } catch (e) {
      console.error('Failed to schedule test notification:', e);
      setTestSent(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, theme.modalCard]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Ionicons
                    name="settings-outline"
                    size={22}
                    color={isDarkMode ? '#8AB4F8' : '#1A73E8'}
                  />
                  <Text style={[styles.title, theme.title]}>Trident Settings</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons
                    name="close"
                    size={22}
                    color={isDarkMode ? '#9AA0A6' : '#5F6368'}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
              >
                {/* Push Notification Token Section */}
                <View style={[styles.section, theme.section]}>
                  <Text style={[styles.sectionTitle, theme.sectionTitle]}>
                    Push Notification Token (Android)
                  </Text>
                  <Text style={[styles.sectionDesc, theme.sectionDesc]}>
                    Copy this token and paste it into Trident Web. The web app uses this
                    to deliver AI word suggestions to your phone even when this app is
                    closed or not in memory.
                  </Text>

                  {/* Token Box or Error Box */}
                  <View
                    style={[
                      styles.tokenBox,
                      theme.tokenBox,
                      tokenError && !pushToken && styles.errorBox,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tokenText,
                        theme.tokenText,
                        tokenError && !pushToken && styles.errorText,
                      ]}
                      numberOfLines={4}
                      selectable={true}
                    >
                      {pushToken
                        ? pushToken
                        : isFetchingToken
                        ? 'Fetching push token from Google Play Services...'
                        : tokenError
                        ? `Token Error:\n${tokenError}`
                        : 'Fetching device token... (Ensure Google Play Services are active)'}
                    </Text>
                  </View>

                  {pushToken ? (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        copied && styles.actionBtnSuccess,
                      ]}
                      onPress={handleCopyToken}
                    >
                      <Ionicons
                        name={copied ? 'checkmark-circle' : 'copy-outline'}
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionBtnText}>
                        {copied ? 'Copied to Clipboard!' : 'Copy Push Token'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          styles.flexBtn,
                          isFetchingToken && styles.actionBtnDisabled,
                        ]}
                        disabled={isFetchingToken}
                        onPress={onRetryToken}
                      >
                        <Ionicons
                          name="reload-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.actionBtnText}>
                          {isFetchingToken ? 'Checking...' : 'Retry Token'}
                        </Text>
                      </TouchableOpacity>

                      {tokenError && (
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            styles.flexBtn,
                            styles.secondaryBtn,
                          ]}
                          onPress={handleCopyError}
                        >
                          <Ionicons
                            name={copiedError ? 'checkmark-circle' : 'copy-outline'}
                            size={18}
                            color="#FFFFFF"
                          />
                          <Text style={styles.actionBtnText}>
                            {copiedError ? 'Copied!' : 'Copy Error'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {tokenError && !pushToken && (
                    <Text style={[styles.helpText, { color: isDarkMode ? '#F28B82' : '#D93025' }]}>
                      ⚠️ Standalone Android APK requires Firebase Cloud Messaging (`google-services.json`) configured with a project ID to receive background pushes when closed.
                    </Text>
                  )}
                </View>

                {/* Status & Channel */}
                <View style={[styles.section, theme.section]}>
                  <Text style={[styles.sectionTitle, theme.sectionTitle]}>
                    Background Notification Status
                  </Text>

                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, theme.sectionDesc]}>Permission:</Text>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.dot,
                          {
                            backgroundColor: hasNotificationPermission
                              ? '#34A853'
                              : '#EA4335',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusValue,
                          {
                            color: hasNotificationPermission
                              ? '#34A853'
                              : '#EA4335',
                          },
                        ]}
                      >
                        {hasNotificationPermission ? 'Granted' : 'Denied / Missing'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, theme.sectionDesc]}>Channel:</Text>
                    <Text style={[styles.statusValue, theme.title]}>
                      default (MAX Priority)
                    </Text>
                  </View>

                  {/* Test notification button */}
                  <TouchableOpacity
                    style={[styles.testBtn, theme.testBtn]}
                    onPress={handleTestNotification}
                  >
                    <MaterialCommunityIcons
                      name="bell-ring-outline"
                      size={18}
                      color={isDarkMode ? '#8AB4F8' : '#1A73E8'}
                    />
                    <Text style={[styles.testBtnText, { color: isDarkMode ? '#8AB4F8' : '#1A73E8' }]}>
                      {testSent ? 'Sending in 3s (Lock screen to test)...' : 'Test Background Alert'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingTop: 16,
    gap: 16,
  },
  section: {
    borderRadius: 14,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  tokenBox: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    lineHeight: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A73E8',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
  },
  actionBtnDisabled: {
    backgroundColor: '#808080',
    opacity: 0.6,
  },
  actionBtnSuccess: {
    backgroundColor: '#34A853',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexBtn: {
    flex: 1,
  },
  secondaryBtn: {
    backgroundColor: '#5F6368',
  },
  errorBox: {
    borderColor: '#EA4335',
    backgroundColor: 'rgba(234, 67, 53, 0.08)',
  },
  errorText: {
    color: '#EA4335',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  statusLabel: {
    fontSize: 12,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 14,
    gap: 8,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

const lightStyles = {
  modalCard: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#202124',
  },
  section: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  sectionTitle: {
    color: '#202124',
  },
  sectionDesc: {
    color: '#5F6368',
  },
  tokenBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  tokenText: {
    color: '#3C4043',
  },
  testBtn: {
    borderColor: '#DADCE0',
    backgroundColor: '#FFFFFF',
  },
};

const darkStyles = {
  modalCard: {
    backgroundColor: '#202124',
  },
  title: {
    color: '#E8EAED',
  },
  section: {
    backgroundColor: '#303134',
    borderWidth: 1,
    borderColor: '#3C4043',
  },
  sectionTitle: {
    color: '#E8EAED',
  },
  sectionDesc: {
    color: '#9AA0A6',
  },
  tokenBox: {
    backgroundColor: '#202124',
    borderColor: '#3C4043',
  },
  tokenText: {
    color: '#E8EAED',
  },
  testBtn: {
    borderColor: '#3C4043',
    backgroundColor: '#202124',
  },
};
