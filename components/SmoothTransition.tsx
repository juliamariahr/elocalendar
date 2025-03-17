import { Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";

export default function SmoothTransition({ children }: { children: React.ReactNode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return <Animated.View style={{ flex: 1, opacity: fadeAnim }}>{children}</Animated.View>;
}
