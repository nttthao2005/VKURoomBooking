import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../../services/firebase';

type Room = {
  id: string;
  name: string;
  location: string;
  lab: string;
  capacity: number;
  status: 'available' | 'maintenance';
  image: string;
  description: string;
};

type RoomSlot = {
  roomId: string;
  date: string;
  slot: string;
};

type RoomWithStatus = Room & {
  isOccupied: boolean;
};

const HOUR_OPTIONS = Array.from(
  { length: 17 },
  (_, index) => index + 6
);

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');
  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  const day = String(
    date.getDate()
  ).padStart(2, '0');

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function generateRequiredSlots(
  startHour: number,
  endHour: number
) {
  const slots: string[] = [];

  for (
    let hour = startHour;
    hour < endHour;
    hour++
  ) {
    slots.push(
      `${String(hour).padStart(2, '0')}:00`
    );
  }

  return slots;
}

export default function AdminRoomStatusScreen({
  navigation,
}: any) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomSlots, setRoomSlots] = useState<RoomSlot[]>([]);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [startHour, setStartHour] =
    useState(8);

  const [endHour, setEndHour] =
    useState(9);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showStartPicker, setShowStartPicker] =
    useState(false);

  const [showEndPicker, setShowEndPicker] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const roomsSnapshot = await getDocs(
        collection(db, 'rooms')
      );

      const roomsData: Room[] =
        roomsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<
            Room,
            'id'
          >),
        }));

      const slotsSnapshot = await getDocs(
        collection(db, 'roomSlots')
      );

      const slotsData: RoomSlot[] =
        slotsSnapshot.docs.map((doc) => ({
          ...(doc.data() as RoomSlot),
        }));

      setRooms(roomsData);
      setRoomSlots(slotsData);
    } catch (error) {
      console.error(
        'Lỗi tải tình trạng phòng:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDateString =
    formatDate(selectedDate);

  const requiredSlots =
    generateRequiredSlots(
      startHour,
      endHour
    );

  const roomStatus: RoomWithStatus[] =
    rooms.map((room) => {
      if (room.status === 'maintenance') {
        return {
          ...room,
          isOccupied: false,
        };
      }

      const isOccupied =
        requiredSlots.some((requiredSlot) =>
          roomSlots.some(
            (slot) =>
              slot.roomId === room.id &&
              slot.date === selectedDateString &&
              slot.slot === requiredSlot
          )
        );

      return {
        ...room,
        isOccupied,
      };
    });

  const availableRooms =
    roomStatus.filter(
      (room) =>
        room.status === 'available' &&
        !room.isOccupied
    );

  const occupiedRooms =
    roomStatus.filter(
      (room) =>
        room.status === 'available' &&
        room.isOccupied
    );

  const maintenanceRooms =
    roomStatus.filter(
      (room) =>
        room.status === 'maintenance'
    );

  const handleStartHourChange = (
    hour: number
  ) => {
    setStartHour(hour);

    if (hour >= endHour) {
      setEndHour(
        Math.min(hour + 1, 22)
      );
    }

    setShowStartPicker(false);
  };

  const handleEndHourChange = (
    hour: number
  ) => {
    if (hour <= startHour) {
      return;
    }

    setEndHour(hour);
    setShowEndPicker(false);
  };

  const renderRoom = ({
    item,
  }: {
    item: RoomWithStatus;
  }) => {
    const isMaintenance =
      item.status === 'maintenance';

    const isAvailable =
      !isMaintenance &&
      !item.isOccupied;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>
              {item.name}
            </Text>

            <Text style={styles.location}>
              {item.location}
            </Text>

            <Text style={styles.lab}>
              {item.lab} • {item.capacity} chỗ
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isMaintenance
                ? styles.maintenanceBadge
                : isAvailable
                  ? styles.availableBadge
                  : styles.occupiedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isMaintenance
                  ? styles.maintenanceText
                  : isAvailable
                    ? styles.availableText
                    : styles.occupiedText,
              ]}
            >
              {isMaintenance
                ? 'Bảo trì'
                : isAvailable
                  ? 'Đang trống'
                  : 'Đã được đặt'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.timeInfo}>
          {formatDisplayDate(selectedDate)}
          {' • '}
          {String(startHour).padStart(2, '0')}:00
          {' - '}
          {String(endHour).padStart(2, '0')}:00
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Đang tải tình trạng phòng...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
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

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Tình trạng phòng
          </Text>

          <Text style={styles.subtitle}>
            Kiểm tra phòng trống theo thời gian
          </Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={loadData}
        >
          <Text style={styles.refreshText}>
            ↻
          </Text>
        </Pressable>
      </View>

      {/* FILTER */}
      <View style={styles.filterCard}>
        <Text style={styles.sectionTitle}>
          Kiểm tra thời gian
        </Text>

        {/* DATE */}
        <Text style={styles.label}>
          Ngày
        </Text>

        <Pressable
          style={styles.selector}
          onPress={() =>
            setShowDatePicker(true)
          }
        >
          <Text style={styles.selectorIcon}>
            📅
          </Text>

          <Text style={styles.selectorText}>
            {formatDisplayDate(
              selectedDate
            )}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(_, date) => {
              setShowDatePicker(false);

              if (date) {
                setSelectedDate(date);
              }
            }}
          />
        )}

        {/* TIME */}
        <View style={styles.timeRow}>
          <View style={styles.timeColumn}>
            <Text style={styles.label}>
              Từ
            </Text>

            <Pressable
              style={styles.selector}
              onPress={() =>
                setShowStartPicker(true)
              }
            >
              <Text style={styles.selectorIcon}>
                🕐
              </Text>

              <Text style={styles.selectorText}>
                {String(startHour).padStart(
                  2,
                  '0'
                )}
                :00
              </Text>
            </Pressable>
          </View>

          <View style={styles.timeArrow}>
            <Text style={styles.arrowText}>
              →
            </Text>
          </View>

          <View style={styles.timeColumn}>
            <Text style={styles.label}>
              Đến
            </Text>

            <Pressable
              style={styles.selector}
              onPress={() =>
                setShowEndPicker(true)
              }
            >
              <Text style={styles.selectorIcon}>
                🕐
              </Text>

              <Text style={styles.selectorText}>
                {String(endHour).padStart(
                  2,
                  '0'
                )}
                :00
              </Text>
            </Pressable>
          </View>
        </View>

        {/* START HOUR MODAL */}
        {showStartPicker && (
          <View style={styles.hourBox}>
            <Text style={styles.hourTitle}>
              Chọn giờ bắt đầu
            </Text>

            <FlatList
              horizontal
              data={HOUR_OPTIONS.filter(
                (hour) => hour < endHour
              )}
              keyExtractor={(item) =>
                String(item)
              }
              showsHorizontalScrollIndicator={
                false
              }
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.hourButton,
                    startHour === item &&
                      styles.selectedHour,
                  ]}
                  onPress={() =>
                    handleStartHourChange(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.hourText,
                      startHour === item &&
                        styles.selectedHourText,
                    ]}
                  >
                    {String(item).padStart(
                      2,
                      '0'
                    )}
                    :00
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* END HOUR MODAL */}
        {showEndPicker && (
          <View style={styles.hourBox}>
            <Text style={styles.hourTitle}>
              Chọn giờ kết thúc
            </Text>

            <FlatList
              horizontal
              data={HOUR_OPTIONS.filter(
                (hour) => hour > startHour
              )}
              keyExtractor={(item) =>
                String(item)
              }
              showsHorizontalScrollIndicator={
                false
              }
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.hourButton,
                    endHour === item &&
                      styles.selectedHour,
                  ]}
                  onPress={() =>
                    handleEndHourChange(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.hourText,
                      endHour === item &&
                        styles.selectedHourText,
                    ]}
                  >
                    {String(item).padStart(
                      2,
                      '0'
                    )}
                    :00
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}
      </View>

      {/* SUMMARY */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {availableRooms.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Đang trống
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {occupiedRooms.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Đã đặt
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {maintenanceRooms.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Bảo trì
          </Text>
        </View>
      </View>

      {/* ROOM LIST */}
      <FlatList
        data={roomStatus}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>
              🏫
            </Text>

            <Text style={styles.emptyTitle}>
              Chưa có phòng
            </Text>

            <Text style={styles.emptyText}>
              Hiện tại chưa có phòng nào
              trong hệ thống.
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
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 30,
    lineHeight: 32,
    color: '#0F172A',
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
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

  filterCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 7,
  },

  selector: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  selectorIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  selectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 14,
  },

  timeColumn: {
    flex: 1,
  },

  timeArrow: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 14,
  },

  arrowText: {
    fontSize: 20,
    color: '#64748B',
  },

  hourBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },

  hourTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  hourButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },

  selectedHour: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  hourText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  selectedHourText: {
    color: '#FFFFFF',
  },

  summary: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  roomInfo: {
    flex: 1,
    marginRight: 10,
  },

  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  location: {
    marginTop: 5,
    fontSize: 13,
    color: '#475569',
  },

  lab: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  availableBadge: {
    backgroundColor: '#DCFCE7',
  },

  occupiedBadge: {
    backgroundColor: '#FEE2E2',
  },

  maintenanceBadge: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  availableText: {
    color: '#15803D',
  },

  occupiedText: {
    color: '#B91C1C',
  },

  maintenanceText: {
    color: '#B45309',
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },

  timeInfo: {
    fontSize: 12,
    color: '#64748B',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#6B7280',
  },

  emptyBox: {
    alignItems: 'center',
    paddingTop: 50,
  },

  emptyIcon: {
    fontSize: 46,
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
});