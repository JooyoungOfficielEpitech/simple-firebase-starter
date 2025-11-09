const {
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin for RNPitchShifter
 *
 * This plugin:
 * 1. Copies native Swift/Objective-C files to iOS project
 * 2. Updates bridging header with React Native imports
 * 3. Adds files to Xcode project
 */
const withPitchShifter = (config) => {
  // Step 1: Copy native files to iOS project
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosRoot = config.modRequest.platformProjectRoot;
      const projectName = config.modRequest.projectName;
      const targetDir = path.join(iosRoot, projectName);
      const sourceDir = path.join(
        config.modRequest.projectRoot,
        'plugins',
        'native-modules',
        'ios'
      );

      console.log('🔧 [withPitchShifter] Copying native files...');
      console.log(`   Source: ${sourceDir}`);
      console.log(`   Target: ${targetDir}`);

      // Ensure target directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy RNPitchShifter.swift
      const swiftSource = path.join(sourceDir, 'RNPitchShifter.swift');
      const swiftTarget = path.join(targetDir, 'RNPitchShifter.swift');
      if (fs.existsSync(swiftSource)) {
        fs.copyFileSync(swiftSource, swiftTarget);
        console.log('✅ [withPitchShifter] Copied RNPitchShifter.swift');
      } else {
        console.warn('⚠️  [withPitchShifter] RNPitchShifter.swift not found in source');
      }

      // Copy RNPitchShifter.m
      const mSource = path.join(sourceDir, 'RNPitchShifter.m');
      const mTarget = path.join(targetDir, 'RNPitchShifter.m');
      if (fs.existsSync(mSource)) {
        fs.copyFileSync(mSource, mTarget);
        console.log('✅ [withPitchShifter] Copied RNPitchShifter.m');
      } else {
        console.warn('⚠️  [withPitchShifter] RNPitchShifter.m not found in source');
      }

      // Update bridging header
      const bridgingHeaderPath = path.join(
        targetDir,
        `${projectName}-Bridging-Header.h`
      );

      if (fs.existsSync(bridgingHeaderPath)) {
        let bridgingHeader = fs.readFileSync(bridgingHeaderPath, 'utf8');

        // Add React Native imports if not already present
        const reactImports = `#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>`;

        if (!bridgingHeader.includes('RCTBridgeModule.h')) {
          // Add imports before the end of file
          bridgingHeader = bridgingHeader.trim() + '\n\n' + reactImports + '\n';
          fs.writeFileSync(bridgingHeaderPath, bridgingHeader);
          console.log('✅ [withPitchShifter] Updated bridging header');
        } else {
          console.log('✅ [withPitchShifter] Bridging header already configured');
        }
      } else {
        console.warn('⚠️  [withPitchShifter] Bridging header not found');
      }

      return config;
    },
  ]);

  // Step 2: Add files to Xcode project
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectName = config.modRequest.projectName;

    console.log('🔧 [withPitchShifter] Adding files to Xcode project...');

    // Get the first project and its main group
    const project = xcodeProject.getFirstProject();
    const mainGroupKey = project.firstProject.mainGroup;

    // Add RNPitchShifter.swift
    if (!xcodeProject.hasFile('RNPitchShifter.swift')) {
      xcodeProject.addSourceFile(
        `${projectName}/RNPitchShifter.swift`,
        {},
        mainGroupKey
      );
      console.log('✅ [withPitchShifter] Added RNPitchShifter.swift to Xcode project');
    } else {
      console.log('✅ [withPitchShifter] RNPitchShifter.swift already in Xcode project');
    }

    // Add RNPitchShifter.m
    if (!xcodeProject.hasFile('RNPitchShifter.m')) {
      xcodeProject.addSourceFile(
        `${projectName}/RNPitchShifter.m`,
        {},
        mainGroupKey
      );
      console.log('✅ [withPitchShifter] Added RNPitchShifter.m to Xcode project');
    } else {
      console.log('✅ [withPitchShifter] RNPitchShifter.m already in Xcode project');
    }

    return config;
  });

  return config;
};

module.exports = withPitchShifter;
