import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import { useMenstrualCycle } from "../../hooks/useMenstrualCycle";

const formatarData = (dataString?: string) => {
  if (!dataString) return "Carregando...";
  const data = new Date(`${dataString}T12:00:00`);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export default function Home() {
  const router = useRouter();
  const ciclo = useMenstrualCycle();

  const [fasesCiclo] = useState([
    { id: "1", fase: "Período Fértil", icone: "leaf", cor: "#ffeb99" },
    { id: "2", fase: "Ovulação", icone: "egg", cor: "#ffd699" },
    { id: "3", fase: "Próxima Menstruação", icone: "tint", cor: "#ffcccc" },
  ]);

  const abrirCalendario = () => {
    router.push("/calendar");
  };

  const selecionarMenstruacao = () => {
    router.push("/(setup)/SelectMenstruation");
  };

  if (!ciclo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a87cb3" />
        <Text style={styles.loadingText}>Carregando informações do ciclo...</Text>
      </View>
    );
  }

  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  const ultimaMenstruacao = new Date(`${ciclo.ultimaMenstruacao}T12:00:00`);
  const diff = hoje.getTime() - ultimaMenstruacao.getTime();
  const diaDoCiclo = diff >= 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) + 1 : null;
  
  let faseAtual = "Fora do período fértil";
  let probabilidadeGravidez = "Baixa";

  if (hoje.toDateString() === new Date(ciclo.ovulacao).toDateString()) {
    faseAtual = "Ovulação";
    probabilidadeGravidez = "Muito alta";
  } else if (hoje >= new Date(ciclo.inicioFertilidade) && hoje <= new Date(ciclo.fimFertilidade)) {
    faseAtual = "Período Fértil";
    probabilidadeGravidez = "Alta";
  } else if (hoje >= new Date(ciclo.ultimaMenstruacao) && hoje <= new Date(ciclo.fimMenstruacao)) {
    faseAtual = "Menstruação";
    probabilidadeGravidez = "Muito baixa";
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seu Ciclo</Text>
        <TouchableOpacity style={styles.calendarButton} onPress={abrirCalendario}>
          <MaterialCommunityIcons name="calendar-multiselect" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Informações do Ciclo */}
      <TouchableOpacity style={styles.cycleInfoContainer} onPress={abrirCalendario}>
        <Text style={styles.countdown}>
          {ciclo.proximaMenstruacao ? `Faltam ${Math.round(
            (new Date(ciclo.proximaMenstruacao).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
          )} Dias` : "Carregando..."}
        </Text>
        <Text style={styles.subtext}>
          {formatarData(ciclo.proximaMenstruacao)} - Próxima Menstruação
        </Text>
        {ciclo.fimMenstruacao && (
          <Text style={styles.fimMenstruacaoText}>
            {formatarData(ciclo.fimMenstruacao)} - Fim da Menstruação
          </Text>
        )}
      </TouchableOpacity>

      {/* Botão para Registrar Menstruação */}
      <TouchableOpacity style={styles.button} onPress={selecionarMenstruacao}>
        <Text style={styles.buttonText}>Registrar Menstruação</Text>
      </TouchableOpacity>

      {/* Status do Ciclo */}
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <FontAwesome5 name="tint" size={18} color="#d32f2f" style={styles.dropIcon} />
          <Text style={styles.statusText}>
            {diaDoCiclo !== null
              ? `Hoje - Dia ${diaDoCiclo} do ciclo`
              : "Fora do ciclo menstrual"}
          </Text>
        </View>
        <Text style={styles.statusSubText}>{faseAtual} - {probabilidadeGravidez} probabilidade de engravidar</Text>
      </View>

      {/* Fases do Ciclo */}
      <View style={styles.cycleContainer}>
        <Text style={styles.phaseTitle}>Fases do Ciclo</Text>
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
                <FontAwesome5 name={item.icone} size={20} color="#333" />
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F6E4F6",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5e9f0",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6a3b7d",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#a87cb3",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  calendarButton: {
    backgroundColor: "#6a3b7d",
    padding: 8,
    borderRadius: 10,
  },
  cycleInfoContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    width: "90%",
    marginBottom: 15,
  },
  countdown: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#6a3b7d",
  },
  subtext: {
    fontSize: 14,
    color: "#555",
  },
  fimMenstruacaoText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#a87cb3",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    width: "90%",
    marginVertical: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  dropIcon: {
    marginRight: 8,
  },
  statusSubText: {
    fontSize: 12,
    color: "#777",
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a3b7d",
    marginBottom: 10,
  },
  cycleContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    width: 140,
    height: 80,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 14,
  },
});
