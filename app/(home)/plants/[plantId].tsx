import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, Alert } from "react-native";
import PlantImagePicker from "@/app/components/PlantImagePicker";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import PlantActionButton from "@/app/components/PlantActionButton";
import { theme } from "@/themes";
import { PlantType, usePlantStore } from "@/store/plantStore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";
import NameInput from "@/app/components/NameInput";
import FrequencyInput from "@/app/components/FrequencyInput";
import DateInput from "@/app/components/DateInput";
import LastWateredInput from "@/app/components/LastWateredInput";

export default function PlantEdit() {
  const router = useRouter();
  const navigation = useNavigation();

  const plantId = useLocalSearchParams().plantId;
  const plant = usePlantStore((store) =>
    store.plants.find((plant) => plant.id === plantId)
  );
  const editPlant = usePlantStore((store) => store.editPlant);
  const removePlant = usePlantStore((store) => store.removePlant);

  const updateNotification = useNotificationStore(
    (store) => store.updateNotifications
  );
  const deleteNotification = useNotificationStore(
    (store) => store.deleteNotification
  );

  const [cameraStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | undefined>(plant?.imageUri);
  const [plantName, setPlantName] = useState<string | undefined>(plant?.name);
  const [frequencyDays, setFrequenceDays] = useState<string | undefined>(
    plant?.wateringFrequencyDays.toString()
  );
  // const [date, setDate] = useState<Date | undefined>(
  //   plant ? new Date(plant.nextWateredAtTimestamp) : undefined
  // );
  // const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [lastWatered, setLastWatered] = useState<number | undefined>(
    plant ? plant.lastWateredAtTimestamp : undefined
  );
  let prevLastWatered: number | undefined = plant?.prevLastWateredAtTimestamp;

  useEffect(() => {
    navigation.setOptions({
      title: `Edit ${plant?.name}`,
    });
  }, [plant?.name, navigation]);

  const handleChooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUseCamera = async () => {
    try {
      if (!cameraStatus?.granted) {
        const permission = await requestCameraPermission();
        if (!permission.granted) {
          Alert.alert("Permission is required to access camera.");
          return;
        }
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        "Unable to use camera",
        "Permission is required to access camera"
      );
    }
  };

  // const openDatePicker = () => {
  //   setDatePickerVisible(true);
  // };

  // const onChangeDate = (
  //   event: DateTimePickerEvent,
  //   selectedDate: Date | undefined
  // ) => {
  //   setDate(selectedDate ?? new Date(Date.now()));
  //   setDatePickerVisible(false);
  // };

  const handleEditPlant = () => {
    if (!plantName) {
      return Alert.alert("Please enter a name", "Give your plant a nickname!");
    }
    if (!frequencyDays) {
      return Alert.alert(
        "Please enter a watering frequency",
        `How often does ${
          plantName ? plantName : "your plant"
        } need to be watered?`
      );
    }
    if (
      Number.isNaN(Number(frequencyDays)) ||
      !Number.isInteger(Number(frequencyDays))
    ) {
      return Alert.alert(
        "Please re-enter watering frequency",
        "Watering frequency must be a whole number"
      );
    }
    // if (!date) {
    //   return Alert.alert(
    //     "Please enter a watering date",
    //     `When is the next time ${
    //       plantName ? plantName : "your plant?"
    //     } needs to be watered?`
    //   );
    // }
    // const endOfToday = new Date().setHours(23, 59, 59, 999);
    // if (date.getTime() < endOfToday) {
    //   return Alert.alert(
    //     "Please re-enter the watering date",
    //     `${date.toLocaleDateString()} is invalid. The next watering date must start on a future date`
    //   );
    // }

    if (!plant) {
      Alert.alert("Unable to update plant info", "Please try again");
      router.back();
      return;
    }

    const editedPlant: PlantType = {
      id: plant.id,
      name: plantName,
      wateringFrequencyDays: Number(frequencyDays),
      nextWateredAtTimestamp: plant.nextWateredAtTimestamp,
      lastWateredAtTimestamp: lastWatered,
      prevLastWateredAtTimestamp: prevLastWatered,
      imageUri: imageUri,
    };

    const prevNextWaterAtTimestamp = plant?.nextWateredAtTimestamp;
    if (prevNextWaterAtTimestamp && editedPlant.nextWateredAtTimestamp) {
      updateNotification(
        editedPlant.id,
        prevNextWaterAtTimestamp,
        editedPlant.nextWateredAtTimestamp
      );
    }
    editPlant(editedPlant);
    router.back();
  };

  const handleLastWateredDate = () => {
    if (!lastWatered) {
      return;
    }
    return Alert.alert(
      "Revert to previous last watered date?",
      "Last watered date will be updated upon saving",
      [
        {
          text: "Yes",
          onPress: () => {
            setLastWatered(prevLastWatered);
            prevLastWatered = undefined;
          },
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!plant?.id) {
      return;
    }
    Alert.alert("Delete plant?", "This plant will be permanently removed", [
      {
        text: "Yes",
        onPress: () => {
          deleteNotification(plant.id, plant.nextWateredAtTimestamp);
          removePlant(plant.id);
          router.back();
        },
        style: "destructive",
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  if (!plant) {
    return (
      <View style={styles.notFoundContainer}>
        <Text>Plant with ID {plantId} not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <PlantImagePicker
        imageUri={imageUri}
        onPressImage={handleChooseImage}
        onPressCamera={handleUseCamera}
      />
      <View style={styles.inputContainer}>
        <NameInput plantName={plantName} onChangeText={setPlantName} />
        <FrequencyInput
          frequencyDays={frequencyDays}
          onChangeText={setFrequenceDays}
        />
        {/* <DateInput date={date} onPress={openDatePicker} type="edit" /> */}
        <LastWateredInput
          lastWatered={lastWatered}
          onPress={handleLastWateredDate}
        />
      </View>
      <PlantActionButton title="Save" onPress={handleEditPlant} />
      <View style={styles.spacer}></View>
      <PlantActionButton
        title="Delete"
        onPress={handleDelete}
        darkMode
        color={[theme.colorLightGrey, theme.colorLightGrey]}
      />
      {/* {datePickerVisible ? (
        <DateTimePicker
          value={date ?? new Date(Date.now())}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      ) : undefined} */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    alignItems: "center",
    padding: 12,
    paddingBottom: 100,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorWhite,
  },
  camera: {
    marginVertical: 16,
  },
  inputContainer: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  text: {
    fontSize: 16,
  },
  spacer: {
    height: 6,
  },
});
