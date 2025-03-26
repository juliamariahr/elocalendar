import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNav() {
  const router = useRouter();

  const openCalendar = () => {
    router.push('/calendar');
  };

  const openMenstruationSelection = () => {
    router.push('/(setup)/SelectMenstruation');
  };

  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={() => router.push('/home')}>
        <Ionicons name="home" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={openCalendar}>
        <Ionicons name="calendar-outline" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.plusButton} onPress={openMenstruationSelection}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="bar-chart-outline" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/settings')}>
        <Ionicons name="settings-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: '#7e57c2',
    paddingVertical: 15,
    borderRadius: 25,
  },
  plusButton: {
    backgroundColor: '#ff69b4',
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
});
