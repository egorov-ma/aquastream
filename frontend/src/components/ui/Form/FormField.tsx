import React from 'react';
import { Controller, ControllerProps, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

export interface FormFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
  extends Omit<ControllerProps<TFieldValues, TName>, 'control'> {}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: FormFieldProps<TFieldValues, TName>
) {
  const { control } = useFormContext<TFieldValues>();
  return <Controller control={control} {...props} />;
}

export default FormField;
