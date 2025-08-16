import { Pressable } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { theme } from "@/themes";

type HeaderIconType = {
  icon: "setting" | "search1" | "pluscircleo" | "close";
  onPress: () => void;
};

export default function HeaderIcon({ icon, onPress }: HeaderIconType) {
  return (
    <Pressable hitSlop={20}>
      <AntDesign
        name={icon}
        size={24}
        color={theme.colorGreen}
        onPress={onPress}
      />
    </Pressable>
  );
}
