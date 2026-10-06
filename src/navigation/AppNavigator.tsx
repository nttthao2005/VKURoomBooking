import React from 'react';

import {
  ActivityIndicator,
  View,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import AdminNavigator from './AdminNavigator';

import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import type { Booking } from '../types/booking';
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;

  Main: undefined;

  Admin: undefined;

  BookingDetail: {
  booking: Booking;
};
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const {
    user,
    profile,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        ) : profile?.role === 'admin' ? (
          <Stack.Screen
            name="Admin"
            component={AdminNavigator}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
            />

            <Stack.Screen
              name="BookingDetail"
              component={BookingDetailScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}