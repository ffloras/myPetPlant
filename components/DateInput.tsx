import { View, StyleSheet, Pressable, Text } from "react-native";
import { theme } from "@/themes";
import { format } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";

type DateInputType = {
  date?: Date;
  onPress: () => void;
};

export default function DateInput({ date, onPress }: DateInputType) {
  return (
    <View style={styles.inputRow}>
      <Ionicons
        name={date ? "leaf" : "leaf-outline"}
        size={24}
        color={theme.colorGreen}
      />
      <View style={styles.textRow}>
        <Text style={styles.text}>Starting on </Text>
        <Pressable style={[styles.dateButton]} onPress={onPress}>
          <Text
            style={[
              styles.text,
              date ? styles.dateTextSelected : styles.dateText,
            ]}
          >
            {date ? format(date, "eee MMM d") : "Select Date"}
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
    gap: 12,
    paddingVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorBlack,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "87%",
  },
  dateButton: {
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: theme.colorLightGrey,
    borderRadius: 6,
    width: "55%",
  },
  dateText: {
    color: theme.colorGrey,
    textAlign: "center",
    fontWeight: "600",
  },
  dateTextSelected: {
    color: theme.colorBlack,
    textAlign: "center",
    fontWeight: "600",
  },
});
