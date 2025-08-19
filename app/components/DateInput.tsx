import { View, StyleSheet, Pressable, Text } from "react-native";
import { theme } from "@/themes";
import { format } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useWindowDimensions } from "react-native";

type DateInputType = {
  date?: Date;
  onPress: () => void;
  type: "add" | "edit";
};

export default function DateInput({ date, onPress, type }: DateInputType) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.inputRow}>
      <Ionicons
        name={date ? "leaf" : "leaf-outline"}
        size={24}
        color={theme.colorGreen}
      />
      <Text style={styles.text}>
        {type === "add" ? "Starting on" : "Water on"}
      </Text>
      <Pressable
        style={[
          styles.dateButton,
          type === "add" ? { width: width / 2.8 } : styles.buttonEdit,
        ]}
        onPress={onPress}
      >
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
  dateButton: {
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: theme.colorLightGrey,
    borderRadius: 6,
  },
  buttonEdit: {
    width: 155,
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
