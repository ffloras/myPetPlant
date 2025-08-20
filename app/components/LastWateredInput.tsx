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
      <View style={styles.textRow}>
        <Text style={[styles.text, styles.lastWateredText]}>Last Watered </Text>
        <Pressable style={styles.dateButton} onPress={onPress}>
          <Text style={[styles.text, styles.dateText]}>
            {lastWatered ? format(lastWatered, "eee MMM d") : "N/A"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "87%",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorBlack,
  },
  lastWateredText: {
    fontWeight: "600",
  },
  dateButton: {
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: theme.colorLightGrey,
    borderRadius: 6,
    width: "50%",
  },
  dateText: {
    textAlign: "center",
    color: theme.colorDarkGreen,
  },
});
