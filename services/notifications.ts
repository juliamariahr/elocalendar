import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let scheduledNotificationIds: string[] = [];

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permissão para notificações negada.');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);
  return token;
}

export async function scheduleNotification(title: string, body: string, secondsFromNow: number) {
  if (Platform.OS !== 'android') return;

  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      seconds: secondsFromNow,
      repeats: false,
      channelId: 'default',
    },
  });
  scheduledNotificationIds.push(id);
}

export async function scheduleDailyPillReminder(hour: number, minute: number) {
  if (Platform.OS !== 'android') return;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de tomar a pílula!',
      body: 'Não esqueça de tomar seu anticoncepcional.',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: 'default',
    },
  });

  scheduledNotificationIds.push(id);
}

export async function schedulePatchReminder(daysInterval: number) {
  if (Platform.OS !== 'android') return;

  const seconds = daysInterval * 86400;
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Trocar Adesivo',
      body: 'Está na hora de trocar seu adesivo anticoncepcional.',
      sound: true,
    },
    trigger: {
      seconds,
      repeats: true,
      channelId: 'default',
    },
  });
  scheduledNotificationIds.push(id);
}

export async function scheduleMenstruationWarning(menstruationDate: Date) {
  if (Platform.OS !== 'android') return;

  const oneDayBefore = new Date(menstruationDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  oneDayBefore.setHours(9, 0, 0, 0);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Atenção!',
      body: 'Sua menstruação está prevista para amanhã.',
      sound: true,
    },
    trigger: {
      seconds: Math.floor((oneDayBefore.getTime() - Date.now()) / 1000),
      repeats: false,
      channelId: 'default',
    },
  });
  scheduledNotificationIds.push(id);
}

export async function scheduleDelayedMenstruationWarning(menstruationDate: Date) {
  if (Platform.OS !== 'android') return;

  const twoDaysAfter = new Date(menstruationDate);
  twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);
  twoDaysAfter.setHours(9, 0, 0, 0);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Menstruação Atrasada?',
      body: 'Sua menstruação pode estar atrasada. Verifique seu ciclo.',
      sound: true,
    },
    trigger: {
      seconds: Math.floor((twoDaysAfter.getTime() - Date.now()) / 1000),
      repeats: false,
      channelId: 'default',
    },
  });
  scheduledNotificationIds.push(id);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  scheduledNotificationIds = [];
}

export async function rescheduleAll({
  menstruationDate,
  pillReminder,
  patchInterval,
  pillTime,
}: {
  menstruationDate: Date;
  pillReminder?: boolean;
  patchInterval?: number;
  pillTime?: { hour: number; minute: number };
}) {
  await cancelAllNotifications();

  await scheduleMenstruationWarning(menstruationDate);
  await scheduleDelayedMenstruationWarning(menstruationDate);

  if (pillReminder && pillTime) {
    await scheduleDailyPillReminder(pillTime.hour, pillTime.minute);
  }

  if (patchInterval) {
    await schedulePatchReminder(patchInterval);
  }
}