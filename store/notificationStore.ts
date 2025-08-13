import { create } from "zustand";
import { isSameDay, set } from "date-fns";
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
  id: string;
  plantIds: string[];
  triggerTimestamp: number;
};

type notificationStoreType = {
  notifications: notificationType[];
  timeOfDay: timeOfDayType;
  addNotification: (plantId: string, nextWateredAtTimestamp: number) => void;
  updateNotifications: (
    plantId: string,
    prevLastWateredAtTimestamp: number,
    currentNextWateredAtTimestamp: number
  ) => void;
  resetNotifications: () => void;
  deleteNotification: (plantId: string, nextWateredAtTimestamp: number) => void;
};

export const useNotificationStore = create(
  persist<notificationStoreType>(
    (set) => ({
      notifications: [],
      timeOfDay: { hours: 7, minutes: 0 },
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
        prevLastWateredAtTimestamp: number,
        currentNextWateredAtTimestamp: number
      ) => {
        const notifications = useNotificationStore.getState().notifications;
        const timeOfDay = useNotificationStore.getState().timeOfDay;
        const updatedNotifications = await handleEditNotifications(
          notifications,
          plantId,
          prevLastWateredAtTimestamp,
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
    }),
    {
      name: "myPetPlant-notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

async function handleDeleteNotification(
  notifications: notificationType[],
  plantId: string,
  nextWateredAtTimestamp: number
) {
  let updatedNotifications: notificationType[] = [];
  let now: number = Date.now();
  for (let i = 0; i < notifications.length; i++) {
    let notification = notifications[i];
    if (notification.triggerTimestamp < now) {
      continue;
    }
    if (isSameDay(notification.triggerTimestamp, nextWateredAtTimestamp)) {
      if (notification.plantIds.includes(plantId)) {
        //notification date linked to this plant only -> cancel notification and remove entire notification
        if (notification.plantIds.length === 1) {
          await Notifications.cancelScheduledNotificationAsync(notification.id);
          continue;
        }
        //previous notification date shared with other plants -> remove this plant from plantId array
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
  let updatedNotifications = await handleDeleteNotification(
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
  return updatedNotifications;

  //let updatedNotifications: notificationType[] = [];

  // let addedToExistingNotification = false;
  // let now: number = Date.now();
  // for (let i = 0; i < notifications.length; i++) {
  //   let notification = notifications[i];
  //   //remove old notifications
  //   if (notification.triggerTimestamp < now) {
  //     continue;
  //   }
  //   //modify previous notification
  //   if (isSameDay(prevNextWateredTimestamp, notification.triggerTimestamp)) {
  //     if (notification.plantIds.includes(plantId)) {
  //       //previous notification date linked to this plant only -> cancel notification and remove from notifications array
  //       if (notification.plantIds.length === 1) {
  //         await Notifications.cancelScheduledNotificationAsync(notification.id);
  //         continue;
  //       }
  //       //previous notification date shared with other plants -> remove this plant from plantId array
  //       const updatedPlantIds = notification.plantIds.filter(
  //         (id) => id !== plantId
  //       );
  //       updatedNotifications.push({
  //         ...notification,
  //         plantIds: updatedPlantIds,
  //       });
  //     } else {
  //       updatedNotifications.push(notification);
  //     }
  //     continue;
  //   }
  //   //add current notification: notification for this date already exists -> add to existing notification's plantIds
  //   if (isSameDay(currentNextWateredTimestamp, notification.triggerTimestamp)) {
  //     let newNotification = notification;
  //     if (!notification.plantIds.includes(plantId)) {
  //       const newPlantIds = [...notification.plantIds, plantId];
  //       newNotification = { ...newNotification, plantIds: newPlantIds };
  //     }
  //     updatedNotifications.push(newNotification);
  //     addedToExistingNotification = true;
  //   } else {
  //     updatedNotifications.push(notification);
  //   }
  // }
  // //add current notification: notification for this date doesn't exist -> schedule new notification and add to list
  // if (!addedToExistingNotification) {
  //   const triggerDate = set(new Date(currentNextWateredTimestamp), {
  //     hours: timeOfDay.hours,
  //     minutes: timeOfDay.minutes,
  //   });
  //   const triggerTimestamp = triggerDate.getTime();
  //   const pushNotificationId = await scheduleNotification(triggerDate);
  //   if (!pushNotificationId) {
  //     console.error("Unable to create notification");
  //     return updatedNotifications;
  //   }
  //   const newNotification: notificationType = {
  //     id: pushNotificationId,
  //     plantIds: [plantId],
  //     triggerTimestamp,
  //   };
  //   updatedNotifications.push(newNotification);
  // }
  // console.log(updatedNotifications);
  // return updatedNotifications;
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
    if (notification.triggerTimestamp < now) {
      continue;
    }
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
  if (!addedToExistingNotification) {
    const triggerDate = set(new Date(nextWaterTimestamp), {
      hours: timeOfDay.hours,
      minutes: timeOfDay.minutes,
    });
    const triggerTimestamp = triggerDate.getTime();
    const pushNotificationId = await scheduleNotification(triggerDate);
    if (!pushNotificationId) {
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
