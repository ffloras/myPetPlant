import { useRouter } from "expo-router";
import { View, StyleSheet, Pressable, Image, Text } from "react-native";
import PlantImage from "./PlantImage";
import { theme } from "@/themes";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function ListEmpty() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.navigate("/newPlant")}
    >
      <PlantImage size={160} />
      <View style={styles.textRow}>
        <Text style={styles.text}>Add a Plant</Text>
        <AntDesign
          style={styles.plusIcon}
          name="pluscircleo"
          size={22}
          color={theme.colorDarkGreen}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    marginVertical: 30,
    marginHorizontal: 15,
    borderRadius: 24,
    backgroundColor: theme.colorPaleGreen,
    gap: 12,
    shadowColor: theme.colorBlack,
    elevation: 3,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Quicksand_700Bold",
    color: theme.colorDarkGreen,
  },
  plusIcon: {
    paddingTop: 4,
  },
});
