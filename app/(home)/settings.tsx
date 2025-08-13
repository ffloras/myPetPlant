import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { useUserStore } from "../../store/userStore";
import { useRouter } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";

export default function Settings() {
  const router = useRouter();
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
  const resetNotifications = useNotificationStore(
    (state) => state.resetNotifications
  );

  const handlePress = () => {
    toggleHasOnboarded();
    router.replace("/onboarding");
  };

  const handleResetNotification = () => {
    Alert.alert("Resetting notification?", "", [
      {
        text: "Yes",
        onPress: () => {
          resetNotifications();
        },
        style: "destructive",
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <Pressable onPress={handlePress}>
        <Text>back to Onboarding</Text>
      </Pressable>
      <Pressable onPress={handleResetNotification}>
        <Text>Reset notification</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
