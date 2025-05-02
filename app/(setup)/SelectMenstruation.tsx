import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { auth, db } from "../../config/firebase";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import BackButton from "../../components/BackButton";

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
    <View style={styles.container}>
      <BackButton route="/home" />
      <Text style={styles.headerTitle}>Selecionar Menstruação</Text>

      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={handleDaySelect}
          onMonthChange={({ month }: { month: number }) => setCurrentMonth(month)}
          markingType={"custom"}
          markedDates={Object.fromEntries(
            Object.entries(selectedDates).map(([date]) => [
              date,
              {
                customStyles: {
                  container: { backgroundColor: "#a87cb3", borderRadius: 5 },
                  text: { color: "#fff", fontWeight: "bold" },
                },
              },
            ])
          )}
          theme={{
            backgroundColor: "#f5e9f0",
            calendarBackground: "#fff",
            todayTextColor: "#a87cb3",
            dayTextColor: "#333",
            arrowColor: "#a87cb3",
            monthTextColor: "#6a3b7d",
          }}
          style={styles.calendar}
          dayComponent={({ date }: { date: { dateString: string; day: number; month: number } }) => {
            const isOutOfMonth = date?.month !== currentMonth;
            const isSelected = selectedDates[date.dateString];

            return (
              <TouchableOpacity onPress={() => handleDaySelect(date)} disabled={isOutOfMonth}>
                <View style={styles.dayContainer}>
                  <Text style={[styles.dayText, isOutOfMonth && styles.outOfMonthText]}>
                    {date?.day}
                  </Text>
                  {!isOutOfMonth && (
                    <View
                      style={[
                        styles.selectionIndicator,
                        isSelected ? styles.selectedIndicator : styles.defaultIndicator,
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleConfirm}>
        <Text style={styles.saveText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E4F6",
    alignItems: "center",
    paddingVertical: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6a3b7d",
    marginBottom: 20,
  },
  calendarWrapper: {
    backgroundColor: "#fff",
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
  defaultIndicator: {
    borderWidth: 2,
    borderColor: "#a87cb3",
    backgroundColor: "transparent",
  },
  selectedIndicator: {
    backgroundColor: "#a87cb3",
  },
  dayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  outOfMonthText: {
    color: "#ccc",
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: "#a87cb3",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});