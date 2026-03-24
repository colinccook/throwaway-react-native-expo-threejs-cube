const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin that sets SWIFT_STRICT_CONCURRENCY=minimal for all
 * CocoaPods targets. This is needed because expo-modules-core 55.x is not
 * yet compatible with Swift 6 strict concurrency (Xcode ≥ 16.4).
 */
module.exports = function withSwiftConcurrencyMinimal(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfile = fs.readFileSync(podfilePath, "utf-8");

      // Skip if already applied
      if (podfile.includes("SWIFT_STRICT_CONCURRENCY")) {
        return config;
      }

      const snippet = [
        "",
        "    # Suppress Swift 6 strict-concurrency errors in Expo modules",
        "    installer.pods_project.targets.each do |target|",
        "      target.build_configurations.each do |bc|",
        "        bc.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'",
        "      end",
        "    end",
      ].join("\n");

      if (podfile.includes("post_install do |installer|")) {
        podfile = podfile.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|${snippet}`
        );
      } else {
        podfile += [
          "",
          "post_install do |installer|",
          snippet,
          "end",
          "",
        ].join("\n");
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};
