import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LensModal({ visible, onClose, isDarkMode }) {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Camera Viewfinder Simulation */}
        <View style={styles.cameraBox}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.lensTitleBadge}>
              <MaterialCommunityIcons name="google-lens" size={20} color="#4285F4" />
              <Text style={styles.lensTitleText}>Google Lens</Text>
            </View>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="flash-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Viewfinder Target Frame */}
          <View style={styles.targetFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <Text style={styles.frameHint}>Search with your camera</Text>
          </View>

          {/* Bottom Shutter Action Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.lensModes}>
              <Text style={styles.modeActive}>Search</Text>
              <Text style={styles.modeInactive}>Translate</Text>
              <Text style={styles.modeInactive}>Text</Text>
              <Text style={styles.modeInactive}>Homework</Text>
            </View>

            <TouchableOpacity
              style={styles.shutterBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraBox: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconBtn: {
    padding: 8,
  },
  lensTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lensTitleText: {
    color: '#202124',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  targetFrame: {
    alignSelf: 'center',
    width: 260,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  frameHint: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bottomBar: {
    alignItems: 'center',
  },
  lensModes: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modeActive: {
    color: '#4285F4',
    fontWeight: '700',
    fontSize: 15,
    marginHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#4285F4',
    paddingBottom: 4,
  },
  modeInactive: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontSize: 15,
    marginHorizontal: 12,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
});
