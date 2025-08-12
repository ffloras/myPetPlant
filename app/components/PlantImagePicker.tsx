import { theme } from "@/themes";
import {
  ImageBackground,
  ImageStyle,
  useWindowDimensions,
  Text,
  StyleSheet,
  Pressable,
  View,
} from "react-native";
import Foundation from "@expo/vector-icons/Foundation";

type ImageType = {
  size?: number;
  imageUri?: string;
  onPressImage: () => void;
  onPressCamera: () => void;
};

export default function PlantImagePicker({
  size,
  imageUri,
  onPressImage,
  onPressCamera,
}: ImageType) {
  const { width } = useWindowDimensions();

  const imageSize = size ?? Math.min(width / 1.5, 400);

  return (
    <View>
      <Pressable
        onPress={onPressImage}
        style={[{ width: imageSize, height: imageSize }, styles.imageContainer]}
      >
        <ImageBackground
          source={
            imageUri ? { uri: imageUri } : require("@/assets/myPetPlantBg.png")
          }
          style={styles.bgImage}
        >
          <Text style={styles.text}>{imageUri ? "" : "Upload an Image"}</Text>
        </ImageBackground>
      </Pressable>
      <Pressable style={styles.camera} onPress={onPressCamera}>
        <Foundation name="camera" size={26} color={theme.colorDarkGreen} />
        <Text style={styles.cameraText}>Use Camera</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colorLightGreen,
  },
  bgImage: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
    borderRadius: 6,
  },
  text: { fontWeight: "bold", fontSize: 16, color: theme.colorDarkGreen },
  camera: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: theme.colorPaleGreen,
    borderColor: theme.colorBlack,
  },
  cameraText: {
    color: theme.colorDarkGreen,
  },
});
