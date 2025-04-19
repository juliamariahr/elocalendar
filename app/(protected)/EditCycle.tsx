import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { FontAwesome5, FontAwesome6, MaterialIcons, Feather } from "@expo/vector-icons";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import BackButton from "../../components/BackButton";

const sintomasDisponiveis = [
  { id: "colica", label: "Cólica", icon: "sad-cry" },
  { id: "dor_cabeca", label: "Dor cabeça", icon: "head-side-virus" },
  { id: "fadiga", label: "Fadiga", icon: "tired" },
  { id: "acne", label: "Acne", icon: "bandage" },
  { id: "outro", label: "Outro", icon: "question" },
];

const humoresDisponiveis = [
  { id: "feliz", label: "Feliz", icon: "smile" },
  { id: "triste", label: "Triste", icon: "frown" },
  { id: "irritada", label: "Irritada", icon: "angry" },
  { id: "ansiosa", label: "Ansiosa", icon: "meh" },
  { id: "estressada", label: "Estressada", icon: "flushed" },
];

const fluxoOptions = [
  { nivel: 1, label: "Leve", icon: "tint" },
  { nivel: 2, label: "Leve", icon: "tint" },
  { nivel: 3, label: "Moderado", icon: "tint" },
  { nivel: 4, label: "Intenso", icon: "tint" },
  { nivel: 5, label: "Intenso", icon: "tint" },
];

