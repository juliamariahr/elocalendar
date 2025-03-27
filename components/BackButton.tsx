import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Router } from "expo-router";

type BackButtonProps = {
  route: Parameters<Router["push"]>[0];
};

export default function BackButton({ route }: BackButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.button} onPress={() => router.push(route)}>
      <Ionicons name="arrow-back" size={24} color="#6a3b7d" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 15,
    left: 20,
    zIndex: 10,
  },
});
