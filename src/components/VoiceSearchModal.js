import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function VoiceSearchModal({ visible, onClose, onQuerySubmit, isDarkMode }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                isDarkMode ? styles.darkModal : styles.lightModal,
              ]}
            >
              {/* Top Close Row */}
              <View style={styles.topRow}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? '#E8EAED' : '#202124' },
                  ]}
                >
                  Listening...
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDarkMode ? '#E8EAED' : '#5F6368'}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Say something like "Weather today" or "Open YouTube"
              </Text>

              {/* Pulsing Voice Microphone Button */}
              <View style={styles.micContainer}>
                <View style={styles.pulseRing} />
                <TouchableOpacity
                  style={styles.micBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    onQuerySubmit('Weather forecast today');
                  }}
                >
                  <FontAwesome name="microphone" size={36} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.hintText}>Tap mic or try standard voice command</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    minHeight: 320,
  },
  darkModal: {
    backgroundColor: '#202124',
  },
  lightModal: {
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#80868B',
    marginTop: 8,
    textAlign: 'center',
  },
  micContainer: {
    marginVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(66, 133, 244, 0.25)',
  },
  micBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  hintText: {
    fontSize: 13,
    color: '#9AA0A6',
  },
});
