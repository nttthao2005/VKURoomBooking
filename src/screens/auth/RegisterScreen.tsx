import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: user.email,
        role: 'student',
        createdAt: new Date(),
      });

      Alert.alert('Thành công', 'Tạo tài khoản thành công');

     
    } catch (error: any) {
      let message = 'Không thể tạo tài khoản';

      if (error.code === 'auth/email-already-in-use') {
        message = 'Email này đã được sử dụng';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email không hợp lệ';
      } else if (error.code === 'auth/weak-password') {
        message = 'Mật khẩu quá yếu';
      }

      Alert.alert('Đăng ký thất bại', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VKU Room Booking</Text>
      <Text style={styles.subtitle}>Tạo tài khoản</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={name}
        onChangeText={setName}
      />

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
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#1d4ed8',
    marginTop: 20,
  },
});