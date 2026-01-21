/**
 * Grid Component
 * 그리드 레이아웃 컴포넌트
 */

import { FC, Children, ReactNode } from "react";
import { View, ViewStyle, DimensionValue } from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Types
// ==========================================

export interface GridProps {
  /** 그리드 아이템들 */
  children: ReactNode;
  /** 열 개수 */
  columns?: number;
  /** 아이템 간격 */
  gap?: number;
  /** 가로 간격 */
  columnGap?: number;
  /** 세로 간격 */
  rowGap?: number;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
}

export interface GridItemProps {
  /** 아이템 내용 */
  children: ReactNode;
  /** 차지할 열 개수 */
  span?: number;
  /** 아이템 스타일 */
  style?: ViewStyle;
}

// ==========================================
// Components
// ==========================================

export const Grid: FC<GridProps> = ({
  children,
  columns = 2,
  gap,
  columnGap,
  rowGap,
  style,
}) => {
  const { themed } = useAppTheme();
  const horizontalGap = columnGap ?? gap ?? 12;
  const verticalGap = rowGap ?? gap ?? 12;

  const childArray = Children.toArray(children);

  return (
    <View
      style={[
        themed($container),
        {
          marginHorizontal: -horizontalGap / 2,
          marginVertical: -verticalGap / 2,
        },
        style,
      ]}
    >
      {childArray.map((child, index) => {
        // GridItem인 경우 span 처리
        const span = (child as any)?.props?.span || 1;
        const itemWidth = `${(100 / columns) * span}%` as DimensionValue;

        return (
          <View
            key={index}
            style={[
              $gridItem,
              {
                width: itemWidth,
                paddingHorizontal: horizontalGap / 2,
                paddingVertical: verticalGap / 2,
              },
            ]}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
};

export const GridItem: FC<GridItemProps> = ({
  children,
  span = 1,
  style,
}) => {
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  flexWrap: "wrap",
});

const $gridItem: ViewStyle = {
  flexDirection: "column",
};
