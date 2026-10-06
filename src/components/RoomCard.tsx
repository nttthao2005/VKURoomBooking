
import React, {
  useEffect,
  useRef,
} from 'react';

import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Room } from '../types/room';

type RoomCardProps = {
  room: Room;
  onBooking: (room: Room) => void;

  // true = card đang xuất hiện trong viewport
  isVisible: boolean;

  // dùng để tạo hiệu ứng lần lượt
  animationDelay?: number;
};

export default function RoomCard({
  room,
  onBooking,
  isVisible,
  animationDelay = 0,
}: RoomCardProps) {
  const translateY = useRef(
    new Animated.Value(24)
  ).current;

  const animationId = useRef(0);

  useEffect(() => {
    // Card ra khỏi viewport
    // → reset về vị trí ban đầu
    if (!isVisible) {
      animationId.current += 1;

      translateY.stopAnimation();

      translateY.setValue(24);

      return;
    }

    // Card vừa xuất hiện
    const currentAnimation =
      ++animationId.current;

    translateY.stopAnimation();

    translateY.setValue(24);

    const timer = setTimeout(() => {
      // Nếu trong lúc chờ card đã biến mất
      // thì không chạy animation nữa
      if (
        currentAnimation !==
        animationId.current
      ) {
        return;
      }

      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(
          Easing.cubic
        ),
        useNativeDriver: true,
      }).start();
    }, animationDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [
    isVisible,
    animationDelay,
    translateY,
  ]);

  const isAvailable =
    room.status === 'available';

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            {
              translateY,
            },
          ],
        },
      ]}
    >
      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: room.image }}
          style={styles.image}
        />

        {/* STATUS */}
        <View
          style={[
            styles.statusBadge,
            isAvailable
              ? styles.availableBadge
              : styles.maintenanceBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  isAvailable
                    ? '#16a34a'
                    : '#dc2626',
              },
            ]}
          />

          <Text
            style={[
              styles.statusBadgeText,
              {
                color: isAvailable
                  ? '#166534'
                  : '#991b1b',
              },
            ]}
          >
            {isAvailable
              ? 'Đang trống'
              : 'Bảo trì'}
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.cardContent}>
        <Text style={styles.roomName}>
          {room.name}
        </Text>

        <Text style={styles.roomLocation}>
          📍 {room.location}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>
              🏫
            </Text>

            <Text style={styles.infoText}>
              {room.lab}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>
              👥
            </Text>

            <Text style={styles.infoText}>
              {room.capacity} chỗ
            </Text>
          </View>
        </View>

        {isAvailable && (
          <Pressable
            style={({ pressed }) => [
              styles.bookingButton,
              pressed &&
                styles.bookingButtonPressed,
            ]}
            onPress={() =>
              onBooking(room)
            }
          >
            <Text
              style={
                styles.bookingButtonText
              }
            >
              Đặt phòng
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  imageContainer: {
    position: 'relative',
  },

  image: {
    width: '100%',
    height: 175,
    backgroundColor: '#e2e8f0',
  },

  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  availableBadge: {
    backgroundColor: '#dcfce7',
  },

  maintenanceBadge: {
    backgroundColor: '#fee2e2',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  cardContent: {
    padding: 15,
  },

  roomName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 5,
  },

  roomLocation: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    fontSize: 15,
    marginRight: 5,
  },

  infoText: {
    fontSize: 13,
    color: '#475569',
  },

  bookingButton: {
    marginTop: 15,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bookingButtonPressed: {
    opacity: 0.8,
  },

  bookingButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  arrow: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 8,
  },
});

