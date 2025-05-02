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
  if (Platform.OS !== "android") return;

  const now = new Date();
  const firstTrigger = new Date();
  firstTrigger.setHours(hour, minute, 0, 0);

  if (firstTrigger <= now) {
    firstTrigger.setDate(firstTrigger.getDate() + 1);
  }

  const secondsUntil = Math.floor((firstTrigger.getTime() - now.getTime()) / 1000);

  const oneTimeId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hora de tomar a pílula!",
      body: "Não esqueça de tomar seu anticoncepcional.",
      sound: true,
    },
    trigger: {
      seconds: secondsUntil,
      repeats: false,
      channelId: "default",
    },
  });
  scheduledNotificationIds.push(oneTimeId);

  const recurringId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hora de tomar a pílula!",
      body: "Não esqueça de tomar seu anticoncepcional.",
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: "default",
    },
  });
  scheduledNotificationIds.push(recurringId);
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

export async function scheduleCycleHealthWarnings(menstruationDates: string[]) {
  if (Platform.OS !== 'android') return;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const countThisMonth = menstruationDates.filter(dateStr => {
    const date = new Date(dateStr);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const lastDay = new Date(currentYear, currentMonth + 1, 0, 20, 0, 0);
  const secondsUntil = Math.floor((lastDay.getTime() - Date.now()) / 1000);
  if (secondsUntil <= 0) return;

  let title = '';
  let body = '';

  if (countThisMonth === 0) {
    title = 'Menstruação não registrada';
    body = 'Você não menstruou este mês. Considere procurar orientação médica.';
  } else if (countThisMonth > 12) {
    title = 'Menstruação prolongada';
    body = `Você registrou ${countThisMonth} dias de menstruação este mês. Isso pode não ser normal. Procure um médico.`;
  } else {
    return;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      seconds: secondsUntil,
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

export async function schedulePatchReminder(patchInterval: number) {
  if (Platform.OS !== 'android') return;

  const now = new Date();
  const nextPatchDate = new Date(now.getTime() + patchInterval * 24 * 60 * 60 * 1000);
  nextPatchDate.setHours(9, 0, 0, 0);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Trocar o adesivo!',
      body: 'Está na hora de trocar o adesivo contraceptivo.',
      sound: true,
    },
    trigger: {
      seconds: Math.floor((nextPatchDate.getTime() - now.getTime()) / 1000),
      repeats: false,
      channelId: 'default',
    },
  });

  scheduledNotificationIds.push(id);
}
