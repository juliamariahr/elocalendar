import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import BackButton from "../../components/BackButton";
import { useLocalSearchParams } from "expo-router";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";

export default function SexualActivityScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [pratica, setPratica] = useState<"sim" | "nao" | null>(null);
  const [preservativo, setPreservativo] = useState<"sim" | "nao" | null>(null);
  const [orgasmo, setOrgasmo] = useState<"sim" | "nao" | null>(null);
  const [vezes, setVezes] = useState(1);
  const { theme } = useTheme();

  const salvarDados = async (
    novoPratica = pratica,
    novoPreservativo = preservativo,
    novoOrgasmo = orgasmo,
    novoVezes = vezes
  ) => {
    const user = auth.currentUser;
    if (!user || !date) return;

    const ref = doc(db, "usuarios", user.uid, "cycle_logs", date);
    await setDoc(
      ref,
      {
        atividadeSexual: {
          pratica: novoPratica === "sim",
          preservativo: novoPreservativo === "sim",
          orgasmo: novoOrgasmo === "sim",
          vezes: novoVezes,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  useEffect(() => {
    const carregarDados = async () => {
      const user = auth.currentUser;
      if (!user || !date) return;
      const ref = doc(db, "usuarios", user.uid, "cycle_logs", date);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.atividadeSexual) {
          setPratica(data.atividadeSexual.pratica ? "sim" : "nao");
          setPreservativo(data.atividadeSexual.preservativo ? "sim" : "nao");
          setOrgasmo(data.atividadeSexual.orgasmo ? "sim" : "nao");
          setVezes(data.atividadeSexual.vezes ?? 1);
        }
      }
    };
    carregarDados();
  }, [date]);

  const alterarPratica = (valor: "sim" | "nao") => {
    if (valor === "nao") {
      setPratica("nao");
      setPreservativo(null);
      setOrgasmo(null);
      setVezes(0);
      salvarDados("nao", null, null, 0);
    } else {
      setPratica("sim");
      setVezes(1);
      salvarDados("sim", preservativo, orgasmo, vezes);
    }
  };

  const alterarPreservativo = (valor: "sim" | "nao") => {
    setPreservativo(valor);
    if (pratica !== "sim") setPratica("sim");
    salvarDados("sim", valor, orgasmo, vezes);
  };

  const alterarOrgasmo = (valor: "sim" | "nao") => {
    setOrgasmo(valor);
    if (pratica !== "sim") setPratica("sim");
    salvarDados("sim", preservativo, valor, vezes);
  };

  const alterarVezes = (novo: number) => {
    const vezesLimitado = Math.min(10, Math.max(0, novo));
    setVezes(vezesLimitado);

    if (vezesLimitado === 0) {
      setPratica("nao");
      setPreservativo(null);
      setOrgasmo(null);
      salvarDados("nao", null, null, 1);
    } else {
      if (pratica !== "sim") setPratica("sim");
      salvarDados("sim", preservativo, orgasmo, vezesLimitado);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <BackButton />
        <Text style={[styles.title, { color: theme.primary }]}>Relação Sexual</Text>

        {/* Praticou ou Não Praticou */}
        <View style={[styles.card, { backgroundColor: theme.secondary }]}>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Atividade Sexual</Text>
          <View style={styles.row}>
            {["sim", "nao"].map((valor) => (
              <TouchableOpacity
                key={valor}
                onPress={() => alterarPratica(valor as "sim" | "nao")}
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.secondary },
                  pratica === valor && { backgroundColor: theme.button },
                ]}
              >
                <FontAwesome6
                  name={valor === "sim" ? "heart" : "ban"}
                  size={24}
                  solid
                  color={pratica === valor ? theme.buttonText : theme.primary}
                />
                <Text
                  style={[
                    styles.iconLabel,
                    { color: theme.primary },
                    pratica === valor && { color: theme.buttonText },
                  ]}
                >
                  {valor === "sim" ? "Praticou" : "Não praticou"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preservativo */}
        <View style={[styles.card, { backgroundColor: theme.secondary }]}>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Preservativo nas relações</Text>
          <View style={styles.row}>
            {["sim", "nao"].map((valor) => (
              <TouchableOpacity
                key={valor}
                onPress={() => alterarPreservativo(valor as "sim" | "nao")}
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.secondary },
                  preservativo === valor && { backgroundColor: theme.button },
                  pratica === "nao" && { opacity: 0.5 },
                ]}
                disabled={pratica === "nao"}
              >
                <FontAwesome6
                  name={valor === "sim" ? "shield-heart" : "ban"}
                  size={24}
                  solid
                  color={preservativo === valor ? theme.buttonText : theme.primary}
                />
                <Text
                  style={[
                    styles.iconLabel,
                    { color: theme.primary },
                    preservativo === valor && { color: theme.buttonText },
                  ]}
                >
                  {valor === "sim" ? "Protegido" : "Desprotegido"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Orgasmo */}
        <View style={[styles.card, { backgroundColor: theme.secondary }]}>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Orgasmo feminino</Text>
          <View style={styles.row}>
            {["sim", "nao"].map((valor) => (
              <TouchableOpacity
                key={valor}
                onPress={() => alterarOrgasmo(valor as "sim" | "nao")}
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.secondary },
                  orgasmo === valor && { backgroundColor: theme.button },
                  pratica === "nao" && { opacity: 0.5 },
                ]}
                disabled={pratica === "nao"}
              >
                <FontAwesome6
                  name={valor === "sim" ? "face-kiss-beam" : "face-sad-tear"}
                  size={24}
                  solid
                  color={orgasmo === valor ? theme.buttonText : theme.primary}
                />
                <Text
                  style={[
                    styles.iconLabel,
                    { color: theme.primary },
                    orgasmo === valor && { color: theme.buttonText },
                  ]}
                >
                  {valor === "sim" ? "Sim" : "Não"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Número de vezes */}
        <View style={[styles.card, { backgroundColor: theme.secondary }]}>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Número de vezes</Text>
          <View style={[styles.row, { justifyContent: "center" }]}>
            <TouchableOpacity
              onPress={() => alterarVezes(vezes - 1)}
              style={[
                styles.counterButton,
                { backgroundColor: theme.button },
                pratica === "nao" && { opacity: 0.5 },
              ]}
              disabled={pratica === "nao"}
            >
              <Text style={[styles.counterText, { color: theme.buttonText }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.countValue, { color: theme.primary }]}>{vezes}</Text>
            <TouchableOpacity
              onPress={() => alterarVezes(vezes + 1)}
              style={[
                styles.counterButton,
                { backgroundColor: theme.button },
                pratica === "nao" && { opacity: 0.5 },
              ]}
              disabled={pratica === "nao"}
            >
              <Text style={[styles.counterText, { color: theme.buttonText }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    elevation: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    margin: 8,
    width: 100,
    borderRadius: 8,
  },
  iconLabel: {
    marginTop: 5,
    fontSize: 12,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
  },
  counterText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  countValue: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
  },
});
