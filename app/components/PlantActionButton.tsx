import { ColorValue, Pressable, Text, StyleSheet } from "react-native";
import { theme } from "@/themes";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type PlantActionButtonType = {
  title?: string;
  onPress: () => void;
  buttonWidth?: number;
  color?: [ColorValue, ColorValue, ...ColorValue[]];
  icon?: "water-check";
  darkMode?: boolean;
};

export default function PlantActionButton({
  title,
  onPress,
  buttonWidth,
  color,
  icon,
  darkMode,
}: PlantActionButtonType) {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={color ? color : [theme.colorGreen, theme.colorApple]}
      style={[styles.container, { width: buttonWidth ? buttonWidth : 200 }]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => {
          if (pressed) {
            return [styles.button, styles.buttonPressed];
          }
          return styles.button;
        }}
      >
        {icon ? (
          <MaterialCommunityIcons
            name="water-check"
            size={32}
            color={theme.colorWhite}
          />
        ) : undefined}
        {title ? (
          <Text style={[styles.text, darkMode ? styles.textDark : undefined]}>
            {title}
          </Text>
        ) : undefined}
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    height: 50,
    elevation: 3,
    shadowColor: theme.colorBlack,
  },
  text: {
    color: theme.colorWhite,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  textDark: {
    color: theme.colorGrey,
  },
  button: {
    borderRadius: 6,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    backgroundColor: theme.colorDarkGreen,
  },
});
