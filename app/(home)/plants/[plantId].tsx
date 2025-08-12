import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Alert,
  TextInput,
} from "react-native";
import uuid from "react-native-uuid";
import PlantImagePicker from "@/app/components/PlantImagePicker";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import PlantActionButton from "@/app/components/PlantActionButton";
import { theme } from "@/themes";
import { PlantType, usePlantStore } from "@/store/plantStore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { format } from "date-fns";

export default function PlantEdit() {
  const plantId = useLocalSearchParams().plantId;
  const plant = usePlantStore((store) =>
    store.plants.find((plant) => plant.id === plantId)
  );

  const editPlant = usePlantStore((store) => store.editPlant);
  const removePlant = usePlantStore((store) => store.removePlant);

  const [cameraStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | undefined>(plant?.imageUri);
  const [plantName, setPlantName] = useState<string>(plant?.name ?? "");
  const [frequencyDays, setFrequenceDays] = useState<string | undefined>(
    plant?.wateringFrequencyDays.toString()
  );
  const [date, setDate] = useState<Date | undefined>(
    plant ? new Date(plant.nextWateredAtTimestamp) : undefined
  );
  const [lastWatered, setLastWatered] = useState<number | undefined>(
    plant ? plant.lastWateredAtTimestamp : undefined
  );
  const [prevLastWatered, setPrevLastWatered] = useState<number | undefined>(
    plant ? plant.prevLastWateredAtTimestamp : undefined
  );
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const router = useRouter();
  const navigation = useNavigation();

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

  const openDatePicker = () => {
    setDatePickerVisible(true);
  };

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    setDate(selectedDate ?? new Date(Date.now()));
    setDatePickerVisible(false);
  };

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
    if (!date) {
      return Alert.alert(
        "Please enter a watering date",
        `When is the next time ${
          plantName ? plantName : "your plant?"
        } needs to be watered?`
      );
    }
    const endOfToday = new Date().setHours(23, 59, 59, 999);
    if (date.getTime() < endOfToday) {
      return Alert.alert(
        "Please re-enter the watering date",
        `${date.toLocaleDateString()} is invalid. The next watering date must start on a future date`
      );
    }

    const editedPlant: PlantType = {
      id: plant?.id ?? (plantId as string),
      name: plantName,
      wateringFrequencyDays: Number(frequencyDays),
      nextWateredAtTimestamp: date.getTime(),
      lastWateredAtTimestamp: lastWatered,
      prevLastWateredAtTimestamp: prevLastWatered,
      imageUri: imageUri,
    };

    editPlant(editedPlant);
    router.back();
  };

  const handleRevertLastWateredDate = () => {
    if (!lastWatered) {
      return;
    }
    if (!prevLastWatered) {
      return Alert.alert(
        "Remove last watered date?",
        "Last watered date will be permanently removed upon saving",
        [
          {
            text: "Yes",
            onPress: () => {
              setLastWatered(undefined);
            },
            style: "destructive",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
    return Alert.alert(
      "Revert Last watered date to previous date?",
      "Last watered date will be updated upon saving",
      [
        {
          text: "Yes",
          onPress: () => {
            setLastWatered(prevLastWatered);
            setPrevLastWatered(undefined);
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
          removePlant(plant.id);
          router.navigate("/");
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
        <View style={styles.inputRow}>
          <Ionicons
            name={plantName ? "leaf" : "leaf-outline"}
            size={24}
            color={theme.colorGreen}
          />
          <TextInput
            style={[styles.nameInput, styles.text]}
            placeholder="Name"
            value={plantName}
            onChangeText={setPlantName}
            autoCapitalize="words"
          ></TextInput>
        </View>
        <View style={styles.inputRow}>
          <Ionicons
            name={frequencyDays ? "leaf" : "leaf-outline"}
            size={24}
            color={theme.colorGreen}
          />
          <Text style={styles.text}>Water every</Text>
          <TextInput
            value={frequencyDays}
            style={[styles.daysInput, styles.text]}
            keyboardType="number-pad"
            onChangeText={setFrequenceDays}
          ></TextInput>
          <Text style={styles.text}>days</Text>
        </View>
        <View style={styles.inputRow}>
          <Ionicons
            name={date ? "leaf" : "leaf-outline"}
            size={24}
            color={theme.colorGreen}
          />
          <Text style={styles.text}>Water on</Text>
          <Pressable style={styles.dateButton} onPress={openDatePicker}>
            <Text style={[styles.text, styles.dateText]}>
              {date ? format(date, "eee MMM d") : "Select Date"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.inputRow}>
          <Ionicons
            name={date ? "leaf" : "leaf-outline"}
            size={24}
            color={theme.colorGreen}
          />
          <Text style={styles.text}>Last Watered</Text>
          <Pressable
            style={styles.dateButton}
            onPress={handleRevertLastWateredDate}
          >
            <Text style={[styles.text, styles.dateText]}>
              {lastWatered ? format(lastWatered, "eee MMM d") : "N/A"}
            </Text>
          </Pressable>
        </View>
      </View>
      <PlantActionButton title="Save" onPress={handleEditPlant} />
      <View style={styles.spacer}></View>
      <PlantActionButton
        title="Delete"
        onPress={handleDelete}
        color={[theme.colorLightGrey, theme.colorLightGrey]}
      />
      {datePickerVisible ? (
        <DateTimePicker
          value={date ?? new Date(Date.now())}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      ) : undefined}
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
  inputRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "12",
    paddingVertical: 10,
  },
  nameInput: {
    borderWidth: 2,
    borderRadius: 6,
    width: 220,
    borderColor: theme.colorLightGrey,
  },
  daysInput: {
    borderWidth: 2,
    borderRadius: 6,
    width: 50,
    borderColor: theme.colorLightGrey,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
  },
  dateButton: {
    paddingVertical: 10,
  },
  dateText: {
    textDecorationLine: "underline",
    fontWeight: "bold",
    color: theme.colorDarkGreen,
  },
  spacer: {
    height: 5,
  },
});
