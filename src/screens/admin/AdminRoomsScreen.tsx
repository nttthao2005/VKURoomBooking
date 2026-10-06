import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
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

type RoomForm = {
  name: string;
  location: string;
  lab: string;
  capacity: string;
  image: string;
  description: string;
  status: 'available' | 'maintenance';
};

const EMPTY_FORM: RoomForm = {
  name: '',
  location: '',
  lab: '',
  capacity: '',
  image: '',
  description: '',
  status: 'available',
};

export default function AdminRoomsScreen({
  navigation,
}: any) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [editingRoom, setEditingRoom] =
    useState<Room | null>(null);

  const [form, setForm] =
    useState<RoomForm>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const loadRooms = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(
        collection(db, 'rooms')
      );

      const data: Room[] = snapshot.docs.map(
        (item) => ({
          id: item.id,
          ...(item.data() as Omit<Room, 'id'>),
        })
      );

      setRooms(data);
    } catch (error) {
      console.error(
        'Lỗi tải phòng:',
        error
      );

      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách phòng.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);

    setForm({
      name: room.name,
      location: room.location,
      lab: room.lab,
      capacity: String(room.capacity),
      image: room.image,
      description: room.description,
      status: room.status,
    });

    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalVisible(false);
    setEditingRoom(null);
    setForm(EMPTY_FORM);
  };

  const updateForm = (
    field: keyof RoomForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.location.trim() ||
      !form.lab.trim() ||
      !form.capacity.trim()
    ) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập đầy đủ tên phòng, vị trí, loại phòng và sức chứa.'
      );

      return;
    }

    const capacity = Number(form.capacity);

    if (
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      Alert.alert(
        'Sức chứa không hợp lệ',
        'Sức chứa phải là một số lớn hơn 0.'
      );

      return;
    }

    try {
      setSaving(true);

      const roomData = {
        name: form.name.trim(),
        location: form.location.trim(),
        lab: form.lab.trim(),
        capacity,
        status: form.status,
        image: form.image.trim(),
        description: form.description.trim(),
      };

      if (editingRoom) {
        await updateDoc(
          doc(db, 'rooms', editingRoom.id),
          roomData
        );

        Alert.alert(
          'Thành công',
          'Đã cập nhật phòng.'
        );
      } else {
        await addDoc(
          collection(db, 'rooms'),
          roomData
        );

        Alert.alert(
          'Thành công',
          'Đã thêm phòng mới.'
        );
      }

      closeModal();
      await loadRooms();
    } catch (error) {
      console.error(
        'Lỗi lưu phòng:',
        error
      );

      Alert.alert(
        'Lỗi',
        'Không thể lưu thông tin phòng.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (room: Room) => {
    Alert.alert(
      'Xóa phòng',
      `Bạn có chắc muốn xóa "${room.name}" không?`,
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, 'rooms', room.id)
              );

              setRooms((current) =>
                current.filter(
                  (item) =>
                    item.id !== room.id
                )
              );

              Alert.alert(
                'Thành công',
                'Đã xóa phòng.'
              );
            } catch (error) {
              console.error(
                'Lỗi xóa phòng:',
                error
              );

              Alert.alert(
                'Lỗi',
                'Không thể xóa phòng.'
              );
            }
          },
        },
      ]
    );
  };

  const toggleStatus = async (room: Room) => {
    const newStatus =
      room.status === 'available'
        ? 'maintenance'
        : 'available';

    try {
      await updateDoc(
        doc(db, 'rooms', room.id),
        {
          status: newStatus,
        }
      );

      setRooms((current) =>
        current.map((item) =>
          item.id === room.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        'Lỗi đổi trạng thái:',
        error
      );

      Alert.alert(
        'Lỗi',
        'Không thể thay đổi trạng thái phòng.'
      );
    }
  };

  const renderRoom = ({
    item,
  }: {
    item: Room;
  }) => {
    const isAvailable =
      item.status === 'available';

    return (
      <View style={styles.roomCard}>
        {item.image ? (
          <Image
            source={{
              uri: item.image,
            }}
            style={styles.roomImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>
              🏫
            </Text>
          </View>
        )}

        <View style={styles.roomContent}>
          <View style={styles.roomHeader}>
            <View style={styles.roomTitleContainer}>
              <Text
                style={styles.roomName}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text style={styles.roomLab}>
                {item.lab}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isAvailable
                  ? styles.availableBadge
                  : styles.maintenanceBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isAvailable
                    ? styles.availableText
                    : styles.maintenanceText,
                ]}
              >
                {isAvailable
                  ? 'Đang hoạt động'
                  : 'Bảo trì'}
              </Text>
            </View>
          </View>

          <Text style={styles.roomInfo}>
            📍 {item.location}
          </Text>

          <Text style={styles.roomInfo}>
            👥 {item.capacity} chỗ
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                styles.statusButton,
              ]}
              onPress={() =>
                toggleStatus(item)
              }
            >
              <Text
                style={styles.statusButtonText}
              >
                {isAvailable
                  ? 'Bảo trì'
                  : 'Mở phòng'}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.editButton,
              ]}
              onPress={() =>
                openEditModal(item)
              }
            >
              <Text
                style={styles.editButtonText}
              >
                Sửa
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.deleteButton,
              ]}
              onPress={() =>
                handleDelete(item)
              }
            >
              <Text
                style={styles.deleteButtonText}
              >
                Xóa
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Đang tải danh sách phòng...
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

        <Text style={styles.headerTitle}>
          Quản lý phòng
        </Text>

        <View style={styles.headerSpace} />
      </View>

      {/* Add button */}

      <View style={styles.topSection}>
        <View>
          <Text style={styles.countText}>
            {rooms.length} phòng
          </Text>

          <Text style={styles.description}>
            Quản lý phòng học trong hệ thống
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>
            + Thêm
          </Text>
        </Pressable>
      </View>

      {/* Room list */}

      {rooms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            🏫
          </Text>

          <Text style={styles.emptyTitle}>
            Chưa có phòng
          </Text>

          <Text style={styles.emptyText}>
            Hãy thêm phòng đầu tiên.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoom}
          contentContainerStyle={
            styles.list
          }
          showsVerticalScrollIndicator={
            false
          }
        />
      )}

      {/* Add / Edit Modal */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRoom
                  ? 'Sửa phòng'
                  : 'Thêm phòng'}
              </Text>

              <Pressable
                onPress={closeModal}
                disabled={saving}
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={[1]}
              keyExtractor={() => 'form'}
              renderItem={() => (
                <View>
                  <Text style={styles.inputLabel}>
                    Tên phòng *
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={(value) =>
                      updateForm(
                        'name',
                        value
                      )
                    }
                    placeholder="Ví dụ: Phòng A101"
                  />

                  <Text style={styles.inputLabel}>
                    Vị trí *
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={form.location}
                    onChangeText={(value) =>
                      updateForm(
                        'location',
                        value
                      )
                    }
                    placeholder="Ví dụ: Tòa A - Tầng 1"
                  />

                  <Text style={styles.inputLabel}>
                    Loại phòng *
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={form.lab}
                    onChangeText={(value) =>
                      updateForm(
                        'lab',
                        value
                      )
                    }
                    placeholder="Ví dụ: Phòng máy"
                  />

                  <Text style={styles.inputLabel}>
                    Sức chứa *
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={form.capacity}
                    onChangeText={(value) =>
                      updateForm(
                        'capacity',
                        value
                      )
                    }
                    placeholder="Ví dụ: 40"
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>
                    Link hình ảnh
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={form.image}
                    onChangeText={(value) =>
                      updateForm(
                        'image',
                        value
                      )
                    }
                    placeholder="https://..."
                    autoCapitalize="none"
                  />

                  <Text style={styles.inputLabel}>
                    Mô tả
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.descriptionInput,
                    ]}
                    value={form.description}
                    onChangeText={(value) =>
                      updateForm(
                        'description',
                        value
                      )
                    }
                    placeholder="Mô tả phòng..."
                    multiline
                    textAlignVertical="top"
                  />

                  <Text style={styles.inputLabel}>
                    Trạng thái
                  </Text>

                  <View
                    style={styles.statusOptions}
                  >
                    <Pressable
                      style={[
                        styles.statusOption,
                        form.status ===
                          'available' &&
                          styles.selectedAvailable,
                      ]}
                      onPress={() =>
                        setForm(
                          (current) => ({
                            ...current,
                            status:
                              'available',
                          })
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          form.status ===
                            'available' &&
                            styles.selectedOptionText,
                        ]}
                      >
                        Đang hoạt động
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.statusOption,
                        form.status ===
                          'maintenance' &&
                          styles.selectedMaintenance,
                      ]}
                      onPress={() =>
                        setForm(
                          (current) => ({
                            ...current,
                            status:
                              'maintenance',
                          })
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          form.status ===
                            'maintenance' &&
                            styles.selectedOptionText,
                        ]}
                      >
                        Bảo trì
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={[
                      styles.saveButton,
                      saving &&
                        styles.disabledButton,
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <View
                        style={
                          styles.savingContainer
                        }
                      >
                        <ActivityIndicator
                          size="small"
                          color="#ffffff"
                        />

                        <Text
                          style={
                            styles.saveButtonText
                          }
                        >
                          Đang lưu...
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={
                          styles.saveButtonText
                        }
                      >
                        {editingRoom
                          ? 'Lưu thay đổi'
                          : 'Thêm phòng'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
              contentContainerStyle={
                styles.formContent
              }
              showsVerticalScrollIndicator={
                false
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748b',
  },

  header: {
    height: 95,
    paddingTop: 45,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },

  headerSpace: {
    width: 40,
  },

  topSection: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  countText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },

  description: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748b',
  },

  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },

  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  roomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  roomImage: {
    width: '100%',
    height: 150,
  },

  imagePlaceholder: {
    height: 150,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderIcon: {
    fontSize: 50,
  },

  roomContent: {
    padding: 16,
  },

  roomHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  roomTitleContainer: {
    flex: 1,
    marginRight: 10,
  },

  roomName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },

  roomLab: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748b',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  availableBadge: {
    backgroundColor: '#dcfce7',
  },

  maintenanceBadge: {
    backgroundColor: '#fee2e2',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  availableText: {
    color: '#15803d',
  },

  maintenanceText: {
    color: '#b91c1c',
  },

  roomInfo: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 7,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  statusButton: {
    backgroundColor: '#f1f5f9',
  },

  statusButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  editButton: {
    backgroundColor: '#dbeafe',
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },

  deleteButton: {
    backgroundColor: '#fee2e2',
  },

  deleteButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },

  emptyText: {
    marginTop: 6,
    color: '#64748b',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },

  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '92%',
  },

  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },

  closeText: {
    fontSize: 30,
    color: '#64748b',
    lineHeight: 30,
  },

  formContent: {
    padding: 20,
    paddingBottom: 40,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
    marginTop: 5,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },

  descriptionInput: {
    height: 90,
    paddingTop: 12,
  },

  statusOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  statusOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    alignItems: 'center',
  },

  selectedAvailable: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },

  selectedMaintenance: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },

  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },

  selectedOptionText: {
    color: '#0f172a',
    fontWeight: '800',
  },

  saveButton: {
    backgroundColor: '#2563eb',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});