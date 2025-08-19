import { Pressable, View, Text, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { theme } from "@/themes";
import Ionicons from "@expo/vector-icons/Ionicons";

type PlantCardNoteType = {
  notes?: (string | undefined)[];
  onPress: () => void;
};

export default function PlantCardNotes({ notes, onPress }: PlantCardNoteType) {
  return (
    <View style={styles.container}>
      <Text>Notes</Text>
      {!notes || notes.length === 0 ? (
        <Text style={styles.noteText}>No notes available</Text>
      ) : (
        notes.map((note, index) => (
          <View style={styles.noteRow} key={index}>
            <Ionicons name="leaf-outline" size={20} color={theme.colorGreen} />
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ))
      )}
      <Pressable style={styles.upIcon} onPress={onPress}>
        <AntDesign name="upcircleo" size={24} color={theme.colorGreen} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
  },
  upIcon: {
    padding: 10,
    justifyContent: "center",
    alignItems: "flex-end",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  noteRow: {
    flexDirection: "row",
    paddingLeft: 4,
    gap: 4,
    paddingTop: 4,
  },
  noteText: {
    color: theme.colorGrey,
    fontSize: 13,
    marginRight: 56,
  },
});
