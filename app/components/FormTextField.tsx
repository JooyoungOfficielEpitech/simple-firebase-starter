import { forwardRef, Ref } from "react"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"

import { TextField, TextFieldProps } from "./TextField"

export interface FormTextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<TextFieldProps, "value" | "onChangeText" | "onBlur"> {
  /**
   * React Hook Form control object
   */
  control: Control<TFieldValues>
  /**
   * Field name for the form
   */
  name: TName
}

/**
 * A form field component that integrates TextField with React Hook Form.
 * This component wraps TextField with Controller to provide controlled input behavior.
 *
 * @example
 * ```tsx
 * <FormTextField
 *   control={form.control}
 *   name="email"
 *   placeholderTx="signInScreen:emailPlaceholder"
 *   keyboardType="email-address"
 *   autoCapitalize="none"
 * />
 * ```
 */
function FormTextFieldComponent<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: FormTextFieldProps<TFieldValues, TName>, ref: Ref<any>) {
  const { control, name, ...textFieldProps } = props

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextField
          ref={ref}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          status={error ? "error" : undefined}
          helper={error?.message}
          {...textFieldProps}
        />
      )}
    />
  )
}

export const FormTextField = forwardRef(FormTextFieldComponent) as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FormTextFieldProps<TFieldValues, TName> & { ref?: Ref<any> },
) => ReturnType<typeof FormTextFieldComponent>

// Re-export TextFieldAccessoryProps for convenience
export type { TextFieldAccessoryProps } from "./TextField"
