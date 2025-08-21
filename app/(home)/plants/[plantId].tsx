import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Alert,
  Keyboard,
} from "react-native";
import PlantImagePicker from "@/components/PlantImagePicker";
import * as ImagePicker from "expo-image-picker";
import PlantActionButton from "@/components/PlantActionButton";
import { theme } from "@/themes";
import { PlantType, usePlantStore } from "@/store/plantStore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";
import NameInput from "@/components/NameInput";
import FrequencyInput from "@/components/FrequencyInput";
import LastWateredInput from "@/components/LastWateredInput";
import HeaderIcon from "@/components/HeaderIcon";
import NotesInput from "@/components/NotesInput";

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
  const [lastWatered, setLastWatered] = useState<number | undefined>(
    plant ? plant.lastWateredAtTimestamp : undefined
  );
  let prevLastWatered: number | undefined = plant?.prevLastWateredAtTimestamp;
  const [notes, setNotes] = useState<(string | undefined)[]>(
    plant?.notes ?? [undefined]
  );

  useEffect(() => {
    navigation.setOptions({
      title: `Edit ${plant?.name}`,
    });
  }, [plant?.name, navigation]);

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

    if (!plant) {
      Alert.alert("Unable to update plant info", "Please try again");
      router.back();
      return;
    }

    let newNotes = notes.filter((note) => note);
    if (newNotes.length === 0) {
      newNotes = [undefined];
    }

    const editedPlant: PlantType = {
      id: plant.id,
      name: plantName,
      wateringFrequencyDays: Number(frequencyDays),
      nextWateredAtTimestamp: plant.nextWateredAtTimestamp,
      lastWateredAtTimestamp: lastWatered,
      prevLastWateredAtTimestamp: prevLastWatered,
      imageUri: imageUri,
      notes: newNotes,
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
        <Text style={styles.infoHeading}>My Plant Info</Text>
        <NameInput plantName={plantName} onChangeText={setPlantName} />
        <FrequencyInput
          frequencyDays={frequencyDays}
          onChangeText={setFrequenceDays}
        />
        <LastWateredInput
          lastWatered={lastWatered}
          onPress={handleLastWateredDate}
        />
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
      <PlantActionButton title="Save" onPress={handleEditPlant} />
      <View style={styles.spacer}></View>
      <PlantActionButton
        title="Delete"
        onPress={handleDelete}
        darkMode
        color={[theme.colorLightGrey, theme.colorLightGrey]}
      />
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
  infoHeading: {
    textAlign: "left",
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 20,
    paddingBottom: 10,
    color: theme.colorGreen,
  },
  camera: {
    marginVertical: 16,
  },
  inputContainer: {
    alignItems: "flex-start",
    paddingBottom: 20,
    width: "80%",
  },
  spacer: {
    height: 6,
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
