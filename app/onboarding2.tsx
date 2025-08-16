import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUserStore } from "../store/userStore";
import { useRouter } from "expo-router";
import PlantImage from "./components/PlantImage";
import { theme } from "@/themes";
import OnboardingImage from "./components/OnboardingImage";

export default function Onboarding() {
  const router = useRouter();
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);

  const handlePress = () => {
    toggleHasOnboarded();
    router.replace("/");
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Text style={[styles.text, styles.headingText]}>My Pet Plant</Text>

      <OnboardingImage
        name="onboarding2Main"
        imgWidth={1024}
        imgHeight={1024}
      />
      <Text style={[styles.text, styles.descriptionText]}>
        Recieve notifications when your plants need watering
      </Text>
      <OnboardingImage name="notifications" imgWidth={1024} imgHeight={250} />
      <View style={styles.spacer44}></View>
      <View style={styles.startButton}>
        <Text style={[styles.text, styles.subheadingText]}>Start</Text>
        <OnboardingImage
          name="arrow"
          imgWidth={150}
          imgHeight={120}
          size={40}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorPaleGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colorDarkGreen,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  headingText: {
    fontSize: 32,
    fontWeight: "bold",
    paddingBottom: 16,
  },
  subheadingText: {
    fontSize: 26,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  descriptionText: {
    fontSize: 18,
    width: "90%",
    paddingTop: 6,
    paddingBottom: 4,
    fontWeight: "bold",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spacer44: {
    height: 44,
  },
});
