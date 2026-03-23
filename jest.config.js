module.exports = {
  preset: "jest-expo/web",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|three|expo-three|expo-gl)",
  ],
  testMatch: ["**/__tests__/**/*.steps.tsx"],
};
