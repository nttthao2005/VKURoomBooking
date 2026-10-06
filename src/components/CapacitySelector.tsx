
import React, { useState } from 'react';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type CapacityFilter =
  | 'all'
  | 'small'
  | 'medium'
  | 'large';

type Props = {
  value: CapacityFilter;
  onChange: (value: CapacityFilter) => void;
};

const OPTIONS: {
  key: CapacityFilter;
  title: string;
}[] = [
  {
    key: 'all',
    title: 'Tất cả',
  },
  {
    key: 'small',
    title: 'Dưới 40 chỗ',
  },
  {
    key: 'medium',
    title: '40 - 60 chỗ',
  },
  {
    key: 'large',
    title: 'Trên 60 chỗ',
  },
];

export default function CapacitySelector({
  value,
  onChange,
}: Props) {
  const [visible, setVisible] =
    useState(false);

  const selectedTitle =
    OPTIONS.find(
      (item) => item.key === value
    )?.title ?? 'Tất cả';

  return (
    <>
      <Pressable
        style={styles.selector}
        onPress={() => setVisible(true)}
      >
        <View style={styles.left}>
          <Text style={styles.icon}>
            👥
          </Text>

          <View style={styles.content}>
            <Text style={styles.title}>
              Sức chứa
            </Text>

            <Text style={styles.value}>
              {selectedTitle}
            </Text>
          </View>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() =>
          setVisible(false)
        }
      >
        <Pressable
          style={styles.overlay}
          onPress={() =>
            setVisible(false)
          }
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Sức chứa
              </Text>

              <Pressable
                onPress={() =>
                  setVisible(false)
                }
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
  selector: {
    minHeight: 58,
    borderRadius: 13,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  icon: {
    fontSize: 20,
    marginRight: 11,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },

  arrow: {
    fontSize: 25,
    color: '#94a3b8',
    marginLeft: 8,
  },

  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(15, 23, 42, 0.45)',
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
