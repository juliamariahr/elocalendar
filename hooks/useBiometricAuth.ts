import { useEffect, useRef, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { AppState, AppStateStatus } from "react-native";

export function useBiometricAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const appState = useRef(AppState.currentState);
  const hasAuthenticatedOnce = useRef(false);

  useEffect(() => {
    const authenticate = async () => {
      const isEnrolled =
        (await LocalAuthentication.hasHardwareAsync()) &&
        (await LocalAuthentication.isEnrolledAsync());

      if (!isEnrolled) {
        setAuthenticated(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirme sua identidade",
      });

      if (result.success) {
        setAuthenticated(true);
        hasAuthenticatedOnce.current = true;
      }
    };

    const handleAppStateChange = (nextState: AppStateStatus) => {
      const wasInactive = appState.current.match(/inactive|background/);
      appState.current = nextState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    if (!hasAuthenticatedOnce.current) {
      authenticate();
    }

    return () => subscription.remove();
  }, []);

  return { authenticated };
}
