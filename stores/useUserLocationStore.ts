import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserLocationState = {
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  loading: boolean;

  setLocation: (
    city: string,
    address: string,
    latitude: number,
    longitude: number
  ) => void;

  clearLocation: () => void;
  setLoading: (value: boolean) => void;
};

export const useUserLocationStore = create<UserLocationState>()(
  persist(
    (set) => ({
      city: null,
      address: null,
      latitude: null,
      longitude: null,
      loading: false,

      setLocation: (city, address, latitude, longitude) =>
        set({
          city,
          address,
          latitude,
          longitude,
          loading: false,
        }),

      clearLocation: () =>
        set({
          city: null,
          address: null,
          latitude: null,
          longitude: null,
        }),

      setLoading: (value) =>
        set({
          loading: value,
        }),
    }),
    {
      name: "user-location-store",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);
