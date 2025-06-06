import { View, Text, Image, TouchableOpacity, StyleSheet, BackHandler, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../config/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { registerForPushNotificationsAsync } from '../services/notifications';
import * as Notifications from 'expo-notifications';

export default function Index() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.replace('/home');
      }
    });

    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(() => {
      if (auth.currentUser) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    });

    return () => {
      unsubscribe();
      notificationSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      
      <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/register')}>
        <Text style={styles.registerText}>Registrar</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>Já tem uma conta?</Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5e9f0',
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  slogan: {
    fontSize: 16,
    fontWeight: '300',
    color: '#6a3b7d',
    textAlign: 'center',
    marginBottom: 40,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  registerButton: {
    backgroundColor: '#a87cb3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 10,
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#6a3b7d',
    fontSize: 14,
    marginBottom: 5,
  },
  loginButton: {
    borderColor: '#a87cb3',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
});
