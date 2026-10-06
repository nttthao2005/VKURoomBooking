
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type StatusFilter =
  | 'all'
  | 'available'
  | 'maintenance';

type Props = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

const OPTIONS: {
  key: StatusFilter;
  title: string;
}[] = [
  {
    key: 'all',
    title: 'Tất cả',
  },
  {
    key: 'available',
    title: 'Đang trống',
  },
  {
    key: 'maintenance',
    title: 'Bảo trì',
  },
];

export default function StatusSelector({
  value,
  onChange,
}: Props) {
  const [visible, setVisible] = useState(false);

  const selectedTitle =
    OPTIONS.find((item) => item.key === value)
      ?.title ?? 'Tất cả';

  return (
    <>
      <Pressable
        style={styles.selector}
        onPress={() => setVisible(true)}
      >
        <View style={styles.selectorLeft}>
          <Text style={styles.selectorIcon}>
            🟢
          </Text>

          <View>
            <Text style={styles.selectorTitle}>
              Trạng thái
            </Text>

            <Text style={styles.selectorValue}>
              {selectedTitle}
            </Text>
          </View>
        </View>

        <Text style={styles.selectorArrow}>
          ›
        </Text>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Trạng thái
              </Text>

              <Pressable
                onPress={() => setVisible(false)}
              >
                <Text style={styles.closeButton}>
                  ✕
                </Text>
              </Pressable>
            </View>

            {OPTIONS.map((item) => {
              const selected =
                value === item.key;

              return (
                <Pressable
                  key={item.key}
                  style={[
                    styles.option,
                    selected &&
                      styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(item.key);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {item.title}
                  </Text>

                  {selected && (
                    <Text style={styles.check}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  /*
   * Đây là row bên trong card "Bộ lọc".
   * Không còn background trắng + border riêng
   * như phiên bản cũ.
   */
  selector: {
    minHeight: 58,
    borderRadius: 13,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectorIcon: {
    fontSize: 22,
    marginRight: 13,
  },

  selectorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 3,
  },

  selectorValue: {
    fontSize: 13,
    color: '#64748b',
  },

  selectorArrow: {
    fontSize: 28,
    color: '#94a3b8',
    fontWeight: '300',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
  },

  closeButton: {
    fontSize: 20,
    color: '#64748b',
    padding: 5,
  },

  option: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  optionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },

  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },

  optionTextSelected: {
    color: '#2563eb',
    fontWeight: '800',
  },

  check: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563eb',
  },
});
