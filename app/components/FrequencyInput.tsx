import { View, StyleSheet, TextInput, Text } from "react-native";
import { theme } from "@/themes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dispatch, SetStateAction } from "react";

type FrequencyInputType = {
  frequencyDays?: string;
  onChangeText: Dispatch<SetStateAction<string | undefined>>;
};

export default function FrequencyInput({
  frequencyDays,
  onChangeText,
}: FrequencyInputType) {
  return (
    <View style={styles.inputRow}>
      <Ionicons
        name={frequencyDays ? "leaf" : "leaf-outline"}
        size={24}
        color={theme.colorGreen}
      />
      <Text style={styles.text}>Water every</Text>
      <TextInput
        value={frequencyDays}
        style={[styles.frequencyInput, styles.text]}
        keyboardType="number-pad"
        onChangeText={onChangeText}
      ></TextInput>
      <Text style={styles.text}>days</Text>
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
  frequencyInput: {
    borderWidth: 2,
    borderRadius: 6,
    width: 55,
    borderColor: theme.colorLightGrey,
    textAlign: "center",
    fontWeight: "600",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
