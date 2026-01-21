import { type FC, memo, useMemo } from "react";
import {
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";

import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface DateSeparatorProps {
  /**
   * Date to display
   */
  date: Date;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A separator component that displays a date between groups of messages.
 * Shows "오늘", "어제", or formatted date like "2024년 1월 15일".
 * @param {DateSeparatorProps} props - The props for the `DateSeparator` component.
 * @returns {JSX.Element} The rendered `DateSeparator` component.
 * @example
 * <DateSeparator date={new Date()} />
 */
export const DateSeparator: FC<DateSeparatorProps> = memo(
  function DateSeparator(props) {
    const { date, style: $styleOverride } = props;
    const { themed } = useAppTheme();

    /**
     * Format date for display (memoized)
     * Returns "오늘", "어제", or full date format
     */
    const dateLabel = useMemo(() => {
      if (isToday(date)) {
        return "오늘";
      }

      if (isYesterday(date)) {
        return "어제";
      }

      return format(date, "yyyy년 M월 d일", { locale: ko });
    }, [date]);

    return (
      <View
        style={[themed($container), $styleOverride]}
        accessibilityRole="text"
        accessibilityLabel={`날짜: ${dateLabel}`}
      >
        <View style={themed($line)} />
        <View style={themed($labelContainer)}>
          <Text text={dateLabel} style={themed($label)} />
        </View>
        <View style={themed($line)} />
      </View>
    );
  },
);

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
});

const $line: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.separator,
});

const $labelContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  marginHorizontal: spacing.xs,
});

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontWeight: "500",
});
