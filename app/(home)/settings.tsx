import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useUserStore } from "../../store/userStore";
import { useRouter } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";
import { theme } from "@/themes";
import { useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format, set } from "date-fns";

export default function Settings() {
  const router = useRouter();
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
  const resetNotifications = useNotificationStore(
    (state) => state.resetNotifications
  );
  const isNotificationOn = useNotificationStore(
    (state) => state.isNotificationOn
  );
  const toggleIsNotificationOn = useNotificationStore(
    (state) => state.toggleIsNotificatinoOn
  );
  const timeOfDay = useNotificationStore((state) => state.timeOfDay);
  const changeTimeOfDay = useNotificationStore(
    (state) => state.changeTimeOfDay
  );
  const [time, setTime] = useState<Date>(
    set(new Date(), { hours: timeOfDay.hours, minutes: timeOfDay.minutes })
  );
  const [timePickerVisible, setTimePickerVisible] = useState<boolean>(false);

  const handlePress = () => {
    toggleHasOnboarded();
    router.replace("/onboarding");
  };

  const handleNotificationTime = () => {
    setTimePickerVisible(true);
  };

  const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setTimePickerVisible(false);
    if (selectedDate) {
      setTime(selectedDate);
      changeTimeOfDay(selectedDate);
    }
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
      <View>
        <View style={styles.row}>
          <Text>Notifications </Text>
          <Pressable
            style={styles.notificationButton}
            onPress={toggleIsNotificationOn}
          >
            <Text style={styles.NotificationText}>
              {isNotificationOn ? "On" : "Off"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          <Text>Notification Time</Text>
          <Pressable
            style={styles.notificationButton}
            onPress={handleNotificationTime}
          >
            <Text style={styles.NotificationText}>{`${format(
              time,
              "hh"
            )}:${format(time, "mm aaa")}`}</Text>
          </Pressable>
        </View>
      </View>
      {timePickerVisible ? (
        <DateTimePicker value={time} mode="time" onChange={onChangeTime} />
      ) : undefined}

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
  notificationButton: {
    width: 120,
    borderWidth: 2,
    borderColor: theme.colorLightGrey,
    borderRadius: 6,
    padding: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    alignItems: "center",
    paddingVertical: 8,
  },
  NotificationText: {
    textAlign: "center",
  },
});
