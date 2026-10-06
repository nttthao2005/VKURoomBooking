import React, { useState } from 'react';
import { cancelBooking } from '../../services/bookingService';
import {
    ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Booking } from '../../types/booking';
type Props = NativeStackScreenProps<
  RootStackParamList,
  'BookingDetail'
>;

export default function BookingDetailScreen({
  navigation,
  route,
}: Props) {
  const { booking } = route.params;
const [cancelling, setCancelling] = useState(false);
  const isCancelled = booking.status === 'cancelled';
const queryClient = useQueryClient();
 const handleCancelBooking = () => {
  Alert.alert(
    'Hủy đặt phòng',
    `Bạn có chắc muốn hủy phòng "${booking.roomName}" không?`,
    [
      {
        text: 'Không',
        style: 'cancel',
      },
      {
        text: 'Hủy đặt phòng',
        style: 'destructive',
        onPress: async () => {
          try {
            setCancelling(true);

            const userId = booking.userId;

            await cancelBooking({
              bookingId: booking.id,
              roomId: booking.roomId,
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime,
              userId,
            });
await queryClient.invalidateQueries({
  queryKey: ['roomSlots'],
});
            Alert.alert(
              'Thành công',
              'Đã hủy đặt phòng thành công.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.goBack();
                  },
                },
              ]
            );
          } catch (error: any) {
            console.error(
              'Lỗi hủy đặt phòng:',
              error
            );

            Alert.alert(
              'Không thể hủy',
              error?.message ||
                'Đã xảy ra lỗi khi hủy đặt phòng.'
            );
          } finally {
            setCancelling(false);
          }
        },
      },
    ]
  );
};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Chi tiết đặt phòng
        </Text>

        <View style={styles.headerSpace} />
      </View>

      {/* Nội dung */}
      <View style={styles.content}>
        <View style={styles.roomCard}>
          <View style={styles.roomIcon}>
            <Text style={styles.roomIconText}>🏫</Text>
          </View>

          <View style={styles.roomInfo}>
            <Text style={styles.roomLabel}>
              PHÒNG HỌC
            </Text>

            <Text style={styles.roomName}>
              {booking.roomName}
            </Text>

            <Text style={styles.roomId}>
              Mã phòng: {booking.roomId}
            </Text>
          </View>
        </View>

        {/* Thông tin đặt phòng */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            Thông tin đặt phòng
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text>📅</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Ngày đặt
              </Text>

              <Text style={styles.infoValue}>
                {booking.date}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text>🕐</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Thời gian
              </Text>

              <Text style={styles.infoValue}>
                {booking.startTime} - {booking.endTime}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text>
                {isCancelled ? '❌' : '✅'}
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Trạng thái
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  isCancelled
                    ? styles.cancelledText
                    : styles.confirmedText,
                ]}
              >
                {isCancelled ? 'Đã hủy' : 'Đã đặt'}
              </Text>
            </View>
          </View>
        </View>

        {/* Nút hủy */}
        {!isCancelled && (
          <Pressable
  style={[
    styles.cancelButton,
    cancelling && styles.cancelButtonDisabled,
  ]}
  onPress={handleCancelBooking}
  disabled={cancelling}
>
  {cancelling ? (
    <View style={styles.cancelLoading}>
      <ActivityIndicator
        size="small"
        color="#ffffff"
      />

      <Text style={styles.cancelButtonText}>
        Đang hủy...
      </Text>
    </View>
  ) : (
    <Text style={styles.cancelButtonText}>
      Hủy đặt phòng
    </Text>
  )}
</Pressable>
        )}

        {isCancelled && (
          <View style={styles.cancelledNotice}>
            <Text style={styles.cancelledNoticeText}>
              Phòng này đã được hủy đặt.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  header: {
    height: 100,
    paddingTop: 45,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 34,
    lineHeight: 34,
    color: '#2563eb',
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  headerSpace: {
    width: 42,
  },

  content: {
    padding: 16,
  },

  roomCard: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  roomIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  roomIconText: {
    fontSize: 28,
  },

  roomInfo: {
    flex: 1,
  },

  roomLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#bfdbfe',
    letterSpacing: 1,
    marginBottom: 4,
  },

  roomName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#ffffff',
  },

  roomId: {
    marginTop: 5,
    fontSize: 13,
    color: '#dbeafe',
  },

  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },

  confirmedText: {
    color: '#16a34a',
  },

  cancelledText: {
    color: '#dc2626',
  },

  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
    marginLeft: 55,
  },

  cancelButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelledNotice: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },

  cancelledNoticeText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonDisabled: {
  opacity: 0.6,
},

cancelLoading: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
});