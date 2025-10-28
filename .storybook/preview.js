/**
 * Storybook Preview Configuration
 *
 * Configure global decorators, parameters, and theme for all stories.
 * Provides theme switching and consistent component previews.
 */

import React from 'react'
import { View } from 'react-native'

/**
 * Theme Provider Decorator
 * Wraps all stories with the app's theme context
 *
 * Note: Requires actual implementation when Storybook is set up
 */
const ThemeDecorator = (Story) => {
  // This would use the actual ThemeProvider from app/theme/context.tsx
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#FFFFFF' }}>
      <Story />
    </View>
  )
}

/**
 * Global decorators applied to all stories
 */
export const decorators = [ThemeDecorator]

/**
 * Global parameters for all stories
 */
export const parameters = {
  /**
   * Controls addon configuration
   */
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },

  /**
   * Layout configuration
   */
  layout: 'centered',

  /**
   * Background options for component preview
   */
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#FFFFFF',
      },
      {
        name: 'dark',
        value: '#1A1A1A',
      },
      {
        name: 'primary',
        value: '#0066CC',
      },
    ],
  },

  /**
   * Actions configuration
   */
  actions: { argTypesRegex: '^on[A-Z].*' },
}

/**
 * Global types for theme switching
 */
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'base',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'base', title: 'Base Theme' },
        { value: 'elphaba', title: 'Elphaba Theme' },
        { value: 'glinda', title: 'Glinda Theme' },
        { value: 'gwynplaine', title: 'Gwynplaine Theme' },
        { value: 'johanna', title: 'Johanna Theme' },
      ],
      showName: true,
    },
  },
}
