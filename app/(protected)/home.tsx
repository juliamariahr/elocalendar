import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import BottomNav from "../../components/BottomNav";
import { useMenstrualCycle } from "../../hooks/useMenstrualCycle";
import { useTheme } from "../../context/ThemeContext";

const formatarData = (dataString?: string) => {
  if (!dataString) return "Carregando...";
  const data = new Date(`${dataString}T12:00:00`);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export default function Home() {
  const router = useRouter();
  const ciclo = useMenstrualCycle();
  const { theme } = useTheme();

  const [fasesCiclo] = useState([
    { id: "1", fase: "Período Fértil", icone: "leaf", cor: "#ffeb99" },
    { id: "2", fase: "Ovulação", icone: "egg", cor: "#ffd699" },
    { id: "3", fase: "Próxima Menstruação", icone: "tint", cor: "#ffcccc" },
  ]);

  const abrirCalendario = () => router.push("/calendar");
  const selecionarMenstruacao = () => router.push("/(setup)/SelectMenstruation");

  if (!ciclo) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Carregando informações do ciclo...</Text>
      </View>
    );
  }

  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  const hojeStr = hoje.toISOString().split("T")[0];

  const menstruandoHoje =
    ciclo.menstruationDaysPassados.includes(hojeStr) ||
    ciclo.futurasMenstruacoes.some(({ inicio, fim }) => {
      const inicioDate = new Date(`${inicio}T12:00:00`);
      const fimDate = new Date(`${fim}T12:00:00`);
      return hoje >= inicioDate && hoje <= fimDate;
    });

  const inicioCicloAtual = menstruandoHoje
    ? ciclo.futurasMenstruacoes.find(({ inicio, fim }) => {
        const inicioDate = new Date(`${inicio}T12:00:00`);
        const fimDate = new Date(`${fim}T12:00:00`);
        return hoje >= inicioDate && hoje <= fimDate;
      })?.inicio || ciclo.ultimaMenstruacao
    : ciclo.ultimaMenstruacao;

  const inicioCicloDate = new Date(`${inicioCicloAtual}T12:00:00`);
  const diff = hoje.getTime() - inicioCicloDate.getTime();
  const diaDoCiclo = diff >= 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) + 1 : null;

  const diasParaMenstruar = !menstruandoHoje && ciclo.proximaMenstruacao
    ? Math.round((new Date(ciclo.proximaMenstruacao).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let faseAtual = "Fora do período fértil";
  let probabilidadeGravidez = "Baixa";

  if (menstruandoHoje) {
    faseAtual = "Menstruação";
    probabilidadeGravidez = "Muito baixa";
  } else if (hoje.toDateString() === new Date(ciclo.ovulacao).toDateString()) {
    faseAtual = "Ovulação";
    probabilidadeGravidez = "Muito alta";
  } else if (hoje >= new Date(ciclo.inicioFertilidade) && hoje <= new Date(ciclo.fimFertilidade)) {
    faseAtual = "Período Fértil";
    probabilidadeGravidez = "Alta";
  }

  const screenWidth = Dimensions.get("window").width;
  const chartConfig = {
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    color: (opacity = 1) => theme.primary,
    labelColor: () => theme.text,
    propsForDots: { r: "4", strokeWidth: "2", stroke: theme.primary },
  };

  const data = {
    labels: ["Dia 1", "Dia 5", "Dia 10", "Dia 15", "Dia 20", "Dia 25"],
    datasets: [{ data: [0, 1, 0.5, 1.5, 0.3, 0], color: () => theme.primary }],
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={[styles.headerTitle, { color: theme.buttonText}]}>Seu Ciclo</Text>
          <TouchableOpacity style={[styles.calendarButton, { backgroundColor: theme.button }]} onPress={abrirCalendario} >
            <MaterialCommunityIcons name="calendar-multiselect" size={24} color={theme.secondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cycleInfoContainer} onPress={abrirCalendario}>
          <Text style={[styles.countdown, { color: theme.primary }]}>
            {menstruandoHoje
              ? "Você está menstruando"
              : diasParaMenstruar !== null
                ? (() => {
                    const plural = Math.abs(diasParaMenstruar) === 1 ? "dia" : "dias";
                    return diasParaMenstruar >= 0
                      ? `Faltam ${diasParaMenstruar} ${plural}`
                      : `${Math.abs(diasParaMenstruar)} ${plural} em atraso`;
                  })()
                : "Carregando..."}
          </Text>
          <Text style={styles.subtext}>{formatarData(ciclo.proximaMenstruacao)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={selecionarMenstruacao}>
          <Text style={styles.buttonText}>Registrar Menstruação</Text>
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <FontAwesome5 name="tint" size={18} color="#d32f2f" style={styles.dropIcon} />
            <Text style={styles.statusText}>
              {diaDoCiclo !== null
                ? `Hoje - Dia ${diaDoCiclo} do ciclo`
                : "Fora do ciclo menstrual"}
            </Text>
          </View>
          <Text style={styles.statusSubText}>
            {faseAtual} - {probabilidadeGravidez} probabilidade de engravidar
          </Text>
        </View>

        <View style={styles.cycleContainer}>
          <View style={styles.cycleHeader}>
            <Text style={styles.phaseTitle}>Fases do Ciclo</Text>
            <FontAwesome5 name="chevron-right" size={14} color={theme.primary} />
          </View>
          <FlatList
            data={fasesCiclo}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              let dataFase = "";
              if (item.fase === "Período Fértil") dataFase = ciclo.inicioFertilidade;
              else if (item.fase === "Ovulação") dataFase = ciclo.ovulacao;
              else if (item.fase === "Próxima Menstruação") dataFase = ciclo.proximaMenstruacao;

              return (
                <TouchableOpacity style={[styles.card, { backgroundColor: item.cor }]} onPress={abrirCalendario}>
                  <Text style={styles.cardDate}>{formatarData(dataFase)}</Text>
                  <Text style={styles.cardText}>{item.fase}</Text>
                  <FontAwesome5 name={item.icone} size={15} color="#333" />
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.graphBox}>
          <Text style={styles.graphTitle}>🌸 Ciclo nos últimos dias</Text>
          <LineChart
            data={data}
            width={screenWidth * 0.9}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 10 }}
          />
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { alignItems: "center", paddingVertical: 20, paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16 },
  header: { width: "90%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  calendarButton: { padding: 8, borderRadius: 10 },
  cycleInfoContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 15, alignItems: "center", width: "90%", marginBottom: 15, elevation: 3 },
  countdown: { fontSize: 24, fontWeight: "bold" },
  subtext: { fontSize: 14, color: "#555" },
  button: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20, marginBottom: 15 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  statusContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 15, alignItems: "center", width: "90%", marginVertical: 10, elevation: 3 },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusText: { fontSize: 18, fontWeight: "bold", color: "#d32f2f" },
  dropIcon: { marginRight: 8 },
  statusSubText: { fontSize: 12, color: "#777", textAlign: "center" },
  phaseTitle: { fontSize: 16, fontWeight: "bold" },
  cycleContainer: { width: "90%", backgroundColor: "#fff", borderRadius: 15, padding: 15, marginVertical: 10, elevation: 3 },
  cycleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 10 },
  card: { width: 140, height: 80, borderRadius: 10, padding: 10, marginHorizontal: 5, justifyContent: "center", alignItems: "center" },
  cardDate: { fontSize: 14, fontWeight: 'bold' },
  cardText: { fontSize: 14, paddingBottom: 5 },
  graphBox: { backgroundColor: "#fff", borderRadius: 15, padding: 15, width: "90%", marginTop: 15, alignItems: "center", elevation: 3 },
  graphTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
});
