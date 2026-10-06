import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardScreen({
  navigation,
}: any) {
  const { profile, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Xin chào 👋
            </Text>

            <Text style={styles.name}>
              {profile?.name || 'Admin'}
            </Text>

            <Text style={styles.subtitle}>
              Quản lý hệ thống VKU Room Booking
            </Text>
          </View>

          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>
              ADMIN
            </Text>
          </View>
        </View>

        {/* Thống kê */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              🏫
            </Text>

            <Text style={styles.statNumber}>
              --
            </Text>

            <Text style={styles.statLabel}>
              Phòng học
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              📅
            </Text>

            <Text style={styles.statNumber}>
              --
            </Text>

            <Text style={styles.statLabel}>
              Lịch đặt
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              👥
            </Text>

            <Text style={styles.statNumber}>
              --
            </Text>

            <Text style={styles.statLabel}>
              Người dùng
            </Text>
          </View>
        </View>

        {/* Quản lý */}
        <Text style={styles.sectionTitle}>
          Quản lý hệ thống
        </Text>

        {/* Quản lý phòng */}
        <Pressable
          style={styles.menuCard}
          onPress={() =>
            navigation.navigate('Rooms')
          }
        >
          <View
            style={[
              styles.menuIcon,
              styles.blueIcon,
            ]}
          >
            <Text style={styles.menuIconText}>
              🏫
            </Text>
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Quản lý phòng
            </Text>

            <Text style={styles.menuDescription}>
              Thêm, sửa, xóa và quản lý trạng thái
              phòng học
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>
<Pressable
  style={styles.menuCard}
  onPress={() =>
    navigation.navigate('RoomStatus')
  }
>
  <Text style={styles.menuIcon}>
    🏫
  </Text>

  <View style={styles.menuContent}>
    <Text style={styles.menuTitle}>
      Tình trạng phòng
    </Text>

    <Text style={styles.menuDescription}>
      Xem phòng trống theo ngày và giờ
    </Text>
  </View>

  <Text style={styles.arrow}>
    ›
  </Text>
</Pressable>
        {/* Quản lý lịch đặt */}
        <Pressable
          style={styles.menuCard}
          onPress={() => navigation.navigate('Bookings')}
        >
          <View
            style={[
              styles.menuIcon,
              styles.greenIcon,
            ]}
          >
            <Text style={styles.menuIconText}>
              📅
            </Text>
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Quản lý lịch đặt
            </Text>

            <Text style={styles.menuDescription}>
              Xem và quản lý tất cả lịch đặt phòng
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>

        {/* Quản lý người dùng */}
        <Pressable
          style={styles.menuCard}
          onPress={() => {
            // Làm ở bước tiếp theo
          }}
        >
          <View
            style={[
              styles.menuIcon,
              styles.orangeIcon,
            ]}
          >
            <Text style={styles.menuIconText}>
              👥
            </Text>
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Quản lý người dùng
            </Text>

            <Text style={styles.menuDescription}>
              Xem danh sách người dùng trong hệ thống
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>
        <Pressable
  style={styles.logoutButton}
  onPress={() => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error(
                'Lỗi đăng xuất:',
                error
              );
            }
          },
        },
      ]
    );
  }}
>
  <Text style={styles.logoutText}>
    Đăng xuất
  </Text>
</Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },

  greeting: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },

  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },

  adminBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  adminBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563eb',
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statIcon: {
    fontSize: 24,
    marginBottom: 7,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },

  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14,
  },

  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  blueIcon: {
    backgroundColor: '#dbeafe',
  },

  greenIcon: {
    backgroundColor: '#dcfce7',
  },

  orangeIcon: {
    backgroundColor: '#ffedd5',
  },

  menuIconText: {
    fontSize: 25,
  },

  menuContent: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },

  menuDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
  },

  arrow: {
    fontSize: 30,
    color: '#94a3b8',
    marginLeft: 8,
  },
  logoutButton: {
  marginTop: 20,
  marginHorizontal: 20,
  height: 48,
  borderRadius: 12,
  backgroundColor: '#FEE2E2',
  alignItems: 'center',
  justifyContent: 'center',
},

logoutText: {
  fontSize: 15,
  fontWeight: '700',
  color: '#DC2626',
},
});