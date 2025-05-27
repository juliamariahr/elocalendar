import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Router } from "expo-router";
import { useTheme } from "../context/ThemeContext";

type BackButtonProps = {
  route?: Parameters<Router["push"]>[0];
};

export default function BackButton({ route }: BackButtonProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const handlePress = () => {
    if (route) {
      router.push(route);
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Ionicons name="arrow-back" size={24} color={theme.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
});
