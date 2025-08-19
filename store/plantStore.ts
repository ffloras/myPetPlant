import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as FileSystem from "expo-file-system";

export type PlantType = {
  id: string;
  name: string;
  wateringFrequencyDays: number;
  lastWateredAtTimestamp?: number;
  prevLastWateredAtTimestamp?: number;
  nextWateredAtTimestamp: number;
  imageUri?: string;
  notes?: (string | undefined)[];
};

type PlantsState = {
  plants: PlantType[];
  addPlant: (newPlant: PlantType) => Promise<void>;
  removePlant: (plantId: string) => void;
  waterPlant: (plantId: string) => void;
  editPlant: (newPlantInfo: PlantType) => void;
  editNextWateredAtTimestamp: (plantId: string, newTimestamp: number) => void; //also need to edit notification
  revertLastWateredAtTimestamp: (plantId: string) => void;
};

const msInDay = 24 * 60 * 60 * 1000;

export const usePlantStore = create(
  persist<PlantsState>(
    (set) => ({
      plants: [],
      addPlant: async (newPlant: PlantType) => {
        //copy uploaded image to document storage
        const imageUri = newPlant.imageUri;
        const savedImageUri =
          FileSystem.documentDirectory +
          `${new Date().getTime()}-${imageUri?.split("/").slice(-1)[0]}`;
        if (imageUri) {
          await FileSystem.copyAsync({
            from: imageUri,
            to: savedImageUri,
          });
        }
        set((state) => {
          return {
            ...state,
            plants: [
              { ...newPlant, imageUri: imageUri ? savedImageUri : undefined },
              ...state.plants,
            ],
          };
        });
      },
      removePlant: (plantId: string) => {
        set((state) => {
          return {
            ...state,
            plants: state.plants.filter((plant) => plant.id !== plantId),
          };
        });
      },
      waterPlant: (plantId: string) => {
        set((state) => {
          return {
            ...state,
            plants: state.plants.map((plant) => {
              if (plant.id == plantId) {
                return {
                  ...plant,
                  prevLastWateredAtTimestamp: plant.lastWateredAtTimestamp,
                  lastWateredAtTimestamp: Date.now(),
                  nextWateredAtTimestamp:
                    Date.now() + plant.wateringFrequencyDays * msInDay,
                };
              }
              return plant;
            }),
          };
        });
      },
      editPlant: (newPlantInfo: PlantType) => {
        set((state) => {
          return {
            ...state,
            plants: state.plants.map((plant) => {
              if (plant.id === newPlantInfo.id) {
                return {
                  ...plant,
                  ...newPlantInfo,
                };
              }
              return plant;
            }),
          };
        });
      },
      editNextWateredAtTimestamp: (plantId: string, newTimestamp: number) => {
        set((state) => {
          return {
            ...state,
            plants: state.plants.map((plant) => {
              if (plant.id === plantId) {
                return {
                  ...plant,
                  nextWateredAtTimestamp: newTimestamp,
                };
              }
              return plant;
            }),
          };
        });
      },
      revertLastWateredAtTimestamp: (plantId: string) => {
        set((state) => {
          return {
            ...state,
            plants: state.plants.map((plant) => {
              if (plant.id === plantId) {
                return {
                  ...plant,
                  lastWateredAtTimestamp: plant.prevLastWateredAtTimestamp,
                  prevLastWateredAtTimestamp: undefined,
                };
              }
              return plant;
            }),
          };
        });
      },
    }),
    {
      name: "myPetPlant-plants-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
