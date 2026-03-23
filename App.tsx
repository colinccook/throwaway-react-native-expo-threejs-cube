import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import SpinningCube from "./components/SpinningCube";

export default function App() {
  return (
    <View style={styles.container}>
      <Text testID="app-title" style={styles.title}>
        Three.js Spinning Cube
      </Text>
      <View style={styles.cubeContainer}>
        <SpinningCube />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  cubeContainer: {
    flex: 1,
    width: "100%",
  },
});
