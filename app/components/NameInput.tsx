import { View, StyleSheet, TextInput } from "react-native";
import { theme } from "@/themes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dispatch, SetStateAction } from "react";
import { useWindowDimensions } from "react-native";

type NameInputType = {
  plantName?: string;
  onChangeText: Dispatch<SetStateAction<string | undefined>>;
};

export default function NameInput({ plantName, onChangeText }: NameInputType) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.inputRow]}>
      <Ionicons
        name={plantName ? "leaf" : "leaf-outline"}
        size={24}
        color={theme.colorGreen}
      />
      <TextInput
        style={[styles.nameInput, styles.text]}
        placeholder="Name"
        value={plantName}
        onChangeText={onChangeText}
        autoCapitalize="words"
      ></TextInput>
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
  nameInput: {
    borderWidth: 2,
    borderRadius: 6,
    borderColor: theme.colorLightGrey,
    fontWeight: "600",
    paddingLeft: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    width: "87%",
  },
});
