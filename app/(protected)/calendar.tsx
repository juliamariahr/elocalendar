import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import BackButton from "../../components/BackButton";
import { useMenstrualCycle } from "../../hooks/useMenstrualCycle";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { scheduleCycleHealthWarnings } from "../../services/notifications";

const getLocalDateString = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

const sintomasMap: Record<string, string> = {
  dor_cabeca: "Dor de cabeça",
  enxaqueca: "Enxaqueca",
  tontura: "Tontura",
  acne: "Acne",
  dor_pescoco: "Dor no pescoço",
  dor_ombro: "Dor no ombro",
  mama_dor: "Mama com dor",
  mama_dolorida: "Mama dolorida",
  costas: "Dores nas costas",
  lombar: "Dores na lombar",
  corpo: "Dores no corpo",
  muscular: "Dor muscular",
  gripe: "Gripe",
  colica: "Cólica",
  calafrios: "Calafrios",
  coceira: "Coceira",
  calor: "Calor",
  tpm: "TPM",
  peso: "Ganho de peso",
  inchaco: "Inchaço",
  prisao: "Prisão de ventre",
  diarreia: "Diarreia",
  enjoo: "Enjoo",
  gasoso: "Gases",
  fome: "Fome",
  desejo: "Desejo",
  pelvica: "Dor pélvica",
  cervical: "Firmeza cervical",
  abertura: "Abertura cervical",
  corrimento: "Corrimento",
  fluxo: "Fluxo alto",
  manchas: "Manchas",
  irritacao: "Irritação",
  seco: "Seco",
  pegajoso: "Pegajoso",
  cremoso: "Cremoso",
  aguado: "Aguado",
  clara: "Clara de ovo",
  requeijao: "Requeijão",
  verde: "Verde",
  sangue: "Com sangue",
  cheiro: "Com cheiro",
  ansiedade: "Ansiedade",
  insonia: "Insônia",
  estresse: "Estresse",
  mau_humor: "Mau humor",
  tensao: "Tensão",
  irritabilidade: "Irritabilidade",
  concentracao: "Sem concentração",
  fadiga: "Fadiga",
  confusao: "Confusão"
};

