import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import BackButton from "../../components/BackButton";
import { Feather } from "@expo/vector-icons";
import { cancelAllNotifications, scheduleDailyPillReminder, schedulePatchReminder } from "../../services/notifications";

export default function Profile() {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);

  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    birthdate?: string;
    medication_days?: string;
    pause_week?: string;
    contraceptiveMethods?: string[];
    injection_type?: string;
    pill_hour?: string;
    pill_minute?: string;
  }>({
    name: "",
    email: "",
    birthdate: "",
    medication_days: "",
    pause_week: "",
    contraceptiveMethods: [],
    injection_type: "",
    pill_hour: "",
    pill_minute: "",
  });

  const allMethods = ["Pílula", "DIU", "Implante", "Injeção", "Adesivo"];

  useEffect(() => {
    async function fetchUserData() {
      if (auth.currentUser) {
        const userDoc = doc(db, "usuarios", auth.currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.nome || "",
            email: data.email || "",
            birthdate: data.dataNascimento || "",
            medication_days: data.medication_days || "",
            pause_week: data.pause_week || "",
            contraceptiveMethods: data.contraceptiveMethods || [],
            injection_type: data.injection_type || "",
            pill_hour: data.pill_hour || "",
            pill_minute: data.pill_minute || "",
          });
        }
      }
    }
    fetchUserData();
  }, []);

  const toggleMethod = (method: string) => {
    if (userData.contraceptiveMethods?.includes(method)) {
      setUserData({
        ...userData,
        contraceptiveMethods: userData.contraceptiveMethods.filter((m) => m !== method),
      });
    } else {
      setUserData({
        ...userData,
        contraceptiveMethods: [...(userData.contraceptiveMethods || []), method],
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  };

  const handleSave = async () => {
    if (auth.currentUser) {
      if (userData.contraceptiveMethods?.includes("Pílula") && (!userData.medication_days || !userData.pause_week || !userData.pill_hour || !userData.pill_minute)) {
        Alert.alert("Erro", "Preencha todos os campos da pílula (dias, pausa e horário).");
        return;
      }

      if (userData.contraceptiveMethods?.includes("Injeção") && !userData.injection_type) {
        Alert.alert("Erro", "Selecione o tipo da injeção (Mensal ou Trimestral).");
        return;
      }

      try {
        const userDoc = doc(db, "usuarios", auth.currentUser.uid);
        await updateDoc(userDoc, {
          nome: userData.name,
          email: userData.email,
          dataNascimento: userData.birthdate,
          medication_days: userData.medication_days || null,
          pause_week: userData.pause_week || null,
          pill_hour: userData.pill_hour || null,
          pill_minute: userData.pill_minute || null,
          contraceptiveMethods: userData.contraceptiveMethods || [],
          injection_type: userData.injection_type || null,
        });

        setEditMode(false);
        await cancelAllNotifications();

        if (userData.contraceptiveMethods?.includes("Pílula") && userData.pill_hour && userData.pill_minute) {
          await scheduleDailyPillReminder(parseInt(userData.pill_hour, 10), parseInt(userData.pill_minute, 10));
        }

        if (userData.contraceptiveMethods?.includes("Adesivo")) {
          await schedulePatchReminder(7);
        }

        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      } catch (error) {
        Alert.alert("Erro", "Não foi possível atualizar o perfil.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {!editMode && <BackButton route="/home" />}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.box}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Perfil</Text>
            <TouchableOpacity onPress={() => setEditMode(!editMode)}>
              <Feather name="edit" size={20} color="#6a3b7d" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nome:</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
            />
          ) : (
            <Text style={styles.text}>{userData.name}</Text>
          )}

          <Text style={styles.label}>Data de nascimento:</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={userData.birthdate}
              onChangeText={(text) => setUserData({ ...userData, birthdate: text })}
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <Text style={styles.text}>{userData.birthdate || "Não informado"}</Text>
          )}

          <Text style={styles.label}>Email:</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
            />
          ) : (
            <Text style={styles.text}>{userData.email}</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.subtitle}>Métodos Contraceptivos</Text>

          {editMode ? (
            <>
              {allMethods.map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[styles.option, userData.contraceptiveMethods?.includes(method) ? styles.selectedOption : {}]}
                  onPress={() => toggleMethod(method)}
                >
                  <Text style={[styles.optionText, userData.contraceptiveMethods?.includes(method) ? styles.selectedText : {}]}>
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          ) : userData.contraceptiveMethods && userData.contraceptiveMethods.length > 0 ? (
            userData.contraceptiveMethods.map((method, index) => (
              <Text key={index} style={styles.text}>
                {method}
              </Text>
            ))
          ) : (
            <Text style={styles.text}>Nenhum método selecionado</Text>
          )}

          {userData.contraceptiveMethods?.includes("Pílula") && (
            <>
              <Text style={styles.label}>Quantos dias de uso?</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={userData.medication_days}
                  onChangeText={(text) => setUserData({ ...userData, medication_days: text })}
                  placeholder="Ex: 21"
                />
              ) : (
                <Text style={styles.text}>{userData.medication_days || "Não informado"}</Text>
              )}

              <Text style={styles.label}>Semana de pausa (dias):</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={userData.pause_week}
                  onChangeText={(text) => setUserData({ ...userData, pause_week: text })}
                  placeholder="Ex: 7"
                />
              ) : (
                <Text style={styles.text}>{userData.pause_week || "Não informado"}</Text>
              )}
              
              <Text style={styles.label}>Horário da Pílula:</Text>
              {editMode ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  keyboardType="numeric"
                  value={userData.pill_hour}
                  onChangeText={(text) => {
                    let hour = text.replace(/\D/g, "");
                    let num = parseInt(hour, 10);
                    if (!isNaN(num)) {
                      if (num > 23) num = 23;
                      hour = num.toString();
                    }
                    setUserData({ ...userData, pill_hour: hour });
                  }}
                  placeholder="Hora (0-23)"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  keyboardType="numeric"
                  value={userData.pill_minute}
                  onChangeText={(text) => {
                    let minute = text.replace(/\D/g, "");
                    let num = parseInt(minute, 10);
                    if (!isNaN(num)) {
                      if (num > 59) num = 59;
                      minute = num.toString();
                    }
                    setUserData({ ...userData, pill_minute: minute });
                  }}
                  placeholder="Minuto (0-59)"
                  maxLength={2}
                />
              </View>
              ) : (
                <Text style={styles.text}>
                  {userData.pill_hour && userData.pill_minute
                    ? `${userData.pill_hour.padStart(2, "0")}:${userData.pill_minute.padStart(2, "0")}`
                    : "Não informado"}
                </Text>
              )}
            </>
          )}

          {userData.contraceptiveMethods?.includes("Injeção") && (
            <>
              <Text style={styles.label}>Tipo de Injeção:</Text>
              {editMode ? (
                <View style={styles.injectionButtons}>
                  <TouchableOpacity
                    style={[styles.smallButton, userData.injection_type === "Mensal" ? styles.selectedSmallButton : {}]}
                    onPress={() => setUserData({ ...userData, injection_type: "Mensal" })}
                  >
                    <Text style={[styles.optionText, userData.injection_type === "Mensal" ? styles.selectedText : {}]}>
                      Mensal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.smallButton, userData.injection_type === "Trimestral" ? styles.selectedSmallButton : {}]}
                    onPress={() => setUserData({ ...userData, injection_type: "Trimestral" })}
                  >
                    <Text style={[styles.optionText, userData.injection_type === "Trimestral" ? styles.selectedText : {}]}>
                      Trimestral
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.text}>{userData.injection_type || "Não informado"}</Text>
              )}
            </>
          )}

          {editMode && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E4F6",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  box: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "stretch",
    elevation: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6a3b7d",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6a3b7d",
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#6a3b7d",
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#a87cb3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  option: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#a87cb3",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
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
  },
  selectedSmallButton: {
    backgroundColor: "#a87cb3",
  },
});
