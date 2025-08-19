import { create } from "zustand";
import { getHours, getMinutes, isSameDay, set } from "date-fns";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert } from "react-native";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type timeOfDayType = {
  hours: number;
  minutes: number;
};

type notificationType = {
  id?: string;
  plantIds: string[];
  triggerTimestamp: number;
};

type notificationStoreType = {
  notifications: notificationType[];
  isNotificationOn: boolean;
  timeOfDay: timeOfDayType;
  changeTimeOfDay: (newDateTime: Date) => void;
  addNotification: (plantId: string, nextWateredAtTimestamp: number) => void;
  updateNotifications: (
    plantId: string,
    prevNextWateredAtTimestamp: number,
    currentNextWateredAtTimestamp: number
  ) => void;
  resetNotifications: () => void;
  deleteNotification: (plantId: string, nextWateredAtTimestamp: number) => void;
  toggleIsNotificatinoOn: () => void;
};

export const useNotificationStore = create(
  persist<notificationStoreType>(
    (set) => ({
      notifications: [],
      isNotificationOn: true,
      timeOfDay: { hours: 7, minutes: 0 },
      changeTimeOfDay: async (newDateTime: Date) => {
        const newHour = getHours(newDateTime);
        const newMinutes = getMinutes(newDateTime);
        const notifications = useNotificationStore.getState().notifications;
        const updatedNotifications = await handleChangeNotificationTime(
          notifications,
          { hours: newHour, minutes: newMinutes }
        );
        set((state) => ({
          ...state,
          timeOfDay: { hours: newHour, minutes: newMinutes },
          notifications: updatedNotifications,
        }));
      },
      addNotification: async (
        plantId: string,
        nextWateredAtTimestamp: number
      ) => {
        const notifications = useNotificationStore.getState().notifications;
        const timeOfDay = useNotificationStore.getState().timeOfDay;
        const updatedNotifications = await handleAddNotification(
          notifications,
          nextWateredAtTimestamp,
          plantId,
          timeOfDay
        );
        set((state) => ({
          ...state,
          notifications: updatedNotifications,
        }));
      },
      updateNotifications: async (
        plantId: string,
        prevNextWateredAtTimestamp: number,
        currentNextWateredAtTimestamp: number
      ) => {
        const notifications = useNotificationStore.getState().notifications;
        const timeOfDay = useNotificationStore.getState().timeOfDay;
        const updatedNotifications = await handleEditNotifications(
          notifications,
          plantId,
          prevNextWateredAtTimestamp,
          currentNextWateredAtTimestamp,
          timeOfDay
        );
        set((state) => ({
          ...state,
          notifications: updatedNotifications,
        }));
      },
      deleteNotification: async (
        plantId: string,
        nextWateredAtTimestamp: number
      ) => {
        const notifications = useNotificationStore.getState().notifications;
        const updatedNotifications = await handleDeleteNotification(
          notifications,
          plantId,
          nextWateredAtTimestamp
        );
        set((state) => ({
          ...state,
          notifications: updatedNotifications,
        }));
      },
      resetNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        set((state) => ({
          ...state,
          notifications: [],
        }));
      },
      toggleIsNotificatinoOn: async () => {
        const notifications = useNotificationStore.getState().notifications;
        let updatedNotifications: notificationType[];
        if (useNotificationStore.getState().isNotificationOn) {
          updatedNotifications = await handleTurnNotificationsOff(
            notifications
          );
          console.log(updatedNotifications);
        } else {
          updatedNotifications = await handleTurnNotificationsOn(notifications);
          console.log(updatedNotifications);
        }
        set((state) => ({
          ...state,
          isNotificationOn: !state.isNotificationOn,
          notifications: updatedNotifications,
        }));
      },
    }),
    {
      name: "myPetPlant-notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

async function handleChangeNotificationTime(
  notifications: notificationType[],
  newTimeOfDay: timeOfDayType
) {
  //cancel all notifications
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    Alert.alert("Error", "Unable to reschedule notifications");
    return notifications;
  }
  let updatedNotifications = [];
  for (let i = 0; i < notifications.length; i++) {
    let notification = notifications[i];
    let newNotification;
    //filter out old notifications
    if (notification.triggerTimestamp < Date.now()) {
      continue;
    }
    //add new notifications using new time of day
    let newTriggerDate = set(new Date(notification.triggerTimestamp), {
      hours: newTimeOfDay.hours,
      minutes: newTimeOfDay.minutes,
    });
    let newTriggerTimestamp = newTriggerDate.getTime();
    //overwrite old notification id
    try {
      let newPushNotificationId = await scheduleNotification(newTriggerDate);
      newNotification = {
        ...notification,
        id: newPushNotificationId,
        triggerTimestamp: newTriggerTimestamp,
      };
    } catch {
      Alert.alert(
        "Error",
        `Unable to reschedule notifications for the date: ${newTriggerDate.toLocaleDateString()}`
      );
      continue;
    }
    updatedNotifications.push(newNotification);
  }
  console.log(updatedNotifications);
  return updatedNotifications;
}

async function handleTurnNotificationsOff(
  notifications: notificationType[]
): Promise<notificationType[]> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    Alert.alert("Error", "Unable to turn off notifications");
    return notifications;
  }
  return notifications.map((notification) => ({
    ...notification,
    id: undefined,
  }));
}

