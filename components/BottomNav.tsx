import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function BottomNav() {
  const router = useRouter();
  const { theme } = useTheme();

  const openCalendar = () => {
    router.push('/calendar');
  };

  const openMenstruationSelection = () => {
    router.push('/(setup)/SelectMenstruation');
  };

  return (
    <View style={[styles.navBar, { backgroundColor: theme.bottomNav.background }]}>
      <TouchableOpacity onPress={() => router.push('/home')}>
        <Ionicons name="home" size={28} color={theme.bottomNav.iconColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={openCalendar}>
        <Ionicons name="calendar-outline" size={28} color={theme.bottomNav.iconColor} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.plusButton, { backgroundColor: theme.bottomNav.plusButtonBackground }]}
        onPress={openMenstruationSelection}
      >
        <Ionicons name="add" size={36} color={theme.bottomNav.plusButtonIconColor} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="bar-chart-outline" size={28} color={theme.bottomNav.iconColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Ionicons name="person-outline" size={28} color={theme.bottomNav.iconColor} />
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
    paddingVertical: 15,
    borderRadius: 25,
  },
  plusButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    elevation: 3,
  },
});
