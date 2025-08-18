import { theme } from "@/themes";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { useSearchStore } from "@/store/searchStore";

type SearchBarProp = {
  visible: boolean;
  searchValue: string | undefined;
  setSearchValue: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export default function SearchBar({
  visible,
  searchValue,
  setSearchValue,
}: SearchBarProp) {
  return (
    <View style={[styles.container, { display: visible ? "flex" : "none" }]}>
      <TextInput
        value={searchValue}
        onChangeText={(value) => setSearchValue(value)}
        style={styles.textInput}
        placeholder="Search your plant collection"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    marginBottom: -6,
  },
  textInput: {
    borderWidth: 2,
    borderColor: theme.colorLightGrey,
    backgroundColor: theme.colorWhite,
    width: "100%",
    borderRadius: 6,
  },
});
