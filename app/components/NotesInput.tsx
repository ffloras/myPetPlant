import { View, StyleSheet, TextInput } from "react-native";
import { theme } from "@/themes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useWindowDimensions } from "react-native";

type NotesInputType = {
  note?: string;
  onChangeText: (value: string) => void | undefined;
};

export default function NotesInput({ note, onChangeText }: NotesInputType) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.inputRow}>
      <Ionicons
        name={note ? "leaf" : "leaf-outline"}
        size={24}
        color={theme.colorGreen}
      />
      <TextInput
        style={[styles.notesInput, styles.text, { width: width / 1.58 }]}
        placeholder="About my plant"
        value={note}
        multiline
        submitBehavior="blurAndSubmit"
        onChangeText={onChangeText}
        autoCapitalize="sentences"
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
  notesInput: {
    borderWidth: 2,
    borderRadius: 6,
    borderColor: theme.colorLightGrey,
    fontWeight: "600",
    paddingLeft: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
