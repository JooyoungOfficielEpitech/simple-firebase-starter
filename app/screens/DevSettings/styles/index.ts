import { StyleSheet } from 'react-native'

export const createDevSettingsStyles = (colors: any, spacing: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textDim,
  },
  section: {
    backgroundColor: colors.palette.neutral100,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    color: colors.textDim,
  },
  infoValue: {
    fontWeight: '600',
  },
  tokenDisplay: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  tokenText: {
    fontSize: 12,
    color: colors.textDim,
    fontFamily: 'monospace',
  },
  usageText: {
    fontSize: 14,
    color: colors.textDim,
    lineHeight: 20,
  },
  logText: {
    fontSize: 12,
    color: colors.textDim,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
})
