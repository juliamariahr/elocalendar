import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { auth, db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import SmoothTransition from "../../components/SmoothTransition";

function formatToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export default function MenstruationDate() {
  const router = useRouter();
  const [menstruationDate, setMenstruationDate] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [diasMenstruacao, setDiasMenstruacao] = useState("");

  const handleDateChange = (text: string) => {
    const formattedText = text
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d{4})$/, "$1/$2");
    setMenstruationDate(formattedText);
  };

  const isValidDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };

  const handleNext = async () => {
    if (!menstruationDate || !cycleLength || !diasMenstruacao) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (!isValidDate(menstruationDate)) {
      Alert.alert("Erro", "Digite uma data válida para a menstruação.");
      return;
    }

    const ciclo = Number(cycleLength);
    const duracaoMenstruacao = Number(diasMenstruacao);

    if (isNaN(ciclo) || isNaN(duracaoMenstruacao)) {
      Alert.alert("Erro", "A duração do ciclo e da menstruação devem ser números.");
      return;
    }

    if (ciclo < 20 || ciclo > 45) {
      Alert.alert("Erro", "O ciclo menstrual deve estar entre 20 e 45 dias.");
      return;
    }

    if (duracaoMenstruacao < 1 || duracaoMenstruacao > 10) {
      Alert.alert("Erro", "A menstruação deve durar entre 1 e 10 dias.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const formattedDateISO = formatToISO(menstruationDate);

        await updateDoc(doc(db, "usuarios", user.uid), {
          menstruationStart: formattedDateISO,
          cycleLength: ciclo,
          menstruationDuration: duracaoMenstruacao,
          cicloConfigurado: true,
          updatedAt: new Date().toISOString(),
        });

        router.push("/(setup)/ContraceptiveMethod");
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
        Alert.alert("Erro", "Não foi possível salvar os dados.");
      }
    }
  };

  return (
    <SmoothTransition>
      <View style={styles.container}>
        <Text style={styles.title}>Informe seu ciclo menstrual</Text>

        <Text style={styles.label}>Último primeiro dia da menstruação</Text>
        <TextInput
          style={styles.input}
          value={menstruationDate}
          onChangeText={handleDateChange}
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>Duração média do ciclo (dias)</Text>
        <TextInput
          style={styles.input}
          value={cycleLength}
          onChangeText={setCycleLength}
          placeholder="Ex: 28"
          keyboardType="numeric"
          maxLength={2}
        />

        <Text style={styles.label}>Duração média da menstruação (dias)</Text>
        <TextInput
          style={styles.input}
          value={diasMenstruacao}
          onChangeText={setDiasMenstruacao}
          placeholder="Ex: 5"
          keyboardType="numeric"
          maxLength={2}
        />

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </SmoothTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6E4F6",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#6a3b7d",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a3b7d",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#a87cb3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});