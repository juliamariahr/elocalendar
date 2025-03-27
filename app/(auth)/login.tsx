import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import BackButton from "../../components/BackButton";
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home');
    } catch (error: any) {
      let customMessage = "E-mail ou senha inválidos.";
      if (error.code === "auth/user-not-found") {
        customMessage = "Usuário não encontrado.";
      } else if (error.code === "auth/wrong-password") {
        customMessage = "Senha incorreta.";
      } else if (error.code === "auth/invalid-email") {
        customMessage = "E-mail inválido.";
      }

      setErrorMessage(customMessage);
    }
  };

  useEffect(() => {
    if (errorMessage !== "") {
      const timeout = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  return (
    <View style={styles.container}>
      <BackButton route="/" />
      
      <Text style={styles.label}>E-mail</Text>
      <TextInput 
        style={styles.input} 
        value={email} 
        onChangeText={(text) => {
          setEmail(text);
          setErrorMessage("");
        }} 
        keyboardType="email-address" 
        autoCapitalize="none"
        placeholder="Digite seu e-mail"
      />

      <Text style={styles.label}>Senha</Text>
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.passwordInput} 
          value={password} 
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage("");
          }} 
          secureTextEntry={!showPassword}
          placeholder="Digite sua senha"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={18} // menor que antes
            color="#6a3b7d"
          />
        </TouchableOpacity>
      </View>

      {errorMessage !== "" && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6E4F6',
    padding: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6a3b7d',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  eyeButton: {
    padding: 4, // menor padding
  },
  button: {
    backgroundColor: '#a87cb3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: "#b00020",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 8,
    fontWeight: "bold",
  },
});