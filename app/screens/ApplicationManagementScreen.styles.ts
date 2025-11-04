export const applicationManagementStyles = () => ({
  $container: ({ spacing }) => ({
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.lg,
  }),

  $content: ({ spacing }) => ({
    flex: 1,
    paddingTop: spacing.md,
  }),

  $postInfo: ({ spacing }) => ({
    marginBottom: spacing.lg,
  }),

  $postTitle: ({ colors, typography, spacing }) => ({
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    fontFamily: typography.primary.medium,
    marginBottom: spacing.xs,
  }),

  $statsText: ({ colors, typography, spacing }) => ({
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDim,
    fontFamily: typography.primary.normal,
    marginBottom: spacing.lg,
  }),

  $applicationsContainer: ({ spacing }) => ({
    marginTop: spacing.sm,
  }),

  $loadingContainer: ({ spacing }) => ({
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: spacing.xl,
  }),

  $loadingIconContainer: ({ spacing }) => ({
    marginBottom: spacing.lg,
  }),

  $loadingIcon: () => ({
    fontSize: 48,
    textAlign: "center" as const,
  }),

  $loadingText: ({ colors, typography, spacing }) => ({
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDim,
    fontFamily: typography.primary.normal,
    textAlign: "center" as const,
    marginTop: spacing.sm,
  }),

  $emptyContainer: ({ spacing }) => ({
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  }),

  $emptyIconContainer: ({ spacing }) => ({
    marginBottom: spacing.lg,
  }),

  $emptyIcon: () => ({
    fontSize: 48,
    textAlign: "center" as const,
  }),

  $emptyText: ({ colors, typography }) => ({
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDim,
    fontFamily: typography.primary.normal,
    textAlign: "center" as const,
  }),

  $emptySubText: ({ colors, typography, spacing }) => ({
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDim,
    fontFamily: typography.primary.normal,
    textAlign: "center" as const,
    marginTop: spacing.xs,
  }),
})