export default function EditCycleLog() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();

  const [nota, setNota] = useState("");
  const [editando, setEditando] = useState(false);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [humores, setHumores] = useState<string[]>([]);
  const [fluxo, setFluxo] = useState<number | null>(null);
  const [atividadeSexual, setAtividadeSexual] = useState({
    pratica: false,
    preservativo: false,
    orgasmo: false,
    vezes: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
  
      const carregarDados = async () => {
        const user = auth.currentUser;
        if (!user || !date) return;
  
        const ref = doc(db, "usuarios", user.uid, "cycle_logs", date);
        const snap = await getDoc(ref);
  
        if (snap.exists() && isActive) {
          const data = snap.data();
          setNota(data.nota || "");
          setSintomas(data.sintomas || []);
          setHumores(data.humores || []);
          setFluxo(data.fluxo ?? null);
          setAtividadeSexual(data.atividadeSexual || {
            pratica: false,
            preservativo: false,
            orgasmo: false,
            vezes: 0,
          });
        }
      };
  
      carregarDados();
  
      return () => {
        isActive = false;
      };
    }, [date])
  );
  
  const salvarLog = async (campo: string, valor: any) => {
    const user = auth.currentUser;
    if (!user || !date) return;
    const ref = doc(db, "usuarios", user.uid, "cycle_logs", date);
    await setDoc(ref, {
      [campo]: valor,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  };

  const toggleItem = (array: string[], setArray: Function, campo: string, id: string) => {
    const atualizado = array.includes(id)
      ? array.filter((s) => s !== id)
      : [...array, id];
    setArray(atualizado);
    salvarLog(campo, atualizado);
  };

  const selecionarFluxo = (nivel: number) => {
    setFluxo(nivel);
    salvarLog("fluxo", nivel);
  };

  const salvarNota = () => {
    salvarLog("nota", nota);
    setEditando(false);
  };

  const toggleAtividade = (campo: keyof typeof atividadeSexual) => {
    const novoValor = campo === "vezes"
      ? atividadeSexual.vezes === 3 ? 0 : atividadeSexual.vezes + 1
      : !atividadeSexual[campo];
    const atualizado = { ...atividadeSexual, [campo]: novoValor };
    setAtividadeSexual(atualizado);
    salvarLog("atividadeSexual", atualizado);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton route="/calendar" />
      <Text style={styles.title}>Anotações</Text>

      {/* Notas */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Notas</Text>
          {!editando && (
            <TouchableOpacity onPress={() => setEditando(true)}>
              <MaterialIcons name="edit" size={20} color="#6a3b7d" />
            </TouchableOpacity>
          )}
        </View>
        {editando ? (
          <>
            <TextInput
              style={[styles.textInput, { minHeight: 120 }]}
              multiline
              numberOfLines={6}
              value={nota}
              onChangeText={setNota}
              placeholder="Digite suas observações..."
            />
            <TouchableOpacity onPress={salvarNota}>
              <Text style={styles.save}>Salvar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.readText}>
            {nota ? nota : "Nenhuma nota registrada para este dia."}
          </Text>
        )}
      </View>

      {/* Sintomas */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Sintomas</Text>
          <TouchableOpacity onPress={() => router.push(`/symptoms?date=${date}`)}>
            <Feather name="chevron-right" size={20} color="#6a3b7d" />
          </TouchableOpacity>
        </View>
        <View style={[styles.row, { flexWrap: "wrap", justifyContent: "space-between" }]}>
          {sintomasDisponiveis.slice(0, 4).map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleItem(sintomas, setSintomas, "sintomas", item.id)}
              style={styles.iconWrapper}
            >
              <View style={styles.iconCircle}>
                <FontAwesome6
                  name={item.icon as any}
                  size={24}
                  solid={sintomas.includes(item.id)}
                  color={sintomas.includes(item.id) ? "#a87cb3" : "#ccc"}
                />
              </View>
              <Text style={[styles.iconeLabel, sintomas.includes(item.id) && { color: "#a87cb3" }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Humores */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Humores</Text>
          <TouchableOpacity onPress={() => router.push(`/moods?date=${date}`)}>
            <Feather name="chevron-right" size={20} color="#6a3b7d" />
          </TouchableOpacity>
        </View>
        <View style={[styles.row, { flexWrap: "wrap", justifyContent: "space-between" }]}>
          {humoresDisponiveis.slice(0, 4).map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleItem(humores, setHumores, "humores", item.id)}
              style={styles.iconWrapper}
            >
              <View style={styles.iconCircle}>
                <FontAwesome6
                  name={item.icon as any}
                  size={24}
                  solid={humores.includes(item.id)}
                  color={humores.includes(item.id) ? "#a87cb3" : "#ccc"}
                />
              </View>
              <Text style={[styles.iconeLabel, humores.includes(item.id) && { color: "#a87cb3" }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fluxo */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Fluxo Menstrual</Text>
        <View style={styles.row}>
          {fluxoOptions.map((item) => (
            <TouchableOpacity key={item.nivel} onPress={() => selecionarFluxo(item.nivel)}>
              <View style={styles.iconCircle}>
                <FontAwesome5
                  name={item.icon as any}
                  size={24}
                  solid={fluxo !== null && fluxo >= item.nivel}
                  color={fluxo !== null && fluxo >= item.nivel ? "#B82132" : "#ccc"}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {fluxo !== null && (
          <Text style={styles.fluxoLabel}>
            {fluxo <= 2 ? "Leve" : fluxo === 3 ? "Moderado" : "Intenso"}
          </Text>
        )}
      </View>

      {/* Relações */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Sexo</Text>
          <TouchableOpacity onPress={() => router.push(`/SexualActivity?date=${date}`)}>
            <Feather name="chevron-right" size={20} color="#6a3b7d" />
          </TouchableOpacity>
        </View>
        <View style={[styles.row, { flexWrap: "wrap", justifyContent: "space-between" }]}>
          {( [
            { campo: "Não Pratiquei", icon: "heart", label: "Pratiquei", invertido: true },
            { campo: "preservativo", icon: "shield-heart", label: "Proteção" },
            { campo: "orgasmo", icon: "grin-hearts", label: "Orgasmo" }
          ] as {
            campo: keyof typeof atividadeSexual;
            icon: string;
            label: string;
            invertido?: boolean;
          }[] ).map(({ campo, icon, label, invertido }) => {
            const ativo = atividadeSexual[campo];
            return (
              <TouchableOpacity key={campo} style={styles.iconWrapper} onPress={() => toggleAtividade(campo)}>
                <View style={styles.iconCircle}>
                  <FontAwesome6
                    name={icon as any}
                    size={24}
                    color={invertido ? !ativo ? "#a87cb3" : "#ccc" : ativo ? "#a87cb3" : "#ccc"}
                    solid={invertido ? !ativo : ativo}
                  />
                </View>
                <Text style={styles.iconeLabel}>
                  {invertido ? !ativo ? label : "Não Praticou" : ativo ? label : `Sem ${label.toLowerCase()}`}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.iconWrapper} onPress={() => toggleAtividade("vezes")}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#a87cb3" }}>
                {atividadeSexual.vezes}
              </Text>
            </View>
            <Text style={styles.iconeLabel}>vezes</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    backgroundColor: "#F6E4F6",
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6a3b7d",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a3b7d",
  },
  textInput: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    textAlignVertical: "top",
  },
  readText: {
    color: "#333",
    marginTop: 10,
    marginBottom: 15,
  },
  save: {
    marginTop: 10,
    textAlign: "right",
    color: "#a87cb3",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
  },
  iconWrapper: {
    width: 70,
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fluxoLabel: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#6a3b7d",
    marginTop: 10,
  },
  iconeLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    color: "#6a3b7d",
  },
  selected: {
    backgroundColor: "#a87cb3",
    borderRadius: 8,
  },
});

