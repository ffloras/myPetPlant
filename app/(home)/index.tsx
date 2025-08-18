import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable, FlatList } from "react-native";
import { useUserStore } from "../../store/userStore";
import { useRouter } from "expo-router";
import { PlantType, usePlantStore } from "@/store/plantStore";
import PlantCard from "../components/PlantCard";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSearchStore } from "@/store/searchStore";
import { useEffect, useRef, useState } from "react";
import SearchBar from "../components/SearchBar";
import { theme } from "@/themes";
import ListEmpty from "../components/ListEmpty";
import * as SystemUI from "expo-system-ui";

SystemUI.setBackgroundColorAsync(theme.colorPaleGreen);

const dummyPlant: PlantType = {
  id: "1234",
  name: "Bob",
  wateringFrequencyDays: 10,
  nextWateredAtTimestamp: 1754952060000,
  lastWateredAtTimestamp: 1758193160000,
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<PlantType>);

export default function App() {
  const plants = usePlantStore((store) => store.plants);
  const searchOpened = useSearchStore((store) => store.searchOpened);
  const [plantsList, setPlantsList] = useState<PlantType[]>(plants);
  const [searchText, setSearchText] = useState<string>();
  const router = useRouter();
  // const flatListRef = useRef<FlatList<PlantType>>(null);

  //reset search bar and plant cards when opening/closing search bar
  useEffect(() => {
    if (searchOpened) {
      setSearchText(undefined);
    } else {
      setPlantsList(plants);
    }
  }, [searchOpened]);

  //filter plant cards based on search bar text
  useEffect(() => {
    if (searchOpened && searchText) {
      const newPlantList = plants.filter((plant) => {
        if (plant.name.toLowerCase().startsWith(searchText.toLowerCase())) {
          return plant;
        }
      });
      setPlantsList(newPlantList);
      return;
    }
    setPlantsList(plants);
  }, [searchText]);

  useEffect(() => {
    setPlantsList(plants);
  }, [plants]);

  return (
    <AnimatedFlatList
      data={sortPlantsByDate(plantsList)}
      // data={[]}
      // ref={flatListRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      renderItem={({ item }: { item: PlantType }) => (
        <Animated.View layout={LinearTransition.springify().dampingRatio(1)}>
          <PlantCard plant={item} />
        </Animated.View>
      )}
      keyExtractor={(item) => item.id}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <SearchBar
          visible={searchOpened}
          searchValue={searchText}
          setSearchValue={setSearchText}
        />
      }
      ListEmptyComponent={
        searchOpened && searchText ? (
          <Text style={styles.noPlantsFoundText}>No plants found</Text>
        ) : (
          <ListEmpty />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingBottom: 50,
    paddingHorizontal: 12,
  },
  text: {
    padding: 12,
    backgroundColor: "orange",
  },
  noPlantsFoundText: {
    textAlign: "center",
    padding: 16,
    color: theme.colorGrey,
  },
});

function sortPlantsByDate(plants: PlantType[]): PlantType[] {
  return plants.sort(
    (plant1, plant2) =>
      plant1.nextWateredAtTimestamp - plant2.nextWateredAtTimestamp
  );
}
