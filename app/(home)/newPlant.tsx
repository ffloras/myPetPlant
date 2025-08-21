import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Text,
  Keyboard,
} from "react-native";
import uuid from "react-native-uuid";
import PlantImagePicker from "../../components/PlantImagePicker";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import PlantActionButton from "../../components/PlantActionButton";
import { PlantType, usePlantStore } from "@/store/plantStore";
import { useRouter } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";
import NameInput from "../../components/NameInput";
import FrequencyInput from "../../components/FrequencyInput";
import DateInput from "../../components/DateInput";
import { theme } from "@/themes";
import NotesInput from "../../components/NotesInput";
import HeaderIcon from "../../components/HeaderIcon";

export default function NewPlant() {
  const addPlant = usePlantStore((store) => store.addPlant);
  const addNotification = useNotificationStore(
    (store) => store.addNotification
  );
  const [cameraStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [imageUri, setImageUri] = useState<string>();
  const [plantName, setPlantName] = useState<string>();
  const [frequencyDays, setFrequenceDays] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [notes, setNotes] = useState<(string | undefined)[]>([undefined]);
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const router = useRouter();

  const handleChangeNotes = (value: string, noteNumber: number) => {
    setNotes((prev) => {
      if (noteNumber < prev.length) {
        let newNotes = [...prev];
        newNotes[noteNumber] = value;
        return newNotes;
      }
      return prev;
    });
  };

  const handleAddNote = () => {
    Keyboard.dismiss();
    setNotes((prev) => [...prev, undefined]);
  };

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

  const handleAddPlant = () => {
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

    const plantId = uuid.v4();
    let newNotes = notes.filter((note) => note);
    if (newNotes.length === 0) {
      newNotes = [undefined];
    }

    const newPlant: PlantType = {
      id: plantId,
      name: plantName,
      wateringFrequencyDays: Number(frequencyDays),
      nextWateredAtTimestamp: date.getTime(),
      imageUri: imageUri,
      notes: newNotes,
    };

    addPlant(newPlant);
    addNotification(plantId, newPlant.nextWateredAtTimestamp);
    router.back();
  };

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
        <Text style={styles.infoHeading}>My Plant Info</Text>
        <NameInput plantName={plantName} onChangeText={setPlantName} />
        <FrequencyInput
          frequencyDays={frequencyDays}
          onChangeText={setFrequenceDays}
        />
        <DateInput date={date} onPress={openDatePicker} />
      </View>

      <View style={[styles.inputContainer, styles.notesBodyContainer]}>
        <View style={styles.notesHeadingContainer}>
          <Text style={styles.notesHeading}>Notes</Text>
          <HeaderIcon icon="pluscircleo" onPress={handleAddNote} />
        </View>
        {notes.map((note, index) => (
          <NotesInput
            note={note}
            onChangeText={(value) => handleChangeNotes(value, index)}
            key={index}
          />
        ))}
      </View>
      <PlantActionButton title="Add Plant" onPress={handleAddPlant} />
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
  camera: {
    marginVertical: 16,
  },
  inputContainer: {
    alignItems: "flex-start",
    paddingBottom: 20,
    width: "80%",
  },
  infoHeading: {
    textAlign: "left",
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 20,
    paddingBottom: 10,
    color: theme.colorGreen,
  },
  notesHeadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  notesBodyContainer: {
    paddingBottom: 50,
  },
  notesHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colorGreen,
  },
});
