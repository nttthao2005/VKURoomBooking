
import React, {
  useMemo,
  useState,
  useRef,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
   ViewToken,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getRooms,
  getRoomSlots,
} from '../../services/roomService';
import { Room } from '../../types/room';

import CapacitySelector from '../../components/CapacitySelector';
import StatusSelector from '../../components/StatusSelector';
import RoomCard from '../../components/RoomCard';
import { useBookingStore } from '../../store/bookingStore';
import { useQuery } from '@tanstack/react-query';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  MainStackParamList,
} from '../../navigation/MainTabNavigator';

type CapacityFilter =
  | 'all'
  | 'small'
  | 'medium'
  | 'large';

type StatusFilter =
  | 'all'
  | 'available'
  | 'maintenance';

type PickerMode =
  | 'date'
  | 'startTime'
  | 'endTime'
  | null;

const HOUR_OPTIONS = Array.from(
  { length: 17 },
  (_, index) => index + 6
);

type Props = NativeStackScreenProps<
  MainStackParamList,
  'Home'
>;

export default function HomeScreen({
  navigation,
}: Props) {
  const [search, setSearch] =
    useState('');
  // =========================
  // DATE + TIME
  // =========================
const {
  selectedDate,
  startTime,
  endTime,
  setSelectedDate,
  setStartTime,
  setEndTime,

  capacityFilter,
  setCapacityFilter,

  statusFilter,
  setStatusFilter,
} = useBookingStore();

const {
  data: rooms = [],
  isLoading: roomsLoading,
  refetch: refetchRooms,
} = useQuery({
  queryKey: ['rooms'],
  queryFn: getRooms,
});

const {
  data: roomSlots = [],
  isLoading: roomSlotsLoading,
  refetch: refetchRoomSlots,
} = useQuery({
  queryKey: ['roomSlots'],
  queryFn: getRoomSlots,
});

const loading =
  roomsLoading || roomSlotsLoading;

  const [pickerMode, setPickerMode] =
    useState<PickerMode>(null);
const [visibleRoomIds, setVisibleRoomIds] = useState<Set<string>>( new Set() ); const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 20, }).current; const onViewableItemsChanged = useRef( ({ viewableItems, }: { viewableItems: ViewToken[]; }) => { setVisibleRoomIds((previous) => { const next = new Set<string>(); viewableItems.forEach((token) => { const room = token.item as Room; if (room?.id) { next.add(room.id); } }); return next; }); } ).current;
  // =========================
  // DATE
  // =========================

  const selectedDateString =
    formatDateForFirestore(
      selectedDate
    );

  // =========================
  // REQUIRED SLOTS
  // =========================

  const requiredSlots = useMemo(() => {
    return generateSlots(
      startTime,
      endTime
    );
  }, [
    startTime,
    endTime,
  ]);

  // =========================
  // FILTER ROOMS
  // =========================

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      const matchesSearch =
        keyword === '' ||
        room.name
          .toLowerCase()
          .includes(keyword) ||
        room.location
          .toLowerCase()
          .includes(keyword) ||
        room.lab
          .toLowerCase()
          .includes(keyword);

      // =====================
      // CAPACITY
      // =====================

      let matchesCapacity = true;

      if (
        capacityFilter === 'small'
      ) {
        matchesCapacity =
          room.capacity < 40;
      }

      if (
        capacityFilter === 'medium'
      ) {
        matchesCapacity =
          room.capacity >= 40 &&
          room.capacity <= 60;
      }

      if (
        capacityFilter === 'large'
      ) {
        matchesCapacity =
          room.capacity > 60;
      }

      // =====================
      // STATUS
      // =====================

      const matchesStatus =
        statusFilter === 'all' ||
        room.status === statusFilter;

      // =====================
      // TIME
      // =====================

      const isMaintenance =
        room.status === 'maintenance';

      const isBookedAtSelectedTime =
        roomSlots.some((slot) => {
          return (
            slot.roomId === room.id &&
            slot.date ===
              selectedDateString &&
            requiredSlots.includes(
              slot.slot
            )
          );
        });

      const matchesTime =
        isMaintenance
          ? statusFilter ===
            'maintenance'
          : !isBookedAtSelectedTime;

      return (
        matchesSearch &&
        matchesCapacity &&
        matchesStatus &&
        matchesTime
      );
    });
  }, [
    rooms,
    roomSlots,
    search,
    capacityFilter,
    statusFilter,
    selectedDateString,
    requiredSlots,
  ]);

  // =========================
  // PICKER
  // =========================

  const openDatePicker = () => {
    setPickerMode('date');
  };

  const openStartTimePicker = () => {
    setPickerMode('startTime');
  };

  const openEndTimePicker = () => {
    setPickerMode('endTime');
  };

  // =========================
  // SELECT HOUR
  // =========================

  const selectTime = (
    hour: number
  ) => {
    const selected =
      createTime(hour, 0);

    if (
      pickerMode === 'startTime'
    ) {
      if (selected >= endTime) {
        Alert.alert(
          'Thời gian không hợp lệ',
          'Giờ bắt đầu phải nhỏ hơn giờ kết thúc.'
        );

        return;
      }

      setStartTime(selected);
      setPickerMode(null);
      return;
    }

    if (
      pickerMode === 'endTime'
    ) {
      if (selected <= startTime) {
        Alert.alert(
          'Thời gian không hợp lệ',
          'Giờ kết thúc phải lớn hơn giờ bắt đầu.'
        );

        return;
      }

      setEndTime(selected);
      setPickerMode(null);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <View
          style={
            styles.loadingIcon
          }
        >
          <Text
            style={
              styles.loadingIconText
            }
          >
            VKU
          </Text>
        </View>

        <ActivityIndicator
          size="small"
          color="#2563eb"
        />

        <Text
          style={styles.loadingText}
        >
          Đang tải danh sách phòng...
        </Text>
      </View>
    );
  }
  // =========================
  // UI
  // =========================

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) =>
          item.id
        }
      

