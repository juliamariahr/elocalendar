import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { auth, db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import SmoothTransition from "../../components/SmoothTransition";

export default function ContraceptiveMethod() {
  const router = useRouter();
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

  const methods = ["Pílula", "DIU", "Implante", "Injeção", "Adesivo"];
  const noMethodOption = "Não uso nenhum método";

  const toggleSelection = (method: string) => {
    if (method === noMethodOption) {
      setSelectedMethods([noMethodOption]);
    } else {
      if (selectedMethods.includes(noMethodOption)) {
        setSelectedMethods([method]);
      } else {
        if (selectedMethods.includes(method)) {
          setSelectedMethods(selectedMethods.filter((item) => item !== method));
        } else {
          setSelectedMethods([...selectedMethods, method]);
        }
      }
    }
  };

  const handleFinish = async () => {
    if (selectedMethods.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos uma opção.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "usuarios", user.uid), {
          contraceptiveMethods: selectedMethods, 
          cicloConfigurado: true,
        });

        Alert.alert("Sucesso", "Configuração concluída!");
        router.replace("/(protected)/home");
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
        Alert.alert("Erro", "Não foi possível salvar os dados.");
      }
    }
  };

  return (
    <SmoothTransition>
      <View style={styles.container}>
        <Text style={styles.title}>Você usa ou já usou algum método contraceptivo?</Text>

        {methods.map((method) => (
          <TouchableOpacity
            key={method}
            style={[styles.option, selectedMethods.includes(method) ? styles.selectedOption : {}]}
            onPress={() => toggleSelection(method)}
          >
            <Text style={[styles.optionText, selectedMethods.includes(method) ? styles.selectedText : {}]}>
              {method}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Opção "Não uso nenhum método" */}
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
    optionText: {
      fontSize: 16,
      color: "#333",
    },
    selectedText: {
      color: "#fff", 
      fontWeight: "bold",
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
  });
  