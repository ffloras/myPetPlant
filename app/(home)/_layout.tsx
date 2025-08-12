import { Redirect, Stack } from "expo-router";
import { useUserStore } from "../../store/userStore";
import { View } from "react-native";
import HeaderIcon from "../components/HeaderIcon";
import { useRouter } from "expo-router";
import { useSearchStore } from "@/store/searchStore";

export default function Layout() {
  const router = useRouter();
  const hasFinishedOnboarding = useUserStore(
    (state) => state.hasFinishedOnboarding
  );
  const searchOpened = useSearchStore((store) => store.searchOpened);
  const toggleSearch = useSearchStore((store) => store.toggleSearch);

  if (!hasFinishedOnboarding) {
    return <Redirect href={"/onboarding"} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "My Pet Plant",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
            >
              <HeaderIcon
                icon={searchOpened ? "close" : "search1"}
                onPress={toggleSearch}
              />
              <HeaderIcon
                icon="pluscircleo"
                onPress={() => router.navigate("/newPlant")}
              />
              <HeaderIcon
                icon="setting"
                onPress={() => router.navigate("/settings")}
              />
            </View>
          ),
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="newPlant"
        options={{
          title: "Add a new plant",
          presentation: "modal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          presentation: "modal",
          animation: "fade",
        }}
      />
      <Stack.Screen name="plants/[plantId]" options={{ title: "" }} />
    </Stack>
  );
}