async function handleTurnNotificationsOn(
  notifications: notificationType[]
): Promise<notificationType[]> {
  const filteredNotifications = notifications.filter(
    (notification) => notification.triggerTimestamp > Date.now()
  );
  try {
    return Promise.all(
      filteredNotifications.map(async (notification) => {
        const newNotificationId = await scheduleNotification(
          new Date(notification.triggerTimestamp)
        );
        return {
          ...notification,
          id: newNotificationId,
        };
      })
    );
  } catch {
    console.log("Error: unable to reschedule notifications");
    return filteredNotifications;
  }
}

async function handleDeleteNotification(
  notifications: notificationType[],
  plantId: string,
  nextWateredAtTimestamp: number
) {
  let updatedNotifications: notificationType[] = [];
  let now: number = Date.now();
  for (let i = 0; i < notifications.length; i++) {
    let notification = notifications[i];
    //remove old notifications
    if (notification.triggerTimestamp < now) {
      continue;
    }
    if (isSameDay(notification.triggerTimestamp, nextWateredAtTimestamp)) {
      if (notification.plantIds.includes(plantId)) {
        //notification date linked to this plant only -> cancel and remove notification
        if (notification.plantIds.length === 1 && notification.id) {
          try {
            await Notifications.cancelScheduledNotificationAsync(
              notification.id
            );
            continue;
          } catch {
            Alert.alert(
              "Oops something went wrong",
              `Unable to remove notification id: ${
                notification.id
              } scheduled on ${new Date(
                notification.triggerTimestamp
              ).toLocaleDateString()}`
            );
            continue;
          }
        }
        //notification date shared with other plants -> remove this plant from notification.plantId array
        const updatedPlantIds = notification.plantIds.filter(
          (id) => id !== plantId
        );
        updatedNotifications.push({
          ...notification,
          plantIds: updatedPlantIds,
        });
      } else {
        updatedNotifications.push(notification);
      }
    } else {
      updatedNotifications.push(notification);
    }
  }
  console.log(updatedNotifications);
  return updatedNotifications;
}

async function handleEditNotifications(
  notifications: notificationType[],
  plantId: string,
  prevNextWateredTimestamp: number,
  currentNextWateredTimestamp: number,
  timeOfDay: timeOfDayType
) {
  if (isSameDay(prevNextWateredTimestamp, currentNextWateredTimestamp)) {
    return notifications;
  }
  let updatedNotifications;
  try {
    updatedNotifications = await handleDeleteNotification(
      notifications,
      plantId,
      prevNextWateredTimestamp
    );
    updatedNotifications = await handleAddNotification(
      updatedNotifications,
      currentNextWateredTimestamp,
      plantId,
      timeOfDay
    );
  } catch {
    console.log("Error updating notification");
    updatedNotifications = notifications;
  }
  return updatedNotifications;
}

async function handleAddNotification(
  notifications: notificationType[],
  nextWaterTimestamp: number,
  plantId: string,
  timeOfDay: timeOfDayType
) {
  let updatedNotifications: notificationType[] = [];
  let addedToExistingNotification = false;
  let now: number = Date.now();
  for (let i = 0; i < notifications.length; i++) {
    let notification = notifications[i];
    //remove old notifications
    if (notification.triggerTimestamp < now) {
      continue;
    }
    //add plant to existing notifications
    if (isSameDay(nextWaterTimestamp, notification.triggerTimestamp)) {
      let newNotification = notification;
      if (!notification.plantIds.includes(plantId)) {
        const newPlantIds = [...notification.plantIds, plantId];
        newNotification = { ...newNotification, plantIds: newPlantIds };
      }
      updatedNotifications.push(newNotification);
      addedToExistingNotification = true;
    } else {
      updatedNotifications.push(notification);
    }
  }
  //if no existing notification, create new notification
  if (!addedToExistingNotification) {
    const triggerDate = set(new Date(nextWaterTimestamp), {
      hours: timeOfDay.hours,
      minutes: timeOfDay.minutes,
    });
    const triggerTimestamp = triggerDate.getTime();
    let pushNotificationId;
    try {
      pushNotificationId = await scheduleNotification(triggerDate);
    } catch {
      console.error("Unable to create notification");
      return updatedNotifications;
    }
    const newNotification: notificationType = {
      id: pushNotificationId,
      plantIds: [plantId],
      triggerTimestamp,
    };
    updatedNotifications.push(newNotification);
  }
  console.log(updatedNotifications);
  return updatedNotifications;
}

async function scheduleNotification(triggerDate: Date) {
  let pushNotificationId;
  const result = await registerForPushNotificationsAsync();
  if (result === "granted") {
    pushNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "It's time to water your plants!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return pushNotificationId;
  } else {
    if (Device.isDevice) {
      Alert.alert(
        "Unable to schedule notification",
        "Enable the notification permission in App Settings"
      );
    }
  }
}