renderItem={({ item, index }) => (
  <RoomCard
    room={item}

    isVisible={
      visibleRoomIds.has(item.id)
    }

    animationDelay={
      (index % 4) * 70
    }

    onBooking={(room) => {
      navigation.navigate(
        'Booking',
        {
          room,
          selectedDate:
            selectedDateString,
          startTime:
            formatTime(startTime),
          endTime:
            formatTime(endTime),
        }
      );
    }}
  />
)}


onViewableItemsChanged={ onViewableItemsChanged }
viewabilityConfig={viewabilityConfig}

        showsVerticalScrollIndicator={
          false
        }
        refreshing={loading}
onRefresh={() => {
  refetchRooms();
  refetchRoomSlots();
}}
        contentContainerStyle={
          styles.listContent
        }

        ListHeaderComponent={
          <>
            {/* ===================== */}
            {/* HEADER */}
            {/* ===================== */}

            <View
              style={styles.header}
            >
              <View>
                <Text
                  style={styles.eyebrow}
                >
                  VKU CAMPUS
                </Text>

                <Text
                  style={styles.title}
                >
                  Đặt phòng học
                </Text>

                <Text
                  style={styles.subtitle}
                >
                  Tìm không gian phù hợp
                  với lịch của bạn
                </Text>
              </View>

              <View
                style={
                  styles.headerBadge
                }
              >
                <Text
                  style={
                    styles.headerBadgeText
                  }
                >
                  VKU
                </Text>
              </View>
            </View>

            {/* ===================== */}
            {/* SEARCH */}
            {/* ===================== */}

            <View
              style={
                styles.searchContainer
              }
            >
              <View
                style={
                  styles.searchIconBox
                }
              >
                <Text
                  style={
                    styles.searchIcon
                  }
                >
                  🔍
                </Text>
              </View>

              <TextInput
                style={
                  styles.searchInput
                }
                placeholder="Tìm phòng hoặc địa điểm..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />

              {search.length > 0 && (
                <Pressable
                  onPress={() =>
                    setSearch('')
                  }
                  style={
                    styles.clearButton
                  }
                >
                  <Text
                    style={
                      styles.clearButtonText
                    }
                  >
                    ×
                  </Text>
                </Pressable>
              )}
            </View>

            {/* ===================== */}
            {/* SCHEDULE TITLE */}
            {/* ===================== */}

            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text style={styles.sectionTitle}>
  Bộ lọc
</Text>

<Text style={styles.sectionHint}>
  Chọn điều kiện để tìm phòng phù hợp
</Text>
              </View>
            </View>

            {/* ===================== */}
            {/* SCHEDULE CARD */}
            {/* ===================== */}

            <View
              style={
                styles.scheduleCard
              }
            >
              {/* DATE */}

              <Pressable
                style={
                  styles.dateSelector
                }
                onPress={
                  openDatePicker
                }
              >
                <View
                  style={
                    styles.dateIconBox
                  }
                >
                  <Text
                    style={
                      styles.dateIcon
                    }
                  >
                    📅
                  </Text>
                </View>

                <View
                  style={
                    styles.selectorContent
                  }
                >
                  <Text
                    style={
                      styles.selectorLabel
                    }
                  >
                    NGÀY SỬ DỤNG
                  </Text>

                  <Text
                    style={
                      styles.selectorValue
                    }
                  >
                    {formatVietnameseDate(
                      selectedDate
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.arrowCircle
                  }
                >
                  <Text
                    style={
                      styles.arrowCircleText
                    }
                  >
                    ›
                  </Text>
                </View>
              </Pressable>

              {/* DIVIDER */}

              <View
                style={styles.divider}
              />

              {/* TIME */}

              <View
                style={styles.timeRow}
              >
                <Pressable
                  style={
                    styles.timeSelector
                  }
                  onPress={
                    openStartTimePicker
                  }
                >
                  <View
                    style={
                      styles.timeIconBox
                    }
                  >
                    <Text
                      style={
                        styles.timeIcon
                      }
                    >
                      ◷
                    </Text>
                  </View>

                  <View
                    style={
                      styles.timeContent
                    }
                  >
                    <Text
                      style={
                        styles.selectorLabel
                      }
                    >
                      BẮT ĐẦU
                    </Text>

                    <Text
                      style={
                        styles.timeValue
                      }
                    >
                      {formatTime(
                        startTime
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.smallArrow
                    }
                  >
                    ›
                  </Text>
                </Pressable>

                <View
                  style={
                    styles.timeArrowBox
                  }
                >
                  <Text
                    style={
                      styles.timeArrow
                    }
                  >
                    →
                  </Text>
                </View>

                <Pressable
                  style={
                    styles.timeSelector
                  }
                  onPress={
                    openEndTimePicker
                  }
                >
                  <View
                    style={
                      styles.timeIconBox
                    }
                  >
                    <Text
                      style={
                        styles.timeIcon
                      }
                    >
                      ◷
                    </Text>
                  </View>

                  <View
                    style={
                      styles.timeContent
                    }
                  >
                    <Text
                      style={
                        styles.selectorLabel
                      }
                    >
                      KẾT THÚC
                    </Text>

                    <Text
                      style={
                        styles.timeValue
                      }
                    >
                      {formatTime(
                        endTime
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.smallArrow
                    }
                  >
                    ›
                  </Text>
                </Pressable>
                
              </View>
              <View style={styles.filterDivider} />

<View style={styles.innerFilterHeader}>
  <Text style={styles.innerFilterTitle}>
    Sức chứa
  </Text>
</View>

<CapacitySelector
  value={capacityFilter}
  onChange={setCapacityFilter}
/>

<View style={styles.innerFilterHeader}>
  <Text style={styles.innerFilterTitle}>
    Trạng thái
  </Text>
</View>

<StatusSelector
  value={statusFilter}
  onChange={setStatusFilter}
/>
            </View>


            {/* ===================== */}
            {/* RESULT */}
            {/* ===================== */}

            <View
              style={
                styles.resultHeader
              }
            >
              <View
                style={
                  styles.resultLeft
                }
              >
                <Text
                  style={
                    styles.resultTitle
                  }
                >
                  Phòng phù hợp
                </Text>

                <Text
                  style={
                    styles.resultSubtitle
                  }
                >
                  {formatTime(
                    startTime
                  )}
                  {'  →  '}
                  {formatTime(
                    endTime
                  )}
                  {'  •  '}
                  {formatShortDate(
                    selectedDate
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.countBadge
                }
              >
                <Text
                  style={
                    styles.countText
                  }
                >
                  {filteredRooms.length}
                </Text>

                <Text
                  style={
                    styles.countLabel
                  }
                >
                  phòng
                </Text>
              </View>
            </View>
          </>
        }

        ListEmptyComponent={
          <View
            style={styles.empty}
          >
            <View
              style={
                styles.emptyIconBox
              }
            >
              <Text
                style={
                  styles.emptyIcon
                }
              >
                🏫
              </Text>
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Không tìm thấy phòng
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Thử thay đổi ngày, giờ
              hoặc bộ lọc để xem thêm
              phòng.
            </Text>
          </View>
        }
      />

      {/* ========================= */}
      {/* DATE / TIME MODAL */}
      {/* ========================= */}

      {pickerMode && (
        <Modal
          transparent
          animationType="slide"
          visible={true}
          onRequestClose={() =>
            setPickerMode(null)
          }
        >
          <Pressable
            style={
              styles.modalOverlay
            }
            onPress={() =>
              setPickerMode(null)
            }
          >
            <Pressable
              style={
                styles.pickerCard
              }
              onPress={(event) =>
                event.stopPropagation()
              }
            >
              {/* HANDLE */}

              <View
                style={
                  styles.modalHandle
                }
              />

              {/* HEADER */}

              <View
                style={
                  styles.pickerHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.pickerEyebrow
                    }
                  >
                    THỜI GIAN ĐẶT PHÒNG
                  </Text>

                  <Text
                    style={
                      styles.pickerTitle
                    }
                  >
                    {pickerMode ===
                    'date'
                      ? 'Chọn ngày'
                      : pickerMode ===
                        'startTime'
                      ? 'Giờ bắt đầu'
                      : 'Giờ kết thúc'}
                  </Text>
                </View>

                <Pressable
                  style={
                    styles.closeButton
                  }
                  onPress={() =>
                    setPickerMode(null)
                  }
                >
                  <Text
                    style={
                      styles.closeButtonText
                    }
                  >
                    ×
                  </Text>
                </Pressable>
              </View>

              {/* DATE PICKER */}

              {pickerMode ===
              'date' ? (
                <>
                  <View
                    style={
                      styles.datePickerWrapper
                    }
                  >
                    <DateTimePicker
                      value={
                        selectedDate
                      }
                      mode="date"
                      display="spinner"
                      onValueChange={(
                        event,
                        value
                      ) => {
                        if (value) {
                          setSelectedDate(
                            value
                          );
                        }
                      }}
                      onDismiss={() =>
                        setPickerMode(
                          null
                        )
                      }
                    />
                  </View>

                  <Pressable
                    style={
                      styles.confirmButton
                    }
                    onPress={() =>
                      setPickerMode(
                        null
                      )
                    }
                  >
                    <Text
                      style={
                        styles.confirmButtonText
                      }
                    >
                      Xác nhận ngày
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text
                    style={
                      styles.currentTimeHint
                    }
                  >
                    Chọn một trong các
                    khung giờ bên dưới
                  </Text>

                  <View
                    style={
                      styles.hourGrid
                    }
                  >
                    {HOUR_OPTIONS.map(
                      (hour) => {
                        const selectedHour =
                          pickerMode ===
                          'startTime'
                            ? startTime.getHours()
                            : endTime.getHours();

                        const isSelected =
                          selectedHour ===
                          hour;

                        return (
                          <Pressable
                            key={hour}
                            style={[
                              styles.hourButton,
                              isSelected &&
                                styles.hourButtonSelected,
                            ]}
                            onPress={() =>
                              selectTime(
                                hour
                              )
                            }
                          >
                            <Text
                              style={[
                                styles.hourButtonText,
                                isSelected &&
                                  styles.hourButtonTextSelected,
                              ]}
                            >
                              {String(
                                hour
                              ).padStart(
                                2,
                                '0'
                              )}
                              :00
                            </Text>

                            {isSelected && (
                              <View
                                style={
                                  styles.selectedDot
                                }
                              />
                            )}
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// =====================================================
// HELPERS
// =====================================================

function createTime(
  hour: number,
  minute: number
) {
  const date = new Date();

  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

function normalizeToHour(
  date: Date
) {
  const result =
    new Date(date);

  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);

  return result;
}

function generateSlots(
  start: Date,
  end: Date
) {
  const slots: string[] = [];

  const current =
    normalizeToHour(start);

  const finish =
    normalizeToHour(end);

  while (current < finish) {
    slots.push(
      formatTime(current)
    );

    current.setHours(
      current.getHours() + 1
    );
  }

  return slots;
}

function formatTime(
  date: Date
) {
  return `${String(
    date.getHours()
  ).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

function formatDateForFirestore(
  date: Date
) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function formatVietnameseDate(
  date: Date
) {
  const weekdays = [
    'Chủ nhật',
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
  ];

  return `${weekdays[date.getDay()]}, ${String(
    date.getDate()
  ).padStart(2, '0')} tháng ${
    date.getMonth() + 1
  }, ${date.getFullYear()}`;
}

function formatShortDate(
  date: Date
) {
  return `${String(
    date.getDate()
  ).padStart(2, '0')}/${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // =========================
  // CONTAINER
  // =========================

  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  listContent: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 45,
  },

  // =========================
  // HEADER
  // =========================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#2563eb',
    marginBottom: 5,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: '#64748b',
  },

  headerBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#2563eb',
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

  headerBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // =========================
  // SEARCH
  // =========================

  searchContainer: {
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 26,

    shadowColor: '#0f172a',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  searchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchIcon: {
    fontSize: 16,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 11,
    fontSize: 14,
    color: '#0f172a',
  },

  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButtonText: {
    fontSize: 21,
    lineHeight: 23,
    color: '#64748b',
    fontWeight: '500',
  },

  // =========================
  // SECTION
  // =========================

  sectionHeader: {
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },

  sectionHint: {
    marginTop: 3,
    fontSize: 12,
    color: '#94a3b8',
  },

  // =========================
  // SCHEDULE
  // =========================

  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',

    shadowColor: '#0f172a',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 15,
    backgroundColor: '#f8fafc',
  },

  dateIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateIcon: {
    fontSize: 18,
  },

  selectorContent: {
    flex: 1,
    marginLeft: 12,
  },

  selectorLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94a3b8',
    marginBottom: 4,
  },

  selectorValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },

  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  arrowCircleText: {
    fontSize: 21,
    lineHeight: 23,
    color: '#64748b',
  },

  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
    marginHorizontal: 5,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeSelector: {
    flex: 1,
    minHeight: 68,
    borderRadius: 15,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  timeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeIcon: {
    fontSize: 22,
    color: '#2563eb',
  },

  timeContent: {
    marginLeft: 8,
    flex: 1,
  },

  timeValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#2563eb',
  },

  smallArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },

  timeArrowBox: {
    width: 28,
    alignItems: 'center',
  },

  timeArrow: {
    fontSize: 16,
    color: '#94a3b8',
  },

  // =========================
  // RESULT
  // =========================

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 14,
  },

  resultLeft: {
    flex: 1,
  },

  resultTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
  },

  resultSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },

  countBadge: {
    minWidth: 55,
    height: 42,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },

  countText: {
    color: '#1d4ed8',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },

  countLabel: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },

  // =========================
  // EMPTY
  // =========================

  empty: {
    alignItems: 'center',
    paddingVertical: 55,
    paddingHorizontal: 35,
  },

  emptyIconBox: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyIcon: {
    fontSize: 34,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#334155',
  },

  emptyText: {
    marginTop: 7,
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // =========================
  // LOADING
  // =========================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },

  loadingIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
  },

  // =========================
  // MODAL
  // =========================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },

  pickerCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
  },

  modalHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    marginBottom: 18,
  },

  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  pickerEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 4,
  },

  pickerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 25,
    lineHeight: 27,
    color: '#64748b',
    fontWeight: '400',
  },

  // =========================
  // DATE PICKER
  // =========================

  datePickerWrapper: {
    alignItems: 'center',
    paddingVertical: 5,
  },

  confirmButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,

    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },

  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  // =========================
  // TIME PICKER
  // =========================

  currentTimeHint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 14,
  },

  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  hourButton: {
    width: '31.5%',
    height: 51,
    borderRadius: 13,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },

  hourButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  hourButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },

  hourButtonTextSelected: {
    color: '#fff',
    fontWeight: '800',
  },

  selectedDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  filterDivider: {
  height: 1,
  backgroundColor: '#f1f5f9',
  marginTop: 16,
  marginBottom: 14,
},

innerFilterHeader: {
  marginBottom: 8,
},

innerFilterTitle: {
  fontSize: 13,
  fontWeight: '800',
  color: '#334155',
},
});
