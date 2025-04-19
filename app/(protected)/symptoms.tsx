import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import BackButton from "../../components/BackButton";

const sintomas = {
  cabeça: [
    { id: "dor_cabeca", label: "Dor de cabeça", icon: "head-side-cough" },
    { id: "enxaqueca", label: "Enxaqueca", icon: "face-dizzy" },
    { id: "tontura", label: "Tontura", icon: "face-tired" },
    { id: "acne", label: "Acne", icon: "bandage" },
  ],
  corpo: [
    { id: "dor_pescoco", label: "Dor no pescoço", icon: "user-injured" },
    { id: "dor_ombro", label: "Dor no ombro", icon: "person" },
    { id: "mama_dor", label: "Mama com dor", icon: "heart-crack" },
    { id: "mama_dolorida", label: "Mama dolorida", icon: "heart" },
    { id: "costas", label: "Dores nas costas", icon: "bed" },
    { id: "lombar", label: "Dores na lombar", icon: "bed" },
    { id: "corpo", label: "Dores no corpo", icon: "person-dots-from-line" },
    { id: "muscular", label: "Dor muscular", icon: "dumbbell" },
    { id: "gripe", label: "Gripe", icon: "head-side-mask" },
    { id: "colica", label: "Cólica", icon: "heart-crack" },
    { id: "calafrios", label: "Calafrios", icon: "snowflake" },
    { id: "coceira", label: "Coceira", icon: "hand-dots" },
    { id: "calor", label: "Calor", icon: "temperature-high" },
    { id: "tpm", label: "TPM", icon: "face-tired" },
    { id: "peso", label: "Ganho de peso", icon: "weight-scale" },
    { id: "inchaco", label: "Inchaço", icon: "cloud-meatball" },
    { id: "prisao", label: "Prisão de ventre", icon: "toilet-paper" },
    { id: "diarreia", label: "Diarreia", icon: "toilet" },
    { id: "enjoo", label: "Enjoo", icon: "sad-cry" },
    { id: "gasoso", label: "Gases", icon: "wind" },
    { id: "fome", label: "Fome", icon: "utensils" },
    { id: "desejo", label: "Desejo", icon: "ice-cream" },
  ],
  utero: [
    { id: "pelvica", label: "Dor pélvica", icon: "heart" },
    { id: "cervical", label: "Firmeza cervical", icon: "venus" },
    { id: "abertura", label: "Abertura cervical", icon: "venus-double" },
    { id: "corrimento", label: "Corrimento", icon: "droplet" },
    { id: "fluxo", label: "Fluxo alto", icon: "droplet" },
    { id: "manchas", label: "Manchas", icon: "cloud-meatball" },
    { id: "irritacao", label: "Irritação", icon: "triangle-exclamation" },
  ],
  fluidos: [
    { id: "seco", label: "Seco", icon: "droplet-slash" },
    { id: "pegajoso", label: "Pegajoso", icon: "grip-lines" },
    { id: "cremoso", label: "Cremoso", icon: "cloud-sun" },
    { id: "aguado", label: "Aguado", icon: "water" },
    { id: "clara", label: "Clara de ovo", icon: "egg" },
    { id: "requeijao", label: "Requeijão", icon: "cheese" },
    { id: "verde", label: "Verde", icon: "leaf" },
    { id: "sangue", label: "Com sangue", icon: "droplet" },
    { id: "cheiro", label: "Com cheiro", icon: "cloud-meatball" },
  ],
  mental: [
    { id: "ansiedade", label: "Ansiedade", icon: "exclamation" },
    { id: "insonia", label: "Insônia", icon: "bed" },
    { id: "estresse", label: "Estresse", icon: "bolt" },
    { id: "mau_humor", label: "Mau humor", icon: "face-frown" },
    { id: "tensao", label: "Tensão", icon: "compress" },
    { id: "irritabilidade", label: "Irritabilidade", icon: "face-angry" },
    { id: "concentracao", label: "Sem concentração", icon: "brain" },
    { id: "fadiga", label: "Fadiga", icon: "face-tired" },
  ],
};

export default function AllSymptomsScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [selecionados, setSelecionados] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user || !date) return;
      const ref = doc(db, "usuarios", user.uid, "cycle_logs", date);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setSelecionados(data.sintomas || []);
      }
    };
    fetchData();
  }, [date]);

  const toggleSintoma = async (id: string) => {
    const atualizado = selecionados.includes(id)
      ? selecionados.filter((s) => s !== id)
      : [...selecionados, id];

    setSelecionados(atualizado);

    const user = auth.currentUser;
    if (!user || !date) return;

    const ref = doc(db, "usuarios", user.uid, "cycle_logs", date);
    await setDoc(
      ref,
      {
        sintomas: atualizado,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6E4F6" }}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Sintomas</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {Object.entries(sintomas).map(([categoria, lista]) => (
          <View key={categoria} style={styles.card}>
            <Text style={styles.categoria}>
              {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
            </Text>
            <View style={styles.grid}>
              {lista.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.iconBox,
                    selecionados.includes(item.id) && styles.selected,
                  ]}
                  onPress={() => toggleSintoma(item.id)}
                >
                  <FontAwesome6
                    name={item.icon as any}
                    size={22}
                    solid
                    color={selecionados.includes(item.id) ? "#fff" : "#3C096C"}
                  />
                  <Text
                    style={[
                      styles.label,
                      selecionados.includes(item.id) && { color: "#fff" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6a3b7d",
  },
  container: {
    paddingBottom: 30,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    marginHorizontal: 10,
    elevation: 2,
  },
  categoria: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a3b7d",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  iconBox: {
    width: Dimensions.get("window").width / 5 - 10,
    height: 70,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  selected: {
    backgroundColor: "#a87cb3",
  },
  label: {
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
    color: "#6a3b7d",
  },
});
