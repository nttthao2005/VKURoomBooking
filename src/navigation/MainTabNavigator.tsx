import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import type { Room } from '../types/room';
export type MainStackParamList = {
  Home: undefined;
  Booking: {
  room: Room;
  selectedDate: string;
  startTime: string;
  endTime: string;
};
};

const Stack =
  createNativeStackNavigator<MainStackParamList>();

export type MainTabParamList = {
  HomeStack: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

const Tab =
  createBottomTabNavigator<MainTabParamList>();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          title: 'Đặt phòng',
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#777',

        tabBarIcon: ({ color, size }) => {
          let iconName:
            keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeStack') {
            iconName = 'home-outline';
          } else if (route.name === 'MyBookings') {
            iconName = 'calendar-outline';
          } else {
            iconName = 'person-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: 'Trang chủ',
        }}
      />

      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: 'Lịch đặt',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân',
        }}
      />
    </Tab.Navigator>
  );
}