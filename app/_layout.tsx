import { useEffect, useState, useRef } from "react";
import { Stack, useRouter } from "expo-router";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { View, Text, ActivityIndicator, AppState, AppStateStatus, StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

export default function Layout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const appState = useRef(AppState.currentState);
  const [biometriaFeita, setBiometriaFeita] = useState(false);

  const autenticarBiometria = async () => {
    const isEnrolled = await LocalAuthentication.hasHardwareAsync()
      && await LocalAuthentication.isEnrolledAsync();

    if (!isEnrolled) {
      setBiometriaFeita(true);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirme sua identidade",
    });

    setBiometriaFeita(result.success);
  };

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      const wasInBackground = appState.current.match(/inactive|background/);
      if (wasInBackground && nextState === "active") {
        setBiometriaFeita(false);
        autenticarBiometria();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await autenticarBiometria();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || (user && !biometriaFeita)) {
    return (
      <View style={styles.authContainer}>
        <ActivityIndicator size="large" color="#a87cb3" />
        <Text style={styles.authText}>
          {loading ? "Carregando aplicativo..." : "Desbloqueie com biometria para continuar"}
        </Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: "#F6E4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  authText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6a3b7d",
    fontWeight: "bold",
  },
});
