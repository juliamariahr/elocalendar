import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import BackButton from "../../components/BackButton";
import { useMenstrualCycle } from "../../hooks/useMenstrualCycle";

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const ciclo = useMenstrualCycle();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const formatarDiaSemana = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const markedDates: Record<string, any> = {};

  if (ciclo) {
    const {
      ultimaMenstruacao,
      fimMenstruacao,
      proximaMenstruacao,
      ovulacao,
      inicioFertilidade,
      fimFertilidade,
      menstruationDuration
    } = ciclo;

    // Menstruação atual
    let dataAtual = new Date(ultimaMenstruacao);
    while (dataAtual <= new Date(fimMenstruacao)) {
      const dataStr = dataAtual.toISOString().split("T")[0];
      markedDates[dataStr] = {
        customStyles: {
          container: { backgroundColor: "#a87cb3", borderRadius: 5 },
          text: { color: "#fff", fontWeight: "bold" }
        },
        type: "menstruation",
      };
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // Período fértil
    let fertilStart = new Date(inicioFertilidade);
    while (fertilStart <= new Date(fimFertilidade)) {
      const dataStr = fertilStart.toISOString().split("T")[0];
      markedDates[dataStr] = {
        customStyles: {
          container: { backgroundColor: "#ffeb99", borderRadius: 5 },
          text: { color: "#333", fontWeight: "bold" }
        },
        type: "fertility",
      };
      fertilStart.setDate(fertilStart.getDate() + 1);
    }

    // Ovulação
    const ovulacaoStr = new Date(ovulacao).toISOString().split("T")[0];
    markedDates[ovulacaoStr] = {
      customStyles: {
        container: { backgroundColor: "#ffcc99", borderRadius: 5 },
        text: { color: "#333", fontWeight: "bold" }
      },
      type: "ovulation",
    };

    // Próxima menstruação
    let proxMenstruacao = new Date(proximaMenstruacao);
    for (let i = 0; i < menstruationDuration; i++) {
      const proxDateStr = proxMenstruacao.toISOString().split("T")[0];
      markedDates[proxDateStr] = {
        customStyles: {
          container: { backgroundColor: "#d6a3e6", borderRadius: 5 },
          text: { color: "#fff", fontWeight: "bold" }
        },
        type: "next-period",
      };
      proxMenstruacao.setDate(proxMenstruacao.getDate() + 1);
    }
  }

  if (markedDates[todayStr]) {
    markedDates[todayStr].customStyles.container = {
      ...markedDates[todayStr].customStyles.container,
      borderWidth: 2,
      borderColor: "#a87cb3",
    };
  } else {
    markedDates[todayStr] = {
      customStyles: {
        container: { borderWidth: 2, borderColor: "#a87cb3", borderRadius: 5 },
        text: { color: "#6a3b7d", fontWeight: "bold" },
      },
      type: "today",
    };
  }

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ flexGrow: 1 }}>
      <BackButton />
      <View style={styles.container}>
        {/* Calendário */}
        <View style={styles.calendarWrapper}>
          <Calendar
            current={todayStr}
            onDayPress={handleDayPress}
            markingType={"custom"}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#f5e9f0",
              calendarBackground: "#fff",
              textSectionTitleColor: "#6a3b7d",
              todayTextColor: "#6a3b7d",
              dayTextColor: "#333",
              arrowColor: "#a87cb3",
              monthTextColor: "#6a3b7d",
            }}
            firstDay={1}
            locale={"pt-BR"}
            dayComponent={({ date, state }: { date: { dateString: string; day: number }; state: string }) => {
              const dateString = date?.dateString;
              return (
                <TouchableOpacity onPress={() => handleDayPress({ dateString })}>
                  <View
                    style={[
                      styles.dayContainer,
                      markedDates[dateString]?.customStyles?.container,
                      state === "disabled" && styles.disabledDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        markedDates[dateString]?.customStyles?.text,
                        state === "disabled" && styles.disabledDayText,
                      ]}
                    >
                      {date?.day}
                    </Text>
                    {markedDates[dateString]?.type === "fertility" && (
                      <FontAwesome5 name="leaf" size={12} color="#333" style={styles.icon} />
                    )}
                    {markedDates[dateString]?.type === "ovulation" && (
                      <FontAwesome5 name="egg" size={12} color="#333" style={styles.icon} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Informações do dia selecionado */}
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>{formatarDiaSemana(selectedDate)}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.infoSubText}>
            {markedDates[selectedDate]?.type === "menstruation"
              ? "Menstruação"
              : markedDates[selectedDate]?.type === "ovulation"
              ? "Ovulação"
              : markedDates[selectedDate]?.type === "fertility"
              ? "Período Fértil"
              : markedDates[selectedDate]?.type === "next-period"
              ? "Próxima Menstruação"
              : "Fora do período fértil"}
          </Text>

          <Text style={styles.infoDescription}>
            {markedDates[selectedDate]?.type
              ? "Alta - Probabilidade de engravidar"
              : "Baixa - Fora do período fértil"}
          </Text>
          <Text style={styles.infoNotes}>(Anotações)</Text>
        </View>
        <BottomNav />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f5e9f0"
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#f5e9f0",
    paddingTop: 50
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 15,
    padding: 10
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  icon: {
    marginTop: 3
  },
  disabledDay: {
    opacity: 0.3
  },
  disabledDayText: {
    color: "#ccc"
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginHorizontal: 15,
    marginTop: 15
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6a3b7d"
  },
  editButton: {
    backgroundColor: "#a87cb3",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold"
  },
  infoSubText: {
    fontSize: 14,
    color: "#6a3b7d",
    marginTop: 5
  },
  infoDescription: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5
  },
  infoNotes: {
    fontSize: 12,
    color: "#666",
    marginTop: 5
  },
});
