import React from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { createBooking } from '../../services/bookingService';
import { auth } from '../../services/firebase';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  MainStackParamList,
} from '../../navigation/MainTabNavigator';
/* =========================
   HELPER
========================= */

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);

  return hours * 60 + minutes;
}

function formatDisplayDate(value?: string) {
  if (!value) {
    return 'Chưa chọn';
  }

  const parts = value.split('-');

  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;

  return `${day}/${month}/${year}`;
}

/* =========================
   SCREEN
========================= */
type Props = NativeStackScreenProps<
  MainStackParamList,
  'Booking'
>;

export default function BookingScreen({
  route,
  navigation,
}: Props) {
  const {
    room,
    selectedDate,
    startTime,
    endTime,
  } = route.params || {};
  const queryClient = useQueryClient();

  /*
   * Dữ liệu được truyền trực tiếp từ HomeScreen.
   *
   * Ví dụ:
   *
   * selectedDate = "2026-10-01"
   * startTime = "08:00"
   * endTime = "10:00"
   *
   * BookingScreen KHÔNG tự tạo lại ngày/giờ.
   */

  /* =========================
     BOOKING
  ========================= */

  const handleBooking = async () => {
    // Kiểm tra dữ liệu từ HomeScreen
    if (!room) {
      Alert.alert(
        'Lỗi',
        'Không tìm thấy thông tin phòng.'
      );
      return;
    }

    if (!selectedDate || !startTime || !endTime) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng quay lại HomeScreen và chọn đầy đủ ngày, giờ và phòng.'
      );
      return;
    }

    // Chuyển giờ thành phút
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Giờ kết thúc phải sau giờ bắt đầu
    if (endMinutes <= startMinutes) {
      Alert.alert(
        'Thời gian không hợp lệ',
        'Giờ kết thúc phải sau giờ bắt đầu.'
      );
      return;
    }

    // Chỉ cho phép giờ tròn
    if (
      startMinutes % 60 !== 0 ||
      endMinutes % 60 !== 0
    ) {
      Alert.alert(
        'Thời gian không hợp lệ',
        'Vui lòng chọn giờ tròn, ví dụ 08:00, 09:00, 10:00.'
      );
      return;
    }

    // Kiểm tra đăng nhập
    if (!auth.currentUser) {
      Alert.alert(
        'Lỗi',
        'Bạn cần đăng nhập để đặt phòng.'
      );
      return;
    }

    try {
      await createBooking({
        roomId: room.id,
        roomName: room.name,
        userId: auth.currentUser.uid,
        date: selectedDate,
        startTime,
        endTime,
      });
await queryClient.invalidateQueries({
  queryKey: ['roomSlots'],
});
      Alert.alert(
        'Đặt phòng thành công',
        `${room.name}\n${formatDisplayDate(selectedDate)}\n${startTime} - ${endTime}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
  console.error('Booking error:', error);

  Alert.alert(
    'Không thể đặt phòng',
    error instanceof Error
      ? error.message
      : 'Đã xảy ra lỗi.'
  );
}
  };

  /* =========================
     UI
  ========================= */

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Xác nhận đặt phòng
            </Text>

            <Text style={styles.subtitle}>
              Kiểm tra thông tin trước khi xác nhận
            </Text>
          </View>
        </View>

        {/* ROOM INFORMATION */}

        <View style={styles.roomCard}>
          <View style={styles.roomTopRow}>
            <View style={styles.roomIconBox}>
              <Text style={styles.roomIcon}>
                🏫
              </Text>
            </View>

            <View style={styles.roomMainInfo}>
              <Text style={styles.roomName}>
                {room?.name || 'Phòng học'}
              </Text>

              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>
                  📍
                </Text>

                <Text style={styles.locationText}>
                  {room?.location || 'Chưa cập nhật'}
                </Text>
              </View>
            </View>

            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />

              <Text style={styles.availableText}>
                Trống
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.roomDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>
                🏫
              </Text>

              <View>
                <Text style={styles.detailLabel}>
                  Loại phòng
                </Text>

                <Text style={styles.detailValue}>
                  {room?.lab || 'Phòng học'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>
                👥
              </Text>

              <View>
                <Text style={styles.detailLabel}>
                  Sức chứa
                </Text>

                <Text style={styles.detailValue}>
                  {room?.capacity || 0} chỗ
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* TIME SECTION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Thời gian đặt phòng
          </Text>
        </View>

        {/* DATE */}

        <Text style={styles.label}>
          Ngày sử dụng
        </Text>

        <View style={styles.selector}>
          <View style={styles.selectorIconBox}>
            <Text style={styles.selectorIcon}>
              📅
            </Text>
          </View>

          <View style={styles.selectorContent}>
            <Text style={styles.selectorLabel}>
              Ngày đặt phòng
            </Text>

            <Text style={styles.selectorValue}>
              {formatDisplayDate(selectedDate)}
            </Text>
          </View>
        </View>

        {/* TIME */}

        <View style={styles.timeSectionHeader}>
          <Text style={styles.label}>
            Khung giờ
          </Text>
        </View>

        <View style={styles.timeRow}>
          {/* START */}

          <View style={styles.timeCard}>
            <View style={styles.timeIconBox}>
              <Text style={styles.clockIcon}>
                🕐
              </Text>
            </View>

            <Text style={styles.timeLabel}>
              Bắt đầu
            </Text>

            <Text style={styles.timeValue}>
              {startTime || '--:--'}
            </Text>
          </View>

          {/* ARROW */}

          <View style={styles.rangeArrow}>
            <Text style={styles.rangeArrowText}>
              →
            </Text>
          </View>

          {/* END */}

          <View style={styles.timeCard}>
            <View style={styles.timeIconBox}>
              <Text style={styles.clockIcon}>
                🕐
              </Text>
            </View>

            <Text style={styles.timeLabel}>
              Kết thúc
            </Text>

            <Text style={styles.timeValue}>
              {endTime || '--:--'}
            </Text>
          </View>
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>
              Thông tin đặt phòng
            </Text>

            <Text style={styles.summaryIcon}>
              ✓
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Phòng
            </Text>

            <Text style={styles.summaryValue}>
              {room?.name || 'Phòng học'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Ngày
            </Text>

            <Text style={styles.summaryValue}>
              {formatDisplayDate(selectedDate)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Thời gian
            </Text>

            <Text style={styles.summaryValueBlue}>
              {startTime || '--:--'}
              {' → '}
              {endTime || '--:--'}
            </Text>
          </View>
        </View>

        {/* BOOKING BUTTON */}

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleBooking}
        >
          <Text style={styles.buttonText}>
            Xác nhận đặt phòng
          </Text>

          <Text style={styles.buttonArrow}>
            →
          </Text>
        </TouchableOpacity>

        {/* CANCEL */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>
            Quay lại
          </Text>
        </TouchableOpacity>

        <Text style={styles.bottomHint}>
          Ngày và thời gian được lấy từ lựa chọn
          trên trang tìm kiếm phòng.
        </Text>
      </ScrollView>
    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 32,
    color: '#334155',
    marginTop: -2,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0f172a',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
  },

  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  roomTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roomIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  roomIcon: {
    fontSize: 22,
  },

  roomMainInfo: {
    flex: 1,
  },

  roomName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },

  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },

  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginRight: 5,
  },

  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },

  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 15,
  },

  roomDetails: {
    flexDirection: 'row',
    gap: 28,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    fontSize: 16,
    marginRight: 7,
  },

  detailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },

  sectionHint: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },

  selector: {
    minHeight: 66,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  selectorIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectorIcon: {
    fontSize: 19,
  },

  selectorContent: {
    flex: 1,
    marginLeft: 11,
  },

  selectorLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 3,
  },

  selectorValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },

  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timeHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 7,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  timeCard: {
    flex: 1,
    minHeight: 104,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },

  timeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  clockIcon: {
    fontSize: 17,
  },

  timeLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 2,
  },

  timeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563eb',
  },

  rangeArrow: {
    width: 32,
    alignItems: 'center',
  },

  rangeArrowText: {
    fontSize: 18,
    color: '#94a3b8',
  },

  summaryCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e3a8a',
  },

  summaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: '800',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
  },

  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  summaryValueBlue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563eb',
  },

  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  buttonArrow: {
    color: '#fff',
    fontSize: 21,
    marginLeft: 9,
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  cancelText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },

  bottomHint: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 25,
  },
});
