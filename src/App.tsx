import SpinningCube from "./components/SpinningCube";

export default function App() {
  return (
    <div style={styles.container}>
      <h1 data-testid="app-title" style={styles.title}>
        Three.js Spinning Cube
      </h1>
      <div style={styles.cubeContainer}>
        <SpinningCube />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100vh",
    backgroundColor: "#1a1a2e",
    paddingTop: 60,
    margin: 0,
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
};
