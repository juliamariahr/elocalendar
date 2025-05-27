import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { auth, db } from "../../config/firebase";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import BackButton from "../../components/BackButton";
import { useTheme } from "../../context/ThemeContext";

function formatToISO(dateStr: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [dia, mes, ano] = dateStr.split("/");
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }
  return dateStr;
}

export default function SelectMenstruation() {
  const router = useRouter();
  const [selectedDates, setSelectedDates] = useState<Record<string, boolean>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const { theme } = useTheme();

  useEffect(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
  }, []);

  useEffect(() => {
    const fetchExistingDates = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      const data = snap.data();

      if (data?.menstruationDays?.length) {
        const restored: Record<string, boolean> = {};
        data.menstruationDays.forEach((date: string) => {
          restored[date] = true;
        });
        setSelectedDates(restored);
      }
    };

    fetchExistingDates();
  }, []);

  const handleDaySelect = (day: { dateString: string }) => {
    const date = day.dateString;
    setSelectedDates((prev) => {
      const updated = { ...prev };
      if (updated[date]) {
        delete updated[date];
      } else {
        updated[date] = true;
      }
      return updated;
    });
  };

  const handleConfirm = async () => {
    const orderedDates = Object.keys(selectedDates).sort();
    const firstDate = orderedDates[0] || null;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "usuarios", user.uid), {
        menstruationStart: firstDate,
        menstruationDays: orderedDates,
        updatedAt: Timestamp.now(),
      });

      router.push({ pathname: "/calendar", params: { refetch: "true" } });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar os dados. Tente novamente.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton route="/home" />
      <Text style={[styles.headerTitle, { color: theme.primary }]}>
        Selecionar Menstruação
      </Text>

      <View style={[styles.calendarWrapper, { backgroundColor: theme.secondary }]}>
        <Calendar
          onDayPress={handleDaySelect}
          onMonthChange={({ month }: { month: number }) => setCurrentMonth(month)}
          markingType={"custom"}
          markedDates={Object.fromEntries(
            Object.entries(selectedDates).map(([date]) => [
              date,
              {
                customStyles: {
                  container: { backgroundColor: theme.calendar.selectedDayBackground, borderRadius: 5 },
                  text: { color: theme.calendar.selectedDayTextColor, fontWeight: "bold" },
                },
              },
            ])
          )}
          theme={{
            backgroundColor: theme.calendar.background,
            calendarBackground: theme.secondary,
            todayTextColor: theme.calendar.todayColor,
            dayTextColor: theme.calendar.textColor,
            arrowColor: theme.calendar.arrowColor,
            monthTextColor: theme.calendar.monthTextColor,
          }}
          style={styles.calendar}
          dayComponent={({ date }: { date: { dateString: string; day: number; month: number } }) => {
            const isOutOfMonth = date?.month !== currentMonth;
            const isSelected = selectedDates[date.dateString];

            return (
              <TouchableOpacity onPress={() => handleDaySelect(date)} disabled={isOutOfMonth}>
                <View style={styles.dayContainer}>
                  <Text
                    style={[
                      styles.dayText,
                      { color: theme.text },
                      isOutOfMonth && styles.outOfMonthText,
                    ]}
                  >
                    {date?.day}
                  </Text>
                  {!isOutOfMonth && (
                    <View
                      style={[
                        styles.selectionIndicator,
                        isSelected
                          ? { backgroundColor: theme.calendar.selectedDayBackground }
                          : { borderColor: theme.calendar.selectedDayBackground, borderWidth: 2, backgroundColor: "transparent" },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.button }]} onPress={handleConfirm}>
        <Text style={[styles.saveText, { color: theme.buttonText }]}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  calendarWrapper: {
    borderRadius: 10,
    padding: 15,
    width: "90%",
    elevation: 5,
  },
  calendar: {
    width: "100%",
    borderRadius: 10,
  },
  dayContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  selectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  dayText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  outOfMonthText: {
    color: "#ccc",
  },
  saveButton: {
    marginTop: 25,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  saveText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});