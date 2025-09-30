import { ViewStyle, TextStyle } from "react-native"

/* Use this file to define styles that are used in multiple places in your app. */
export const $styles = {
  // Flex utilities
  row: { flexDirection: "row" } as ViewStyle,
  column: { flexDirection: "column" } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  flexWrap: { flexWrap: "wrap" } as ViewStyle,
  
  // Alignment utilities
  center: { alignItems: "center", justifyContent: "center" } as ViewStyle,
  centerVertical: { justifyContent: "center" } as ViewStyle,
  centerHorizontal: { alignItems: "center" } as ViewStyle,
  spaceBetween: { justifyContent: "space-between" } as ViewStyle,
  spaceAround: { justifyContent: "space-around" } as ViewStyle,
  
  // Text alignment utilities
  textCenter: { textAlign: "center" } as TextStyle,
  textLeft: { textAlign: "left" } as TextStyle,
  textRight: { textAlign: "right" } as TextStyle,
  
  // Common patterns
  fullSize: { width: "100%", height: "100%" } as ViewStyle,
  fullWidth: { width: "100%" } as ViewStyle,
  fullHeight: { height: "100%" } as ViewStyle,
  
  // Button row pattern
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  } as ViewStyle,
  
  // Common container patterns
  screenContainer: {
    flexGrow: 1,
    backgroundColor: "transparent",
  } as ViewStyle,
  
  contentContainer: {
    alignItems: "center",
    paddingVertical: 16,
  } as ViewStyle,

  toggleInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  } as ViewStyle,
}
