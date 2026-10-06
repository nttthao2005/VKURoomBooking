import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { signOut } from 'firebase/auth';

import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import type {
  MainTabParamList,
} from '../../navigation/MainTabNavigator';
type Props = BottomTabScreenProps<
  MainTabParamList,
  'Profile'
>;

export default function ProfileScreen(
  { navigation }: Props
) {
  const { profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Lỗi',
        'Không thể đăng xuất. Vui lòng thử lại.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin cá nhân</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Họ và tên</Text>
        <Text style={styles.value}>
          {profile?.name || 'Chưa cập nhật'}
        </Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>
          {profile?.email || 'Chưa cập nhật'}
        </Text>

        <Text style={styles.label}>Vai trò</Text>
        <Text style={styles.value}>
          {profile?.role === 'teacher'
            ? 'Giảng viên'
            : 'Sinh viên'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 24,
  },

  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 20,
  },

  label: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
  },

  value: {
    fontSize: 17,
    fontWeight: '500',
    marginTop: 4,
  },

  logoutButton: {
    marginTop: 30,
    backgroundColor: '#dc2626',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});