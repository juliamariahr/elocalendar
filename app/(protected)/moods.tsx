import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import BackButton from "../../components/BackButton";
import { useLocalSearchParams } from "expo-router";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const categorias = {
  "🌞 Boas vibrações": [
    { id: "feliz", label: "Felicidade", icon: "face-smile" },
    { id: "alegre", label: "Alegria", icon: "face-grin-beam" },
    { id: "animado", label: "Animação", icon: "bolt" },
    { id: "empolgado", label: "Empolgação", icon: "fire" },
    { id: "euforico", label: "Euforia", icon: "face-grin-stars" },
    { id: "confiante", label: "Confiança", icon: "thumbs-up" },
    { id: "grato", label: "Gratidão", icon: "hands-praying" },
    { id: "satisfeito", label: "Satisfação", icon: "face-laugh" },
  ],
  "💜 Emoções suaves": [
    { id: "tranquilo", label: "Tranquilidade", icon: "peace" },
    { id: "calmo", label: "Calma", icon: "cloud" },
    { id: "amoroso", label: "Amor", icon: "heart" },
    { id: "esperancoso", label: "Esperança", icon: "sun" },
    { id: "sensivel", label: "Sensibilidade", icon: "droplet" },
    { id: "reflexivo", label: "Reflexão", icon: "lightbulb" },
    { id: "pensativo", label: "Pensamento", icon: "circle-question" },
    { id: "curioso", label: "Curiosidade", icon: "magnifying-glass" },
    { id: "distraido", label: "Distração", icon: "face-meh" },
  ],
  "🌧️ Emoções desafiadoras": [
    { id: "irritado", label: "Irritação", icon: "face-angry" },
    { id: "ansioso", label: "Ansiedade", icon: "exclamation" },
    { id: "triste", label: "Tristeza", icon: "frown" },
    { id: "choroso", label: "Choro", icon: "sad-cry" },
    { id: "estressado", label: "Estresse", icon: "face-tired" },
    { id: "desanimado", label: "Desânimo", icon: "face-meh-blank" },
    { id: "cansado", label: "Cansaço", icon: "bed" },
    { id: "agressivo", label: "Agressividade", icon: "triangle-exclamation" },
    { id: "tenso", label: "Tensão", icon: "compress" },
    { id: "inseguro", label: "Insegurança", icon: "user-lock" },
    { id: "solitario", label: "Solidão", icon: "user-slash" },
    { id: "frustrado", label: "Frustração", icon: "circle-xmark" },
  ],
};

export default function MoodsScreen() {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const { date } = useLocalSearchParams<{ date: string }>();

  useEffect(() => {
    const carregarHumores = async () => {
      const user = auth.currentUser;
      if (!user || !date) return;

      const ref = doc(db, "usuarios", user.uid, "cycle_logs", date);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.humores) {
          setSelecionados(data.humores);
        }
      }
    };

    carregarHumores();
  }, [date]);

  const salvarHumores = async (novos: string[]) => {
    const user = auth.currentUser;
    if (!user || !date) return;

    const ref = doc(db, "usuarios", user.uid, "cycle_logs", date);
    await setDoc(
      ref,
      {
        humores: novos,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const toggleHumor = (id: string) => {
    const novos = selecionados.includes(id)
      ? selecionados.filter((h) => h !== id)
      : [...selecionados, id];

    setSelecionados(novos);
    salvarHumores(novos);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6E4F6" }}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Humores</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {Object.entries(categorias).map(([titulo, lista]) => (
          <View key={titulo} style={styles.card}>
            <Text style={styles.categoria}>{titulo}</Text>
            <View style={styles.grid}>
              {lista.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.iconBox,
                    selecionados.includes(item.id) && styles.selected,
                  ]}
                  onPress={() => toggleHumor(item.id)}
                >
                  <FontAwesome6
                    name={item.icon as any}
                    size={18}
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
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6a3b7d",
  },
  container: {
    paddingBottom: 30,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  categoria: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a3b7d",
    marginBottom: 10,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: 4,
  },
  iconBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 70,
    margin: 4,
  },
  selected: {
    backgroundColor: "#a87cb3",
  },
  label: {
    fontSize: 10,
    color: "#6a3b7d",
    marginTop: 5,
    textAlign: "center",
  },
});
