import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminRoomsScreen from '../screens/admin/AdminRoomsScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';
import AdminRoomStatusScreen
  from '../screens/admin/AdminRoomStatusScreen';
export type AdminStackParamList = {
  Dashboard: undefined;
  Rooms: undefined;
  Bookings: undefined;
  RoomStatus: undefined;
};

const Stack =
  createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
      />

      <Stack.Screen
        name="Rooms"
        component={AdminRoomsScreen}
      />
      <Stack.Screen
  name="Bookings"
  component={AdminBookingsScreen}
/>
<Stack.Screen
  name="RoomStatus"
  component={AdminRoomStatusScreen}
/>
    </Stack.Navigator>
  );
}