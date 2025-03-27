import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    setErrorMessage("")

    if (!name || !birthdate || !email || !password || !confirmPassword) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage("A senha deve ter pelo menos uma letra maiúscula, um número e um caractere especial.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nome: name,
        dataNascimento: birthdate,
        email: email,
        cicloConfigurado: false,
      });

      router.replace("/(setup)/MenstruationDate");
    } catch (error: any) {
      console.error("Erro ao registrar usuário:", error.code, error.message);

      let customMessage = "Erro ao cadastrar. Tente novamente.";
      if (error.code === "auth/email-already-in-use") {
        customMessage = "Este e-mail já está cadastrado.";
      } else if (error.code === "auth/invalid-email") {
        customMessage = "O e-mail digitado é inválido.";
      } else if (error.code === "auth/weak-password") {
        customMessage = "A senha deve ter pelo menos 6 caracteres.";
      }

      setErrorMessage(customMessage);
    }
  };

  const handleBirthdateChange = (text: string) => {
    const formattedText = text
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d{4})$/, "$1/$2");
    setBirthdate(formattedText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Digite seu nome" />

      <Text style={styles.label}>Data de Nascimento</Text>
      <TextInput
        style={styles.input}
        value={birthdate}
        onChangeText={handleBirthdateChange}
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Crie uma senha" secureTextEntry />

      <Text style={styles.label}>Confirmar senha</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirme sua senha"
        secureTextEntry
      />

      {errorMessage !== "" && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </View>
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
  label: {
    alignSelf: "flex-start",
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#6a3b7d",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#a87cb3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#b00020",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 8,
    fontWeight: "bold",
  },
});