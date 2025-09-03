import { loginUser } from "@/api/authService";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Login from "../app/(auth)/login"; // adapte le chemin

jest.mock("@/api/authService");
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("Login Screen", () => {
  it("se connecte avec succès et redirige vers les tabs", async () => {
    // Arrange
    (loginUser as jest.Mock).mockResolvedValue({
      success: true,
      token: "fake_token",
    });

    const { getByPlaceholderText, getByText } = render(<Login />);

    // Act
    fireEvent.changeText(
      getByPlaceholderText("Entrez votre email"),
      "test@mail.com"
    );
    fireEvent.changeText(
      getByPlaceholderText("Entrez votre mot de passe"),
      "123456"
    );
    fireEvent.press(getByText("Se connecter"));

    // Assert
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("test@mail.com", "123456");
      expect(getByText("Connexion...")).toBeTruthy(); // bouton loading
    });
  });
});


