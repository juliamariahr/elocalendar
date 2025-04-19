import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import BackButton from "../../components/BackButton";
import { useLocalSearchParams } from "expo-router";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const categorias = {
  "🌞 Boas vibrações": [
    { id: "feliz", label: "Feliz", icon: "face-smile" },
    { id: "alegre", label: "Alegre", icon: "face-grin-beam" },
    { id: "animada", label: "Animada", icon: "bolt" },
    { id: "empolgada", label: "Empolgada", icon: "fire" },
    { id: "euforica", label: "Eufórica", icon: "face-grin-stars" },
    { id: "confiante", label: "Confiante", icon: "thumbs-up" },
    { id: "grata", label: "Grata", icon: "hands-praying" },
    { id: "satisfeita", label: "Satisfeita", icon: "face-laugh" },
  ],
  "💜 Emoções suaves": [
    { id: "tranquila", label: "Tranquila", icon: "peace" },
    { id: "calma", label: "Calma", icon: "cloud" },
    { id: "amorosa", label: "Amorosa", icon: "heart" },
    { id: "esperancosa", label: "Esperançosa", icon: "sun" },
    { id: "sensivel", label: "Sensível", icon: "droplet" },
    { id: "reflexiva", label: "Reflexiva", icon: "lightbulb" },
    { id: "pensativa", label: "Pensativa", icon: "circle-question" },
    { id: "curiosa", label: "Curiosa", icon: "magnifying-glass" },
    { id: "distraida", label: "Distraída", icon: "face-meh" },
  ],
  "🌧️ Emoções desafiadoras": [
    { id: "irritada", label: "Irritada", icon: "face-angry" },
    { id: "ansiosa", label: "Ansiosa", icon: "exclamation" },
    { id: "triste", label: "Triste", icon: "frown" },
    { id: "chorosa", label: "Chorosa", icon: "sad-cry" },
    { id: "estressada", label: "Estressada", icon: "face-tired" },
    { id: "desanimada", label: "Desanimada", icon: "face-meh-blank" },
    { id: "cansada", label: "Cansada", icon: "bed" },
    { id: "agressiva", label: "Agressiva", icon: "triangle-exclamation" },
    { id: "tensa", label: "Tensa", icon: "compress" },
    { id: "insegura", label: "Insegura", icon: "user-lock" },
    { id: "solitaria", label: "Solitária", icon: "user-slash" },
    { id: "frustrada", label: "Frustrada", icon: "circle-xmark" },
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
