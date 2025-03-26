import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { auth, db } from "../../config/firebase";
import { doc, updateDoc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
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
  const [selectedDates, setSelectedDates] = useState<Record<string, any>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchUserCycle = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          const { menstruationDays } = userDoc.data();
          if (menstruationDays && menstruationDays.length > 0) {
            const selected: Record<string, any> = {};
            menstruationDays.forEach((date: string) => {
              selected[formatToISO(date)] = { selected: true };
            });
            setSelectedDates(selected);
          }
        }
      }
    };
    fetchUserCycle();
  }, []);

  const handleDaySelect = (day: { dateString: string; month: number }) => {
    if (day.month !== currentMonth) return;

    const date = day.dateString;
    const newSelection = { ...selectedDates };

    if (newSelection[date]) {
      delete newSelection[date];
    } else {
      newSelection[date] = { selected: true };
    }

    setSelectedDates(newSelection);
  };

  const handleConfirm = async () => {
    const orderedDates = Object.keys(selectedDates).sort();
    if (orderedDates.length === 0) {
      alert("Selecione ao menos um dia para continuar.");
      return;
    }

    const formattedDates = orderedDates.map(formatToISO);
    const firstDate = formattedDates[0];

    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, "usuarios", user.uid, "ciclosMenstruais"), {
          menstruationStart: firstDate,
          menstruationDays: formattedDates,
          createdAt: Timestamp.now(),
        });

        await updateDoc(doc(db, "usuarios", user.uid), {
          menstruationStart: firstDate,
          menstruationDays: formattedDates,
          updatedAt: Timestamp.now(),
        });

        router.push({ pathname: "/calendar", params: { refetch: "true" } });
      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar os dados. Tente novamente.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.headerTitle}>Selecionar Menstruação</Text>

      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={handleDaySelect}
          onMonthChange={(month: { month: number }) => setCurrentMonth(month.month)}
          markedDates={selectedDates}
          markingType={"custom"}
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
            const dateString = date?.dateString;
            const isOutOfMonth = date?.month !== currentMonth;

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
                        selectedDates[dateString] ? styles.selectedIndicator : styles.defaultIndicator,
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
    backgroundColor: "#f5e9f0",
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