import { PlantType, usePlantStore } from "@/store/plantStore";
import { View, StyleSheet, Text, Pressable, Alert } from "react-native";
import { differenceInDays, format } from "date-fns";
import { theme } from "@/themes";
import PlantActionButton from "./PlantActionButton";
import PlantImage from "./PlantImage";
import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import PlantCardNotes from "./PlantCardNotes";

type WateringStateType = {
  status: "green" | "alert" | "danger";
  message: React.ReactNode;
};

export default function PlantCard({ plant }: { plant: PlantType }) {
  const waterPlant = usePlantStore((store) => store.waterPlant);
  const updateNotification = useNotificationStore(
    (store) => store.updateNotifications
  );
  const [wateringState, setWateringState] = useState<WateringStateType>();
  const editNextWateredAtTimestamp = usePlantStore(
    (store) => store.editNextWateredAtTimestamp
  );
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [notesVisible, setNotesVisible] = useState<boolean>(false);

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (!selectedDate) {
      return;
    }
    const endOfToday = new Date().setHours(23, 59, 59, 999);
    // if (selectedDate.getTime() < endOfToday) {
    //   Alert.alert(
    //     "Please re-enter the watering date",
    //     `${selectedDate.toLocaleDateString()} is invalid. The next watering date must start on a future date`
    //   );
    //   setDatePickerVisible(false);
    //   return;
    // }
    const prevNextWateredAtTimestamp = plant.nextWateredAtTimestamp;
    const newNextWateredAtTimestamp = selectedDate.getTime();
    updateNotification(
      plant.id,
      prevNextWateredAtTimestamp,
      newNextWateredAtTimestamp
    );
    editNextWateredAtTimestamp(plant.id, newNextWateredAtTimestamp);

    setDatePickerVisible(false);
  };

  const getWateringState = (nextWatering: number): WateringStateType => {
    const endOfToday = new Date().setHours(23, 59, 59, 999);
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    if (nextWatering > endOfToday) {
      return {
        status: "green",
        message: (
          <View style={styles.headingTextContainer}>
            <Text style={styles.headingText}>Water on</Text>
            <Pressable hitSlop={20} onPress={() => setDatePickerVisible(true)}>
              <Text style={[styles.headingText, styles.dateText]}>
                {format(nextWatering, "eee MMM d")}
              </Text>
            </Pressable>
          </View>
        ),
      };
    } else if (nextWatering > startOfToday) {
      return {
        status: "alert",
        message: (
          <View style={styles.headingTextContainer}>
            <Text style={styles.headingText}>Water</Text>
            <Pressable hitSlop={20} onPress={() => setDatePickerVisible(true)}>
              <Text style={[styles.headingText, styles.dateText]}>Today</Text>
            </Pressable>
          </View>
        ),
      };
    } else {
      const overdueDays = differenceInDays(Date.now(), nextWatering);
      return {
        status: "danger",
        message: (
          <View style={styles.headingTextContainer}>
            <Text style={styles.headingText}>Overdue for</Text>
            <Pressable hitSlop={20} onPress={() => setDatePickerVisible(true)}>
              <Text
                style={[styles.headingText, styles.dateText, styles.dangerText]}
              >
                {overdueDays} day{overdueDays > 1 ? "s" : ""}
              </Text>
            </Pressable>
          </View>
        ),
      };
    }
  };

  const handleOpenNotes = () => {
    setNotesVisible(true);
  };

  const handleCloseNotes = () => {
    setNotesVisible(false);
  };

  const handleWaterPlantPressed = () => {
    const msInDay = 24 * 60 * 60 * 1000;
    const prevNextWaterAtTimestamp = plant.nextWateredAtTimestamp;

    const currentNextWateredAtTimestamp =
      Date.now() + plant.wateringFrequencyDays * msInDay;

    updateNotification(
      plant.id,
      prevNextWaterAtTimestamp,
      currentNextWateredAtTimestamp
    );

    console.log(
      prevNextWaterAtTimestamp,
      currentNextWateredAtTimestamp,
      plant.wateringFrequencyDays
    );
    waterPlant(plant.id);
  };

  useEffect(() => {
    setWateringState(getWateringState(plant.nextWateredAtTimestamp));
  }, [plant]);

  return (
    <View
      style={[
        styles.container,
        wateringState?.status === "green" ? styles.greenContainer : undefined,
        wateringState?.status === "alert" ? styles.alertContainer : undefined,
        wateringState?.status === "danger" ? styles.dangerContainer : undefined,
      ]}
    >
      <View
        style={[
          styles.headingContainer,
          wateringState?.status === "green" ? styles.greenHeading : undefined,
          wateringState?.status === "alert" ? styles.alertHeading : undefined,
          wateringState?.status === "danger" ? styles.dangerHeading : undefined,
        ]}
      >
        {wateringState?.message}

        <PlantActionButton
          icon="water-check"
          onPress={handleWaterPlantPressed}
          buttonWidth={50}
        />
      </View>
      <Link href={`plants/${plant.id}`} asChild>
        <Pressable>
          <View style={styles.bodyContainer}>
            <PlantImage imageUri={plant.imageUri} size={140} />
            <View style={styles.infoContainer}>
              <Text style={styles.nameText} numberOfLines={1}>
                {plant.name}
              </Text>
              <Text style={styles.infoText}>
                Water every {plant.wateringFrequencyDays} days
              </Text>
              <Text style={styles.infoText}>
                Last watered:
                {plant.lastWateredAtTimestamp
                  ? ` ${format(plant.lastWateredAtTimestamp, "eee MMM d")}`
                  : " N/A"}
              </Text>
            </View>
          </View>
          {notesVisible ? (
            <PlantCardNotes notes={plant.notes} onPress={handleCloseNotes} />
          ) : undefined}
        </Pressable>
      </Link>
      {datePickerVisible ? (
        <DateTimePicker
          value={new Date(plant.nextWateredAtTimestamp) ?? new Date(Date.now())}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      ) : undefined}
      {notesVisible ? undefined : (
        <Pressable style={styles.downIcon} onPress={handleOpenNotes}>
          <AntDesign name="circledowno" size={24} color={theme.colorGreen} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 6,
    marginTop: 12,
    backgroundColor: theme.colorWhite,
    shadowColor: theme.colorBlack,
    elevation: 3,
    position: "relative",
  },
  greenContainer: {
    borderColor: theme.colorPaleGreen,
  },
  alertContainer: {
    borderColor: theme.colorAlert,
  },
  dangerContainer: {
    borderColor: theme.colorDanger,
  },
  dangerText: {
    color: theme.colorDarkGreen,
  },
  headingContainer: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: "row",
    padding: 4,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headingTextContainer: {
    flexDirection: "row",
    gap: 6,
  },
  greenHeading: {
    backgroundColor: theme.colorPaleGreen,
  },
  alertHeading: {
    backgroundColor: theme.colorAlert,
  },
  dangerHeading: {
    backgroundColor: theme.colorDanger,
  },
  headingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colorDarkGreen,
  },
  dateText: {
    color: theme.colorGreen,
    textDecorationLine: "underline",
  },
  bodyContainer: {
    flexDirection: "row",
  },
  infoContainer: {
    paddingHorizontal: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    flex: 1,
    paddingBottom: 16,
  },
  nameText: {
    fontSize: 18,
    color: theme.colorBlack,
    width: "90%",
  },
  infoText: {
    borderColor: theme.colorBlack,
    flexWrap: "wrap",
    width: "100%",
    fontSize: 13,
    color: theme.colorGrey,
  },
  downIconContainer: {
    alignItems: "flex-end",
    height: 30,
  },
  downIcon: {
    padding: 10,
    justifyContent: "center",
    alignItems: "flex-end",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
