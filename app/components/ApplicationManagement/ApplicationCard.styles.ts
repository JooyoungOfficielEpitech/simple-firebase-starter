export const applicationCardStyles = () => ({
  $card: ({ colors, spacing }) => ({
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  }),

  $header: ({ spacing }) => ({
    marginBottom: spacing.sm,
  }),

  $nameStatusRow: ({ spacing }) => ({
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: spacing.xs,
  }),

  $applicantName: ({ colors, spacing }) => ({
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  }),

  $statusBadge: ({ spacing }) => ({
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 6,
  }),

  $statusText: ({ colors }) => ({
    fontSize: 12,
    fontWeight: "bold" as const,
    color: colors.palette.neutral100,
  }),

  $applicantEmail: ({ colors, typography, spacing }) => ({
    fontSize: 14,
    lineHeight: 20,
    color: colors.tint,
    fontFamily: typography.primary.medium,
    marginBottom: spacing.xs,
  }),

  $dateText: ({ colors, typography }) => ({
    fontSize: 12,
    lineHeight: 18,
    color: colors.textDim,
    fontFamily: typography.primary.medium,
  }),

  $infoSection: ({ spacing }) => ({
    marginBottom: spacing.sm,
  }),

  $infoRow: ({ spacing }) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
  }),

  $infoText: ({ colors, typography, spacing }) => ({
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    fontFamily: typography.primary.normal,
    marginLeft: spacing.xs,
    flex: 1,
  }),

  $linkText: ({ colors, typography, spacing }) => ({
    fontSize: 14,
    lineHeight: 20,
    color: colors.tint,
    fontFamily: typography.primary.medium,
    marginLeft: spacing.xs,
    textDecorationLine: "underline" as const,
  }),

  $messageSection: ({ spacing }) => ({
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  }),

  $sectionLabel: ({ colors, typography, spacing }) => ({
    fontSize: 13,
    lineHeight: 18,
    color: colors.textDim,
    fontFamily: typography.primary.medium,
    marginBottom: spacing.xs,
  }),

  $messageText: ({ colors, typography }) => ({
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    fontFamily: typography.primary.normal,
    fontStyle: "italic" as const,
  }),
})
