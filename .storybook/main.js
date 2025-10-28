/**
 * Storybook Main Configuration
 *
 * Configure Storybook for React Native with Expo support.
 * This setup uses @storybook/react-native-server for web-based viewing.
 *
 * Note: This is a configuration file for reference. Actual Storybook setup
 * requires installing dependencies:
 *
 * npm install --save-dev @storybook/react-native @storybook/react-native-server
 * npm install --save-dev @react-native-async-storage/async-storage
 */

module.exports = {
  /**
   * Stories glob pattern
   * Matches all .stories.tsx files in the app directory
   */
  stories: [
    '../app/**/*.stories.tsx',
    '../app/components/**/*.stories.tsx',
    '../app/design-system/**/*.stories.tsx',
  ],

  /**
   * Addons for enhanced Storybook functionality
   * Commented out until packages are installed
   */
  addons: [
    // '@storybook/addon-ondevice-controls', // Interactive controls
    // '@storybook/addon-ondevice-actions',  // Action logger
    // '@storybook/addon-ondevice-notes',    // Component documentation
  ],

  /**
   * Framework configuration
   */
  framework: {
    name: '@storybook/react-native',
    options: {},
  },

  /**
   * Documentation generation
   */
  docs: {
    autodocs: true,
  },
}
