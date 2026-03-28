const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "expo-modules-core": path.resolve(__dirname, "node_modules/expo/node_modules/expo-modules-core"),
  // alias react-native-worklets to react-native-worklets-core so nativewind's
  // internal babel plugin (react-native-worklets/plugin) resolves correctly
  // WITHOUT creating a duplicate Android native module that causes DEX conflicts.
  "react-native-worklets": path.resolve(__dirname, "node_modules/react-native-worklets-core"),
};

module.exports = withNativeWind(config, { input: path.resolve(__dirname, "./global.css") });
