// ✅ Mock SafeAreaView pour éviter les erreurs de contexte
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);

// ✅ Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// ✅ Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

// ✅ Mock des icônes expo pour supprimer le warning act(...)
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: (props: any) => <Text>{props.name}</Text>,
    MaterialIcons: (props: any) => <Text>{props.name}</Text>,
  };
});
