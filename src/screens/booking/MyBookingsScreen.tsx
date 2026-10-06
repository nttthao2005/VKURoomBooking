import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../../services/firebase';
import { auth } from '../../services/firebase';
import { useQueryClient } from '@tanstack/react-query';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  MainTabParamList,
} from '../../navigation/MainTabNavigator';

import type {
  RootStackParamList,
} from '../../navigation/AppNavigator';
type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled';
};

type Props = CompositeScreenProps<
  BottomTabScreenProps<
    MainTabParamList,
    'MyBookings'
  >,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MyBookingsScreen({
  navigation,
}: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
const queryClient = useQueryClient();
  const loadBookings = useCallback(() => {
    const user = auth.currentUser;

    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const data: Booking[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Booking, 'id'>),
        }));

        data.sort((a, b) => {
          const dateA = `${a.date} ${a.startTime}`;
          const dateB = `${b.date} ${b.startTime}`;

          return dateB.localeCompare(dateA);
        });

        setBookings(data);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Lỗi lấy lịch đặt:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    const unsubscribe = loadBookings();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadBookings]);

  const onRefresh = () => {
    setRefreshing(true);

    // onSnapshot đã tự cập nhật dữ liệu.
    // Timeout ngắn để kết thúc hiệu ứng kéo làm mới.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const isCancelled = item.status === 'cancelled';

    return (
      <Pressable
  style={styles.card}
  onPress={() =>
    navigation.navigate('BookingDetail', {
      booking: item,
    })
  }
>
        <View style={styles.headerRow}>
          <Text style={styles.roomName}>{item.roomName}</Text>

          <View
            style={[
              styles.statusBadge,
              isCancelled
                ? styles.cancelledBadge
                : styles.confirmedBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {isCancelled ? 'Đã hủy' : 'Đã đặt'}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.info}>📅 Ngày: {item.date}</Text>

          <Text style={styles.info}>
            🕐 Thời gian: {item.startTime} - {item.endTime}
          </Text>

          <Text style={styles.info}>
            🏫 Mã phòng: {item.roomId}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Đang tải lịch đặt...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch đặt phòng</Text>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>

          <Text style={styles.empty}>
            Bạn chưa có lịch đặt phòng.
          </Text>

          <Text style={styles.emptyHint}>
            Các phòng bạn đặt sẽ xuất hiện ở đây.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    paddingTop: 50,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  // card: {
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   padding: 16,
  //   marginBottom: 12,

  //   elevation: 2,
  //   shadowColor: '#000',
  //   shadowOpacity: 0.08,
  //   shadowRadius: 4,
  //   shadowOffset: {
  //     width: 0,
  //     height: 2,
  //   },
  // },
card: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,

  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 4,
  shadowOffset: {
    width: 0,
    height: 2,
  },
},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  roomName: {
    fontSize: 19,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  confirmedBadge: {
    backgroundColor: '#dcfce7',
  },

  cancelledBadge: {
    backgroundColor: '#fee2e2',
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  infoContainer: {
    gap: 7,
  },

  info: {
    fontSize: 15,
    color: '#555',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  empty: {
    fontSize: 17,
    color: '#555',
    textAlign: 'center',
  },

  emptyHint: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});

