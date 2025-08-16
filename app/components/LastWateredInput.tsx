import { View, StyleSheet, Pressable, Text } from "react-native";
import { theme } from "@/themes";
import { format } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";

type LastWateredInputType = {
  lastWatered?: number;
  onPress: () => void;
};

export default function LastWateredInput({
  lastWatered,
  onPress,
}: LastWateredInputType) {
  return (
    <View style={styles.inputRow}>
      <Ionicons name={"leaf"} size={24} color={theme.colorGreen} />
      <Text style={[styles.text, styles.lastWateredText]}>Last Watered</Text>
      <Pressable style={styles.dateButton} onPress={onPress}>
        <Text style={[styles.text, styles.dateText]}>
          {lastWatered ? format(lastWatered, "eee MMM d") : "N/A"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "12",
    paddingVertical: 10,
  },
  text: {
    fontSize: 14,
  },
  lastWateredText: {
    paddingRight: 0,
  },
  dateButton: {
    paddingVertical: 10,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: theme.colorLightGrey,
    width: 100,
  },
  dateText: {
    textAlign: "center",
  },
});
