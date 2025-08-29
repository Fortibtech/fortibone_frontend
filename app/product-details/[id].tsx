import BackButton from "@/components/BackButton";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

const ProductDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeSlide, setActiveSlide] = useState(0);

  const images = [
    require("@/assets/images/product/1.png"),
    require("@/assets/images/product/2.png"),
    require("@/assets/images/product/3.png"),
  ];
  console.log("id du produit", id);
  return (
    <SafeAreaView style={styles.container}>
      {/* Section supérieure : Carrousel d'images */}
      <View style={styles.topSection}>
        <Carousel
          width={screenWidth}
          height={250}
          data={images}
          scrollAnimationDuration={500}
          onSnapToItem={(index) => setActiveSlide(index)}
          renderItem={({ item }) => (
            <Image source={item} style={styles.carouselImage} />
          )}
        />

        {/* Indicateurs de pagination */}
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Bouton de retour en haut à gauche */}
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>

        {/* Icône de panier en haut à droite */}
        <TouchableOpacity style={styles.cartIconContainer}>
          <Image
            source={require("@/assets/images/logo/cart.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        {/* Icône de favori en bas à droite */}
        <TouchableOpacity style={styles.favoriteIconContainer}>
          <Image
            source={require("@/assets/images/logo/heart.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Section inférieure : Description */}
      <View style={styles.bottomSection}>
        <Text style={styles.title}>Description</Text>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topSection: {
    height: "35%",
    position: "relative",
    backgroundColor: "#cccccc72",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
    height: "100%",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#000",
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  cartIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIconContainer: {
    position: "absolute",
    bottom: 40,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "#000",
    resizeMode: "contain",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
});

export default ProductDetails;
