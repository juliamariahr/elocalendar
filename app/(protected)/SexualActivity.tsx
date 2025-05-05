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
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function SexualActivityScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();

  const [pratica, setPratica] = useState<"sim" | "nao" | null>(null);
  const [preservativo, setPreservativo] = useState<"sim" | "nao" | null>(null);
  const [orgasmo, setOrgasmo] = useState<"sim" | "nao" | null>(null);
  const [vezes, setVezes] = useState(1);

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
      setVezes(1);
      salvarDados("nao", null, null, 1);
    } else {
      setPratica("sim");
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
    const vezesLimitado = Math.min(10, Math.max(1, novo));
    setVezes(vezesLimitado);
    if (pratica !== "sim") setPratica("sim");
    salvarDados("sim", preservativo, orgasmo, vezesLimitado);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <Text style={styles.title}>Relação Sexual</Text>

      {/* Praticou ou Não Praticou */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Atividade Sexual</Text>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => alterarPratica("sim")}
            style={[
              styles.iconBox,
              pratica === "sim" && styles.selectedBox,
            ]}
          >
            <FontAwesome6
              name="heart"
              size={24}
              solid
              color={pratica === "sim" ? "#fff" : "#6a3b7d"}
            />
            <Text
              style={[
                styles.iconLabel,
                pratica === "sim" && { color: "#fff" },
              ]}
            >
              Praticou
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alterarPratica("nao")}
            style={[
              styles.iconBox,
              pratica === "nao" && styles.selectedBox,
            ]}
          >
            <FontAwesome6
              name="ban"
              size={24}
              color={pratica === "nao" ? "#fff" : "#6a3b7d"}
            />
            <Text
              style={[
                styles.iconLabel,
                pratica === "nao" && { color: "#fff" },
              ]}
            >
              Não praticou
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preservativo */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Preservativo nas relações</Text>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => alterarPreservativo("sim")}
            style={[
              styles.iconBox,
              preservativo === "sim" && styles.selectedBox,
            ]}
          >
            <FontAwesome6
              name="shield-heart"
              size={24}
              solid
              color={preservativo === "sim" ? "#fff" : "#6a3b7d"}
            />
            <Text
              style={[
                styles.iconLabel,
                preservativo === "sim" && { color: "#fff" },
              ]}
            >
              Protegido
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alterarPreservativo("nao")}
            style={[
              styles.iconBox,
              preservativo === "nao" && styles.selectedBox,
            ]}
          >
            <FontAwesome6
              name="ban"
              size={24}
              color={preservativo === "nao" ? "#fff" : "#6a3b7d"}
            />
            <Text
              style={[
                styles.iconLabel,
                preservativo === "nao" && { color: "#fff" },
              ]}
            >
              Desprotegido
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orgasmo */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Orgasmo feminino</Text>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => alterarOrgasmo("sim")}
            style={[
              styles.iconBox,
              orgasmo === "sim" && styles.selectedBox,
            ]}
          >
            <FontAwesome6
              name="face-kiss-beam"
              size={24}
              solid
              color={orgasmo === "sim" ? "#fff" : "#6a3b7d"}
            />
            <Text
              style={[
                styles.iconLabel,
                orgasmo === "sim" && { color: "#fff" },
              ]}
            >
              Sim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alterarOrgasmo("nao")}
            style={[
              styles.iconBox,
              orgasmo === "nao" && styles.selectedBox,
            ]}
          >
            <FontAwesome6
              name="face-sad-tear"
              size={24}
              color={orgasmo === "nao" ? "#fff" : "#6a3b7d"}
            />
            <Text
              style={[
                styles.iconLabel,
                orgasmo === "nao" && { color: "#fff" },
              ]}
            >
              Não
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Número de vezes */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Número de vezes</Text>
        <View style={[styles.row, { justifyContent: "center" }]}>
          <TouchableOpacity
            onPress={() => alterarVezes(vezes - 1)}
            style={styles.counterButton}
          >
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.countValue}>{vezes}</Text>
          <TouchableOpacity
            onPress={() => alterarVezes(vezes + 1)}
            style={styles.counterButton}
          >
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F6E4F6",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6a3b7d",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    elevation: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a3b7d",
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
    backgroundColor: "#fff",
    padding: 10,
    margin: 8,
    width: 100,
  },
  selectedBox: {
    backgroundColor: "#a87cb3",
    borderRadius: 8,
  },
  iconLabel: {
    marginTop: 5,
    color: "#6a3b7d",
    fontSize: 12,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E0AAFF",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
  },
  counterText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6a3b7d",
  },
  countValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6a3b7d",
    alignSelf: "center",
  },
});
