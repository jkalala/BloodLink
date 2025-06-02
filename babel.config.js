module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // Required for nativewind
      'nativewind/babel',
      // Required for reanimated
      'react-native-reanimated/plugin',
    ],
  };
}; 