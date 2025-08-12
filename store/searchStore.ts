import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type searchStore = {
  searchOpened: boolean;
  toggleSearch: () => void;
};

export const useSearchStore = create(
  persist<searchStore>(
    (set) => ({
      searchOpened: false,
      toggleSearch: () => {
        set((store) => {
          return {
            ...store,
            searchOpened: !store.searchOpened,
          };
        });
      },
    }),
    {
      name: "myPetPlant-search-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
