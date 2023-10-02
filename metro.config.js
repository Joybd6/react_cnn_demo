// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);


module.exports = (() => {
    const defaultConfig = getDefaultConfig(__dirname);
    const {assetExts} = defaultConfig.resolver;
    return {
      resolver: {
        // Add bin to assetExts
        assetExts: [...assetExts, 'bin'],
      }
    };
  })();
