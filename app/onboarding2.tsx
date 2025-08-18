import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { useUserStore } from "../store/userStore";
import { useRouter } from "expo-router";
import PlantImage from "./components/PlantImage";
import { theme } from "@/themes";
import OnboardingImage from "./components/OnboardingImage";
import { useWindowDimensions } from "react-native";

export default function Onboarding() {
  const router = useRouter();
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
  const { height } = useWindowDimensions();

  const handlePress = () => {
    toggleHasOnboarded();
    router.replace("/");
  };

  return (
    <Pressable
      style={[styles.container, { paddingTop: height / 8 }]}
      onPress={handlePress}
    >
      <View style={styles.topContainer}>
        <Text
          style={[
            styles.text,
            styles.headingText,
            { paddingBottom: height / 50 },
          ]}
        >
          My Pet Plant
        </Text>

        <OnboardingImage
          name="onboarding2Main"
          imgWidth={1024}
          imgHeight={1024}
        />
        <Text
          style={[
            styles.text,
            styles.descriptionText,
            { paddingTop: height / 30, paddingBottom: height / 100 },
          ]}
        >
          Recieve notifications when it's time to water your plants
        </Text>
        <OnboardingImage name="notifications" imgWidth={1024} imgHeight={250} />
      </View>

      <View style={styles.leaves}>
        <OnboardingImage
          name="leavesFull"
          imgWidth={200}
          imgHeight={100}
          size={50}
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
    justifyContent: "space-between",
  },
  topContainer: {
    alignItems: "center",
    width: "90%",
  },
  text: {
    color: theme.colorDarkGreen,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  headingText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  leaves: {
    paddingBottom: 48,
  },
});
