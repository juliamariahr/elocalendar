import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { View, ActivityIndicator } from "react-native";

export default function Layout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const docSnap = await getDoc(doc(db, "usuarios", currentUser.uid));
        const cicloFeito = docSnap.exists() && docSnap.data().cicloConfigurado;
      
        if (cicloFeito) {
          router.replace("/(protected)/home");
        } else {
          router.replace("/(setup)/MenstruationDate");
        }        
      }      
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#a87cb3" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}