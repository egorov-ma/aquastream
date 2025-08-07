import React from 'react';
import { FormProvider, SubmitHandler, UseFormReturn, FieldValues } from 'react-hook-form';

export interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  methods: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  className?: string;
  children: React.ReactNode;
}

export function Form<TFieldValues extends FieldValues>({ methods, onSubmit, className, children }: FormProps<TFieldValues>) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

export default Form;
