import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { auth, db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import SmoothTransition from "../../components/SmoothTransition";
import { cancelAllNotifications, scheduleDailyPillReminder, schedulePatchReminder } from "../../services/notifications";

export default function ContraceptiveMethod() {
  const router = useRouter();
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const methods = ["Pílula", "DIU", "Implante", "Injeção", "Adesivo"];
  const noMethodOption = "Não uso nenhum método";

  const [pillDays, setPillDays] = useState("");
  const [pillPause, setPillPause] = useState("");
  const [pillHour, setPillHour] = useState("");
  const [pillMinute, setPillMinute] = useState("");
  const [injectionType, setInjectionType] = useState<"Mensal" | "Trimestral" | null>(null);

  const toggleSelection = (method: string) => {
    if (method === noMethodOption) {
      setSelectedMethods([noMethodOption]);
      setPillDays("");
      setPillPause("");
      setPillHour("");
      setPillMinute("");
      setInjectionType(null);
    } else {
      if (selectedMethods.includes(noMethodOption)) {
        setSelectedMethods([method]);
      } else {
        if (selectedMethods.includes(method)) {
          setSelectedMethods(selectedMethods.filter((item) => item !== method));
          if (method === "Pílula") {
            setPillDays("");
            setPillPause("");
            setPillHour("");
            setPillMinute("");
          }
          if (method === "Injeção") {
            setInjectionType(null);
          }
        } else {
          setSelectedMethods([...selectedMethods, method]);
        }
      }
    }
  };

  const handleFinish = async () => {
    const validMethods = selectedMethods.filter((method) => method !== "Não uso nenhum método");
    if (validMethods.length === 0 && !selectedMethods.includes(noMethodOption)) {
      Alert.alert("Erro", "Selecione pelo menos um método.");
      return;
    }
    if (selectedMethods.includes("Pílula") && (!pillDays || !pillPause || !pillHour || !pillMinute)) {
      Alert.alert("Erro", "Preencha todos os campos da Pílula (dias, pausa e horário).");
      return;
    }
    if (selectedMethods.includes("Injeção") && !injectionType) {
      Alert.alert("Erro", "Selecione o tipo da Injeção (mensal ou trimestral).");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "usuarios", user.uid), {
          contraceptiveMethods: selectedMethods,
          medication_days: selectedMethods.includes("Pílula") ? pillDays : null,
          pause_week: selectedMethods.includes("Pílula") ? pillPause : null,
          pill_hour: selectedMethods.includes("Pílula") ? pillHour : null,
          pill_minute: selectedMethods.includes("Pílula") ? pillMinute : null,
          injection_type: selectedMethods.includes("Injeção") ? injectionType : null,
          cicloConfigurado: true,
        });

        await cancelAllNotifications();

        if (selectedMethods.includes("Pílula")) {
          await scheduleDailyPillReminder(parseInt(pillHour, 10), parseInt(pillMinute, 10));
        }
        if (selectedMethods.includes("Adesivo")) {
          await schedulePatchReminder(7);
        }
        router.replace("/(protected)/home");
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
        Alert.alert("Erro", "Não foi possível salvar os dados.");
      }
    }
  };

  return (
    <SmoothTransition>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Você usa ou já usou algum método contraceptivo?</Text>

          {methods.map((method) => (
            <View key={method} style={{ width: "100%" }}>
              <TouchableOpacity
                style={[styles.option, selectedMethods.includes(method) ? styles.selectedOption : {}]}
                onPress={() => toggleSelection(method)}
              >
                <Text style={[styles.optionText, selectedMethods.includes(method) ? styles.selectedText : {}]}>
                  {method}
                </Text>
              </TouchableOpacity>

              {selectedMethods.includes(method) && method === "Pílula" && (
                <View style={styles.box}>
                  <Text style={styles.label}>Quantos dias de uso?</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={pillDays}
                    onChangeText={setPillDays}
                    placeholder="Ex: 21"
                  />

                  <Text style={styles.label}>Quantos dias de pausa?</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={pillPause}
                    onChangeText={setPillPause}
                    placeholder="Ex: 7"
                  />

                  <Text style={styles.label}>Horário para tomar a pílula</Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      keyboardType="numeric"
                      value={pillHour}
                      onChangeText={setPillHour}
                      placeholder="Hora (Ex: 8)"
                      maxLength={2}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      keyboardType="numeric"
                      value={pillMinute}
                      onChangeText={setPillMinute}
                      placeholder="Minuto (Ex: 00)"
                      maxLength={2}
                    />
                  </View>
                </View>
              )}

              {selectedMethods.includes(method) && method === "Injeção" && (
                <View style={styles.box}>
                  <Text style={styles.label}>Tipo de injeção:</Text>
                  <View style={styles.injectionButtons}>
                    <TouchableOpacity
                      style={[styles.smallButton, injectionType === "Mensal" ? styles.selectedSmallButton : {}]}
                      onPress={() => setInjectionType("Mensal")}
                    >
                      <Text style={[styles.optionText, injectionType === "Mensal" ? styles.selectedText : {}]}>
                        Mensal
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallButton, injectionType === "Trimestral" ? styles.selectedSmallButton : {}]}
                      onPress={() => setInjectionType("Trimestral")}
                    >
                      <Text style={[styles.optionText, injectionType === "Trimestral" ? styles.selectedText : {}]}>
                        Trimestral
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.option, selectedMethods.includes(noMethodOption) ? styles.selectedOption : {}]}
            onPress={() => toggleSelection(noMethodOption)}
          >
            <Text style={[styles.optionText, selectedMethods.includes(noMethodOption) ? styles.selectedText : {}]}>
              {noMethodOption}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleFinish}>
            <Text style={styles.buttonText}>Finalizar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SmoothTransition>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  container: {
    width: "90%",
    alignItems: "center",
    backgroundColor: "#F6E4F6",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6a3b7d",
    textAlign: "center",
    marginBottom: 20,
  },
  option: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedOption: {
    backgroundColor: "#a87cb3",
  },
  box: {
    width: "100%",
    backgroundColor: "#f0d9f5",
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6a3b7d",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#a87cb3",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  injectionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  smallButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedSmallButton: {
    backgroundColor: "#a87cb3",
  },
});