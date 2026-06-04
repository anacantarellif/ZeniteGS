import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { COLORS } from '../constants/colors';

const { height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sheetHeight?: number;
}

export default function BottomSheet({ visible, onClose, children, sheetHeight = height * 0.7 }: Props) {
  const translateY = useRef(new Animated.Value(sheetHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }).start();
    } else {
      Animated.timing(translateY, { toValue: sheetHeight, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible, translateY, sheetHeight]);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <TouchableWithoutFeedback onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingHorizontal: 20, paddingBottom: 32,
  },
  handle: {
    width: 40, height: 3, backgroundColor: COLORS.border,
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
});