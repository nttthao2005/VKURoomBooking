import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../../services/firebase';
import {
  adminCancelBooking,
} from '../../services/bookingService';
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

export default function AdminBookingsScreen({
  navigation,
}: any) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
const [userNames, setUserNames] = useState<
  Record<string, string>
>({});
  const loadBookings = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(
        collection(db, 'bookings')
      );

      const data: Booking[] = snapshot.docs.map(
        (item) => ({
          id: item.id,
          ...(item.data() as Omit<Booking, 'id'>),
        })
      );

      // Sắp xếp lịch mới nhất lên trên
      data.sort((a, b) => {
        const dateA = `${a.date} ${a.startTime}`;
        const dateB = `${b.date} ${b.startTime}`;

        return dateB.localeCompare(dateA);
      });

      const usersSnapshot = await getDocs(
      collection(db, 'users')
    );

    const names: Record<string, string> = {};
 usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();

      names[doc.id] =
        data.name ||
        data.fullName ||
        data.displayName ||
        'Không rõ tên';
    });

    setUserNames(names);
      setBookings(data);
    } catch (error) {
      console.error('Lỗi tải lịch đặt:', error);

      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách lịch đặt.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const renderBooking = ({
    item,
  }: {
    item: Booking;
  }) => {
    const isCancelled =
      item.status === 'cancelled';

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.roomName}>
            {item.roomName}
          </Text>

          <View
            style={[
              styles.statusBadge,
              isCancelled
                ? styles.cancelledBadge
                : styles.confirmedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCancelled
                  ? styles.cancelledText
                  : styles.confirmedText,
              ]}
            >
              {isCancelled
                ? 'Đã hủy'
                : 'Đã xác nhận'}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Ngày:
          </Text>

          <Text style={styles.value}>
            {item.date}
          </Text>
        </View>

        {/* Time */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Thời gian:
          </Text>

          <Text style={styles.value}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>

        {/* User */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Người đặt:
          </Text>

          <Text
            style={styles.userId}
            numberOfLines={1}
          >
            {userNames[item.userId] ||
  'Không rõ tên'}
          </Text>
        </View>

        {/* Booking ID */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Mã đặt:
          </Text>

          <Text
            style={styles.bookingId}
            numberOfLines={1}
          >
            {item.id}
          </Text>
        </View>
        {item.status === 'confirmed' && (
  <Pressable
    style={styles.cancelButton}
    onPress={() => {
      Alert.alert(
        'Hủy lịch đặt',
        `Bạn có chắc muốn hủy lịch ${item.roomName} ngày ${item.date} từ ${item.startTime} đến ${item.endTime}?`,
        [
          {
            text: 'Không',
            style: 'cancel',
          },
          {
            text: 'Hủy lịch',
            style: 'destructive',
            onPress: async () => {
              try {
                await adminCancelBooking({
                  bookingId: item.id,
                  roomId: item.roomId,
                  date: item.date,
                  startTime: item.startTime,
                  endTime: item.endTime,
                });

                Alert.alert(
                  'Thành công',
                  'Đã hủy lịch đặt phòng.'
                );

                loadBookings();
              } catch (error: any) {
                console.error(
                  'Lỗi hủy lịch:',
                  error
                );

                Alert.alert(
                  'Lỗi',
                  error?.message ||
                    'Không thể hủy lịch đặt phòng.'
                );
              }
            },
          },
        ]
      );
    }}
  >
    <Text style={styles.cancelButtonText}>
      Hủy lịch
    </Text>
  </Pressable>
)}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Đang tải lịch đặt...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
                  style={styles.backButton}
                  onPress={() =>
                    navigation.goBack()
                  }
                >
                  <Text style={styles.backText}>
                    ‹
                  </Text>
                </Pressable>
        <View>
          <Text style={styles.title}>
            Quản lý lịch đặt
          </Text>

          <Text style={styles.subtitle}>
            Tất cả lịch đặt phòng
          </Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={loadBookings}
        >
          <Text style={styles.refreshText}>
            ↻
          </Text>
        </Pressable>
      </View>

      {/* Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Tổng số lịch đặt:{' '}
          <Text style={styles.countNumber}>
            {bookings.length}
          </Text>
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={
          bookings.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadBookings}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>
              📅
            </Text>

            <Text style={styles.emptyTitle}>
              Chưa có lịch đặt
            </Text>

            <Text style={styles.emptyText}>
              Hiện tại chưa có lịch đặt phòng nào.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 30,
    lineHeight: 32,
    color: '#0f172a',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#6B7280',
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshText: {
    fontSize: 26,
    color: '#4F46E5',
  },

  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  countText: {
    fontSize: 14,
    color: '#6B7280',
  },

  countNumber: {
    fontWeight: '700',
    color: '#111827',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  roomName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginRight: 10,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  confirmedBadge: {
    backgroundColor: '#DCFCE7',
  },

  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  confirmedText: {
    color: '#15803D',
  },

  cancelledText: {
    color: '#B91C1C',
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 9,
  },

  label: {
    width: 95,
    fontSize: 14,
    color: '#6B7280',
  },

  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  userId: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },

  bookingId: {
    flex: 1,
    fontSize: 12,
    color: '#9CA3AF',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FB',
  },

  loadingText: {
    marginTop: 10,
    color: '#6B7280',
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyBox: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  cancelButton: {
  marginTop: 14,
  height: 44,
  borderRadius: 10,
  backgroundColor: '#FEE2E2',
  alignItems: 'center',
  justifyContent: 'center',
},

cancelButtonText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#B91C1C',
},
});