import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

export default function Header({
  tabCount = 1,
  onNewTab,
  onOpenBookmarks,
  onOpenHistory,
  isDarkMode,
  onToggleTheme,
  searchHistory = [],
  onSearchHistorySelect,
  sessionActive = false,
  onTabBadgePress,
}) {
  const [menuVisible, setMenuVisible] = useState(false);

  const theme = isDarkMode ? darkStyles : lightStyles;

  const handleMenuOption = (action) => {
    setMenuVisible(false);
    if (action === 'newTab' && onNewTab) onNewTab();
    if (action === 'bookmarks' && onOpenBookmarks) onOpenBookmarks();
    if (action === 'history' && onOpenHistory) onOpenHistory();
    if (action === 'theme' && onToggleTheme) onToggleTheme();
  };

  return (
    <View style={[styles.headerContainer, theme.container]}>
      {/* Left: Profile / Incognito button */}
      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
        <View style={[styles.avatarCircle, theme.avatar]}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </TouchableOpacity>

      {/* Right side actions */}
      <View style={styles.rightActions}>
        {/* Tab Counter Badge */}
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.7}
          onPress={onTabBadgePress}
        >
          <View style={[
            styles.tabBadge,
            theme.tabBadge,
            sessionActive && { borderColor: '#FBBC05', backgroundColor: 'rgba(251, 188, 5, 0.15)' },
          ]}>
            <Text style={[
              styles.tabBadgeText,
              theme.tabBadgeText,
              sessionActive && { color: '#FBBC05' },
            ]}>
              {tabCount}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Three Dots Menu */}
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.7}
          onPress={() => setMenuVisible(true)}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={isDarkMode ? '#E8EAED' : '#3C4043'}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.menuContainer, theme.menuContainer]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('newTab')}
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
                onPress={() => handleMenuOption('incognito')}
              >
                <MaterialCommunityIcons
                  name="incognito"
                  size={20}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>
                  New Incognito tab
                </Text>
              </TouchableOpacity>

              <View style={[styles.divider, theme.divider]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('history')}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={20}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('bookmarks')}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={20}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>Bookmarks</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('recentTabs')}
              >
                <MaterialCommunityIcons
                  name="window-restore"
                  size={20}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>Recent tabs</Text>
              </TouchableOpacity>

              <View style={[styles.divider, theme.divider]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('theme')}
              >
                <Feather
                  name={isDarkMode ? 'sun' : 'moon'}
                  size={20}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>
                  {isDarkMode ? 'Light theme' : 'Dark theme'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={isDarkMode ? '#E8EAED' : '#3C4043'}
                />
                <Text style={[styles.menuText, theme.menuText]}>Settings</Text>
              </TouchableOpacity>

              {/* Search History Section */}
              {searchHistory.length > 0 && (
                <>
                  <View style={[styles.divider, theme.divider]} />
                  <View style={styles.historyHeader}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={isDarkMode ? '#8AB4F8' : '#1A73E8'}
                    />
                    <Text style={[styles.historyTitle, { color: isDarkMode ? '#8AB4F8' : '#1A73E8' }]}>
                      Recent Searches
                    </Text>
                  </View>
                  {searchHistory.map((term, index) => (
                    <TouchableOpacity
                      key={`header-history-${index}`}
                      style={styles.historyItem}
                      onPress={() => {
                        setMenuVisible(false);
                        if (onSearchHistorySelect) onSearchHistorySelect(term);
                      }}
                    >
                      <Ionicons
                        name="search"
                        size={14}
                        color={isDarkMode ? '#9AA0A6' : '#5F6368'}
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={[styles.historyText, { color: isDarkMode ? '#BDC1C6' : '#3C4043' }]}
                        numberOfLines={1}
                      >
                        {term}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 45,
    paddingRight: 12,
  },
  menuContainer: {
    width: 230,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
    marginLeft: 14,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  historyText: {
    fontSize: 14,
    flex: 1,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#202124',
  },
  tabBadge: {
    borderColor: '#E8EAED',
  },
  tabBadgeText: {
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
  tabBadge: {
    borderColor: '#3C4043',
  },
  tabBadgeText: {
    color: '#3C4043',
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
