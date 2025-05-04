import { Stack } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, AppState, AppStateStatus, StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedLayout() {
  const [biometriaFeita, setBiometriaFeita] = useState(false);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

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
    const checkCicloAndAuth = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docSnap = await getDoc(doc(db, "usuarios", user.uid));
      const cicloFeito = docSnap.exists() && docSnap.data().cicloConfigurado;

      if (cicloFeito) {
        await autenticarBiometria();
      } else {
        setBiometriaFeita(true);
      }

      setLoading(false);
    };

    checkCicloAndAuth();
  }, []);

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

  if (loading || !biometriaFeita) {
    return (
      <View style={styles.authContainer}>
        <ActivityIndicator size="large" color="#a87cb3" />
        <Text style={styles.authText}>
          {loading ? "Carregando..." : "Desbloqueie com biometria para continuar"}
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
