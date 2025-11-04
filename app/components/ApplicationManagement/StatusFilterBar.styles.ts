export const statusFilterBarStyles = () => ({
  $container: ({ spacing }) => ({
    flexDirection: "row" as const,
    marginBottom: spacing?.lg || 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    padding: 4,
  }),

  $tab: ({ spacing }) => ({
    flex: 1,
    paddingVertical: spacing?.sm || 8,
    paddingHorizontal: spacing?.xs || 4,
    alignItems: "center" as const,
    borderRadius: 6,
  }),

  $activeTab: ({ colors, spacing }) => ({
    flex: 1,
    paddingVertical: spacing?.sm || 8,
    paddingHorizontal: spacing?.xs || 4,
    alignItems: "center" as const,
    borderRadius: 6,
    backgroundColor: colors.palette.primary500,
  }),

  $tabText: ({ colors, typography }) => ({
    fontSize: 13,
    lineHeight: 18,
    color: colors.textDim,
    fontFamily: typography.primary.medium,
  }),

  $activeTabText: ({ colors, typography }) => ({
    fontSize: 13,
    lineHeight: 18,
    color: colors.palette.neutral100,
    fontFamily: typography.primary.medium,
  }),
})
