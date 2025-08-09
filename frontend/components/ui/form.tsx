"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, type Control, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";

const Form = FormProvider;

type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  control?: Control<TFieldValues>;
} & Omit<ControllerProps<TFieldValues, TName>, "name" | "control">;

function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({ control: controlProp, ...props }: FormFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();
  return <Controller {...(props as ControllerProps<TFieldValues, TName>)} control={controlProp ?? control} />;
}

const FormItemContext = React.createContext<{ name?: string }>({});

function useFormField() {
  const item = React.useContext(FormItemContext);
  const { formState } = useFormContext();
  const id = React.useId();

  let errorMessage: string | undefined;
  if (item.name) {
    const fieldError = (formState.errors as Record<string, { message?: string } | undefined>)[item.name];
    errorMessage = fieldError?.message;
  }

  return {
    id,
    name: item.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    errorMessage,
  } as const;
}

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />,
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField();
  return <label ref={ref} className={className} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<typeof Slot>>((props, ref) => {
  const { formItemId } = useFormField();
  return <Slot ref={ref} id={formItemId} {...props} />;
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();
    return <p ref={ref} className={className} id={formDescriptionId} {...props} />;
  },
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formMessageId, errorMessage } = useFormField();
    return (
      <p ref={ref} className={className} id={formMessageId} {...props}>
        {errorMessage ?? props.children}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage };


