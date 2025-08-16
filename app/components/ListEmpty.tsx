import { useRouter } from "expo-router";
import PlantActionButton from "./PlantActionButton";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { create } from "zustand";
import PlantImage from "./PlantImage";

export default function ListEmpty() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.navigate("/newPlant")}>
        <PlantImage />
      </Pressable>
      <PlantActionButton
        title="Add a Plant!"
        onPress={() => router.navigate("/newPlant")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 100,
  },
});
