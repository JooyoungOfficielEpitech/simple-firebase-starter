import { ForwardedRef, forwardRef, PropsWithoutRef, ReactElement, RefObject } from "react"
import { FlatList, FlatListProps } from "react-native"

import { isRTL } from "@/i18n"

export type ListViewRef<T> = FlatList<T>

export type ListViewProps<T> = PropsWithoutRef<FlatListProps<T>>

/**
 * This is a Higher Order Component that wraps React Native's FlatList with RTL support.
 * This component can be extended to support @shopify/flash-list in the future.
 *
 * @param {FlatListProps} props - The props for the `ListView` component.
 * @param {RefObject<ListViewRef>} forwardRef - An optional forwarded ref.
 * @returns {JSX.Element} The rendered `ListView` component.
 */
const ListViewComponent = forwardRef(
  <T,>(props: ListViewProps<T>, ref: ForwardedRef<ListViewRef<T>>) => {
    return <FlatList {...props} ref={ref} />
  },
)

ListViewComponent.displayName = "ListView"

export const ListView = ListViewComponent as <T>(
  props: ListViewProps<T> & {
    ref?: RefObject<ListViewRef<T> | null>
  },
) => ReactElement