const humoresMap: Record<string, string> = {
  feliz: "Felicidade",
  alegre: "Alegria",
  animado: "Animação",
  empolgado: "Empolgação",
  euforico: "Euforia",
  confiante: "Confiança",
  grato: "Gratidão",
  satisfeito: "Satisfação",
  tranquilo: "Tranquilidade",
  calmo: "Calma",
  amoroso: "Amor",
  esperancoso: "Esperança",
  sensivel: "Sensibilidade",
  reflexivo: "Reflexão",
  pensativo: "Pensamento",
  curioso: "Curiosidade",
  distraido: "Distração",
  irritado: "Irritação",
  ansioso: "Ansiedade",
  triste: "Tristeza",
  choroso: "Choro",
  estressado: "Estresse",
  desanimado: "Desânimo",
  cansado: "Cansaço",
  agressivo: "Agressividade",
  tenso: "Tensão",
  inseguro: "Insegurança",
  solitario: "Solidão",
  frustrado: "Frustração"
};

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const ciclo = useMenstrualCycle();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
  const [logDetails, setLogDetails] = useState<(string | JSX.Element)[] | null>(null);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (ciclo) {
      const todosOsDias = new Set<string>();
  
      ciclo.menstruationDaysPassados?.forEach((d) => todosOsDias.add(d));
  
      ciclo.futurasMenstruacoes?.forEach(({ inicio, fim }) => {
        const start = new Date(inicio);
        const end = new Date(fim);
        while (start <= end) {
          todosOsDias.add(start.toISOString().split("T")[0]);
          start.setDate(start.getDate() + 1);
        }
      });
  
      scheduleCycleHealthWarnings(Array.from(todosOsDias));
    }
  }, [ciclo]);  

  useFocusEffect(
    useCallback(() => {
      const fetchLog = async () => {
        const user = auth.currentUser;
        if (!user || !selectedDate) return;
        const ref = doc(db, "usuarios", user.uid, "cycle_logs", selectedDate);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const detalhes: (string | JSX.Element)[] = [];

          if (typeof data.fluxo === "number") {
            const intensidade =
              data.fluxo <= 2 ? "Leve" : data.fluxo === 3 ? "Moderado" : "Intenso";
            const icones = [];
            for (let i = 0; i < data.fluxo; i++) {
              icones.push(
                <FontAwesome5
                  key={i}
                  name="tint"
                  size={14}
                  color="#B82132"
                  style={{ marginRight: 2 }}
                />
              );
            }
            detalhes.push(
              <Text key="fluxo" style={{ flexDirection: "row", marginTop: 8 }}>
                <Text style={{ fontWeight: "bold" }}>Fluxo Menstrual:{"\n"}</Text>
                {icones}
                <Text> {intensidade}</Text>
              </Text>
            );
          }

          if (data.nota) detalhes.push(`📝 Notas:\n${data.nota}`);

          if (data.sintomas?.length) {
            const nomes = data.sintomas.map((id: string) => sintomasMap[id] || id);
            detalhes.push(`🤒 Sintomas:\n${nomes.join(", ")}`);
          }

          if (data.humores?.length) {
            const nomes = data.humores.map((id: string) => humoresMap[id] || id);
            detalhes.push(`😊 Humores:\n${nomes.join(", ")}`);
          }

          if (data.atividadeSexual?.pratica) {
            const sexo = data.atividadeSexual;
            const sexoInfo = [
              "✔️ Praticou",
              sexo.preservativo ? "🛡️ Protegido" : "⚠️ Sem proteção",
              sexo.orgasmo ? "🥳 Teve orgasmo" : "😕 Sem orgasmo",
              `❤️ ${sexo.vezes} vez(es)`
            ];
            detalhes.push(`💌 Atividade Sexual:\n${sexoInfo.join("\n")}`);
          }

          setLogDetails(detalhes);
        } else {
          setLogDetails(null);
        }
      };

      fetchLog();
    }, [selectedDate])
  );

  const formatarDiaSemana = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  };

  const todayStr = getLocalDateString(new Date());
  const markedDates: Record<string, any> = {};

  if (ciclo) {
    const {
      menstruationDaysPassados,
      futurasMenstruacoes,
      inicioFertilidade,
      fimFertilidade,
      ovulacao
    } = ciclo;

    menstruationDaysPassados?.forEach((dateStr) => {
      markedDates[dateStr] = {
        customStyles: {
          container: { backgroundColor: "#a87cb3", borderRadius: 5 },
          text: { color: "#fff", fontWeight: "bold" }
        },
        type: "menstruation",
      };
    });

    futurasMenstruacoes?.forEach(({ inicio, fim }) => {
      let data = new Date(inicio);
      const end = new Date(fim);
      while (data <= end) {
        const dateStr = getLocalDateString(data);
        if (!markedDates[dateStr]) {
          markedDates[dateStr] = {
            customStyles: {
              container: { backgroundColor: "#d6a3e6", borderRadius: 5 },
              text: { color: "#fff", fontWeight: "bold" }
            },
            type: "menstruation",
          };
        }
        data.setDate(data.getDate() + 1);
      }
    });

    let fertilStart = new Date(inicioFertilidade);
    while (fertilStart <= new Date(fimFertilidade)) {
      const dataStr = getLocalDateString(fertilStart);
      markedDates[dataStr] = {
        customStyles: {
          container: { backgroundColor: "#ffeb99", borderRadius: 5 },
          text: { color: "#333", fontWeight: "bold" }
        },
        type: "fertility",
      };
      fertilStart.setDate(fertilStart.getDate() + 1);
    }

    const ovulacaoStr = getLocalDateString(new Date(ovulacao));
    markedDates[ovulacaoStr] = {
      customStyles: {
        container: { backgroundColor: "#ffcc99", borderRadius: 5 },
        text: { color: "#333", fontWeight: "bold" }
      },
      type: "ovulation",
    };
  }  

  if (markedDates[todayStr]) {
    markedDates[todayStr].customStyles.container = {
      ...markedDates[todayStr].customStyles.container,
      borderWidth: 2,
      borderColor: "#6F519C",
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
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    const LONG_PRESS_DELAY = 500;
  
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }
  
    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY && selectedDate === day.dateString) {
      router.push({ pathname: "/(protected)/EditCycle", params: { date: day.dateString } });
      setLastTap(null);
      return;
    }
  
    setSelectedDate(day.dateString);
    setLastTap(now);
  
    tapTimeout.current = setTimeout(() => {
      if (selectedDate === day.dateString) {
        router.push({ pathname: "/(protected)/EditCycle", params: { date: day.dateString } });
        setLastTap(null);
      }
    }, LONG_PRESS_DELAY);
  };

  return (
    <View style={styles.container}>
      <BackButton route="/home" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                      <FontAwesome5 name="leaf" size={10} color="#333" style={styles.icon} />
                    )}
                    {markedDates[dateString]?.type === "ovulation" && (
                      <FontAwesome5 name="egg" size={10} color="#333" style={styles.icon} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>{formatarDiaSemana(selectedDate)}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push({ pathname: "/(protected)/EditCycle", params: { date: selectedDate } })}
            >
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

          {logDetails ? (
            Array.isArray(logDetails) ? (
              logDetails.map((det, idx) => (
                <Text key={idx} style={styles.infoNotes}>
                  {det}
                </Text>
              ))
            ) : (
              <Text style={styles.infoNotes}>{logDetails}</Text>
            )
          ) : (
            <Text style={styles.infoNotes}>Nenhuma anotação para esse dia.</Text>
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E4F6",
    paddingTop: 50,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 15,
    padding: 10,
    elevation: 3,
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    marginTop: 3,
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: "#ccc",
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginHorizontal: 15,
    marginTop: 15,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6a3b7d",
  },
  editButton: {
    backgroundColor: "#a87cb3",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoSubText: {
    fontSize: 14,
    color: "#6a3b7d",
    marginTop: 5,
  },
  infoDescription: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  infoNotes: {
    fontSize: 13,
    color: "#555",
    marginTop: 10,
    lineHeight: 18,
  },
});
