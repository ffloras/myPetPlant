import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { useUserStore } from "../../store/userStore";
import { Link, useRouter } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";
import { theme } from "@/themes";
import { useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format, set } from "date-fns";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
        <Text style={styles.heading}>Notifications </Text>
        <View style={styles.row}>
          <Pressable
            style={styles.notificationButton}
            onPress={toggleIsNotificationOn}
          >
            <MaterialIcons
              name={isNotificationOn ? "notifications-on" : "notifications-off"}
              size={32}
              color={isNotificationOn ? theme.colorGreen : theme.colorGrey}
            />
            <Text
              style={[
                styles.NotificationText,
                isNotificationOn ? undefined : styles.NotificationTextOff,
              ]}
            >
              {isNotificationOn ? "On" : "Off"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.notificationButton}
            onPress={handleNotificationTime}
          >
            <MaterialIcons
              name="access-time"
              size={32}
              color={theme.colorGreen}
            />
            <Text style={styles.NotificationText}>{`${format(
              time,
              "hh"
            )}:${format(time, "mm aaa")}`}</Text>
          </Pressable>
        </View>
      </View>
      <View>
        <Link style={styles.privacyPolicyContainer} href={""}>
          <Text style={styles.privacyPolicyText}>Privacy Policy</Text>
        </Link>
      </View>

      {timePickerVisible ? (
        <DateTimePicker value={time} mode="time" onChange={onChangeTime} />
      ) : undefined}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 48,
    paddingTop: 40,
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
  },
  notificationButton: {
    width: 120,
    borderWidth: 2,
    borderColor: theme.colorLightGrey,
    borderRadius: 6,
    padding: 4,
    alignItems: "center",
    gap: 4,
    height: 120,
    justifyContent: "center",
    shadowColor: theme.colorBlack,
    backgroundColor: theme.colorWhite,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  NotificationText: {
    textAlign: "center",
    fontSize: 16,
    color: theme.colorGreen,
  },
  NotificationTextOff: {
    color: theme.colorGrey,
  },
  privacyPolicyContainer: {
    marginBottom: 50,
  },
  privacyPolicyText: {
    color: theme.colorGreen,
    textDecorationLine: "underline",
  },
});
