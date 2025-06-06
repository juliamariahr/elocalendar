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
import { useTheme } from "../../context/ThemeContext";

const sintomasDisponiveis = [
  { id: "colica", label: "Cólica", icon: "sad-cry" },
  { id: "dor_cabeca", label: "Dor cabeça", icon: "head-side-virus" },
  { id: "fadiga", label: "Fadiga", icon: "tired" },
  { id: "acne", label: "Acne", icon: "bandage" },
  { id: "outro", label: "Outro", icon: "question" },
];

const humoresDisponiveis = [
  { id: "feliz", label: "Felicidade", icon: "smile" },
  { id: "triste", label: "Tristeza", icon: "frown" },
  { id: "irritado", label: "Irritação", icon: "angry" },
  { id: "ansioso", label: "Ansiedade", icon: "meh" },
  { id: "estressado", label: "Estresse", icon: "flushed" },
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
  const { theme } = useTheme();

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
    let atualizado;
  
    if (campo === "vezes") {
      atualizado = {
        ...atividadeSexual,
        vezes: atividadeSexual.vezes === 3 ? 0 : atividadeSexual.vezes + 1,
        pratica: true,
      };
    } else if (campo === "pratica") {
      const novoValor = !atividadeSexual.pratica;
      atualizado = novoValor
        ? { ...atividadeSexual, pratica: true, vezes: 1 }
        : { pratica: false, preservativo: false, orgasmo: false, vezes: 0 };
    } else {
      atualizado = {
        ...atividadeSexual,
        [campo]: !atividadeSexual[campo],
        pratica: true,
      };
    }
  
    setAtividadeSexual(atualizado);
    salvarLog("atividadeSexual", atualizado);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton route="/calendar" />
      <Text style={[styles.title, { color: theme.primary }]}>Anotações</Text>

      {/* Notas */}
      <View style={[styles.card, { backgroundColor: theme.secondary }]}>
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Notas</Text>
          {!editando && (
            <TouchableOpacity onPress={() => setEditando(true)}>
              <MaterialIcons name="edit" size={20} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>
        {editando ? (
          <>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.secondary, color: theme.text }]}
              multiline
              numberOfLines={6}
              value={nota}
              onChangeText={setNota}
              placeholder="Digite suas observações..."
              placeholderTextColor={theme.text}
            />
            <TouchableOpacity onPress={salvarNota}>
              <Text style={[styles.save, { color: theme.button }]}>Salvar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.readText, { color: theme.text }]}>
            {nota ? nota : "Nenhuma nota registrada para este dia."}
          </Text>
        )}
      </View>

      {/* Sintomas */}
      <View style={[styles.card, { backgroundColor: theme.secondary }]}>
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Sintomas</Text>
          <TouchableOpacity onPress={() => router.push(`/symptoms?date=${date}`)}>
            <Feather name="chevron-right" size={20} color={theme.primary} />
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
                  color={sintomas.includes(item.id) ? theme.button : "#ccc"}
                />
              </View>
              <Text style={[styles.iconeLabel, { color: sintomas.includes(item.id) ? theme.button : theme.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Humores */}
      <View style={[styles.card, { backgroundColor: theme.secondary }]}>
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Humores</Text>
          <TouchableOpacity onPress={() => router.push(`/moods?date=${date}`)}>
            <Feather name="chevron-right" size={20} color={theme.primary} />
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
                  color={humores.includes(item.id) ? theme.button : "#ccc"}
                />
              </View>
              <Text style={[styles.iconeLabel, { color: humores.includes(item.id) ? theme.button : theme.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fluxo */}
      <View style={[styles.card, { backgroundColor: theme.secondary }]}>
        <Text style={[styles.subtitle, { color: theme.primary }]}>Fluxo Menstrual</Text>
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
          <Text style={[styles.fluxoLabel, { color: theme.primary }]}>
            {fluxo <= 2 ? "Leve" : fluxo === 3 ? "Moderado" : "Intenso"}
          </Text>
        )}
      </View>

      {/* Relações */}
      <View style={[styles.card, { backgroundColor: theme.secondary }]}>
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Sexo</Text>
          <TouchableOpacity onPress={() => router.push(`/SexualActivity?date=${date}`)}>
            <Feather name="chevron-right" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.row, { flexWrap: "wrap", justifyContent: "space-between" }]}>
          {(["pratica", "preservativo", "orgasmo"] as const).map((campo) => {
            const icons = { pratica: "heart", preservativo: "shield-heart", orgasmo: "grin-hearts" };
            const labels = { pratica: ["Não praticou", "Praticou"], preservativo: ["Sem proteção", "Protegido"], orgasmo: ["Sem orgasmo", "Teve orgasmo"] };
            const ativo = atividadeSexual[campo];
            return (
              <TouchableOpacity key={campo} style={styles.iconWrapper} onPress={() => toggleAtividade(campo)}>
                <View style={styles.iconCircle}>
                  <FontAwesome6 name={icons[campo] as any} size={24} solid={ativo} color={ativo ? theme.button : "#ccc"} />
                </View>
                <Text style={styles.iconeLabel}>{ativo ? labels[campo][1] : labels[campo][0]}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.iconWrapper} onPress={() => toggleAtividade("vezes")}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.button }}>
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
    paddingHorizontal: 15,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
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
  },
  textInput: {
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    textAlignVertical: "top",
  },
  readText: {
    marginTop: 10,
    marginBottom: 15,
  },
  save: {
    marginTop: 10,
    textAlign: "right",
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
    marginTop: 10,
  },
  iconeLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});