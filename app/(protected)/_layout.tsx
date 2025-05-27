import { Stack } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, AppState, AppStateStatus, StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";
import { StatusBar } from "expo-status-bar";

export default function ProtectedLayout() {
  const { theme } = useTheme();
  const [biometriaFeita, setBiometriaFeita] = useState(false);
  const [loading, setLoading] = useState(true);
  const [foiReaberto, setFoiReaberto] = useState(false);
  const appState = useRef(AppState.currentState);

  const autenticarBiometria = async () => {
    try {
      const isEnrolled = await LocalAuthentication.hasHardwareAsync()
        && await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        await AsyncStorage.setItem("biometria_realizada", "true");
        setBiometriaFeita(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirme sua identidade",
        cancelLabel: "Cancelar",
        fallbackLabel: "Usar código",
        disableDeviceFallback: true,
      });

      if (result.success) {
        await AsyncStorage.setItem("biometria_realizada", "true");
        setBiometriaFeita(true);
      } else {
        setBiometriaFeita(false);
      }
    } catch (err) {
      console.error("Erro na biometria:", err);
      setBiometriaFeita(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkCicloAndAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const precisaBiometria = await AsyncStorage.getItem("biometria_necessaria");
      const jaFezBiometria = await AsyncStorage.getItem("biometria_realizada");

      if (precisaBiometria === "true") {
        await AsyncStorage.removeItem("biometria_necessaria");
        await AsyncStorage.removeItem("biometria_realizada");
      }

      const docSnap = await getDoc(doc(db, "usuarios", user.uid));
      const cicloFeito = docSnap.exists() && docSnap.data().cicloConfigurado;

      if (cicloFeito) {
        if (jaFezBiometria !== "true") {
          await autenticarBiometria();
        } else {
          setBiometriaFeita(true);
          setLoading(false);
        }
      } else {
        setBiometriaFeita(true);
        setLoading(false);
      }
    };

    checkCicloAndAuth();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState: AppStateStatus) => {
      const previous = appState.current;
      appState.current = nextState;

      if (previous === "background" && nextState === "active") {
        if (foiReaberto) {
          await AsyncStorage.removeItem("biometria_realizada");
          setBiometriaFeita(false);
          autenticarBiometria();
        } else {
          setFoiReaberto(true);
        }
      }
    });

    return () => sub.remove();
  }, [foiReaberto]);

  if (loading || !biometriaFeita) {
    return (
      <View style={[styles.authContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={theme.name === "dark" ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.authText, { color: theme.text }]}>
          {loading ? "Carregando..." : "Desbloqueie com biometria para continuar"}
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }} />
    </>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "bold",
  },
});
