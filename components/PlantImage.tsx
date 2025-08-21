import { Image, useWindowDimensions } from "react-native";

type ImageType = {
  size?: number;
  imageUri?: string;
};

export default function PlantImage({ size, imageUri }: ImageType) {
  const { width } = useWindowDimensions();

  const imageSize = size ?? Math.min(width / 1.5, 400);

  return (
    <Image
      source={imageUri ? { uri: imageUri } : require("@/assets/myPetPlant.png")}
      style={{
        width: imageSize,
        height: imageSize,
        borderBottomLeftRadius: 4,
      }}
    />
  );
}
