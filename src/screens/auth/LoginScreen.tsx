
import React, { useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../../services/firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // =========================
  // ĐĂNG NHẬP
  // =========================
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập email và mật khẩu'
      );
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
    } catch (error: any) {
      let message = 'Đăng nhập thất bại';

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        message = 'Email hoặc mật khẩu không đúng';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email không hợp lệ';
      }

      Alert.alert(
        'Đăng nhập thất bại',
        message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // QUÊN MẬT KHẨU
  // =========================
  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert(
        'Quên mật khẩu',
        'Vui lòng nhập email của bạn trước.'
      );
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        trimmedEmail
      );

      Alert.alert(
        'Đã gửi email',
        'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.'
      );
    } catch (error: any) {
      let message =
        'Không thể gửi email đặt lại mật khẩu.';

      if (error.code === 'auth/invalid-email') {
        message = 'Email không hợp lệ.';
      } else if (
        error.code === 'auth/user-not-found'
      ) {
        message = 'Email này chưa được đăng ký.';
      }

      Alert.alert(
        'Quên mật khẩu',
        message
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        VKU Room Booking
      </Text>

      <Text style={styles.subtitle}>
        Đăng nhập
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? 'Đang đăng nhập...'
            : 'Đăng nhập'}
        </Text>
      </TouchableOpacity>

      {/* QUÊN MẬT KHẨU */}
      <TouchableOpacity
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text style={styles.forgotPassword}>
          Quên mật khẩu?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Register')
        }
      >
        <Text style={styles.link}>
          Chưa có tài khoản? Đăng ký
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#1d4ed8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  forgotPassword: {
    textAlign: 'center',
    color: '#1d4ed8',
    marginTop: 16,
    fontSize: 15,
  },

  link: {
    textAlign: 'center',
    color: '#1d4ed8',
    marginTop: 20,
  },
});
