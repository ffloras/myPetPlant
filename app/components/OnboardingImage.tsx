import { Image, useWindowDimensions, ImageSourcePropType } from "react-native";

type Props = {
  size?: number;
  name:
    | "onboarding1Main"
    | "onboarding2Main"
    | "calendarImg"
    | "notifications"
    | "arrow"
    | "leavesFull"
    | "leavesHalf";
  imgWidth: number;
  imgHeight: number;
};

const images = {
  onboarding1Main: require("@/assets/onboarding1Main.png"),
  onboarding2Main: require("@/assets/onboarding2Main.png"),
  calendarImg: require("@/assets/calendarImg.png"),
  arrow: require("@/assets/arrow.png"),
  notifications: require("@/assets/notifications.png"),
  leavesFull: require("@/assets/leavesFull.png"),
  leavesHalf: require("@/assets/leavesHalf.png"),
};

export default function OnboardingImage({
  size,
  name,
  imgWidth,
  imgHeight,
}: Props) {
  const { width } = useWindowDimensions();

  const imageSize = size ?? Math.min(width / 1.3, 400);

  const aspectRatio = imgWidth / imgHeight;

  return (
    <Image
      source={images[name]}
      style={{
        width: imageSize,
        height: "auto",
        aspectRatio: aspectRatio,
      }}
    />
  );
}
