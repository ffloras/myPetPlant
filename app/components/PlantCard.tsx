import { PlantType, usePlantStore } from "@/store/plantStore";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { differenceInDays, format } from "date-fns";
import { theme } from "@/themes";
import PlantActionButton from "./PlantActionButton";
import PlantImage from "./PlantImage";
import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";

type WateringStateType = {
  status: "green" | "alert" | "danger";
  message: string;
};

export default function PlantCard({ plant }: { plant: PlantType }) {
  const waterPlant = usePlantStore((store) => store.waterPlant);
  const updateNotification = useNotificationStore(
    (store) => store.updateNotifications
  );
  const [wateringState, setWateringState] = useState<WateringStateType>();

  const getWateringState = (nextWatering: number): WateringStateType => {
    const endOfToday = new Date().setHours(23, 59, 59, 999);
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    if (nextWatering > endOfToday) {
      return {
        status: "green",
        message: `Water on ${format(nextWatering, "eee MMM d")}`,
      };
    } else if (nextWatering > startOfToday) {
      return { status: "alert", message: "Water today!" };
    } else {
      const overdueDays = differenceInDays(Date.now(), nextWatering) + 1;
      return {
        status: "danger",
        message: `Overdue for ${overdueDays} day${overdueDays > 1 ? "s" : ""}`,
      };
    }
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
        <Text style={styles.dateText}>{wateringState?.message}</Text>
        <PlantActionButton
          icon="check"
          onPress={handleWaterPlantPressed}
          buttonWidth={50}
        />
      </View>
      <Link href={`plants/${plant.id}`} asChild>
        <Pressable style={styles.bodyContainer}>
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
        </Pressable>
      </Link>
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
  headingContainer: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: "row",
    padding: 4,
    justifyContent: "space-between",
    alignItems: "center",
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
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colorDarkGreen,
  },
  bodyContainer: {
    flexDirection: "row",
  },
  infoContainer: {
    paddingHorizontal: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    flex: 1,
    paddingBottom: 8,
  },
  nameText: {
    fontSize: 18,
    color: theme.colorBlack,
  },
  infoText: {
    borderColor: theme.colorBlack,
    flexWrap: "wrap",
    width: "100%",
    fontSize: 13,
    color: theme.colorGrey,
  },
});
