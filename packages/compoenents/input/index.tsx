import { forwardRef } from "react";

interface BaseProps {
    label?: string;
    type?: "text" | "number" | "password" | "email" | "textarea";
    className?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
    ({ label, type = "text", className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-2" >
                        {label}
                    </label>
                )}
                {type === "textarea" ? (
                    <textarea
                        ref={ref as React.Ref<HTMLTextAreaElement>}
                        className={`w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none ${className}`}
                        {...(props as TextareaProps)}
                    />
                ) : (
                    <input
                        {...(props as InputProps)}
                        type={type}
                        ref={ref as React.Ref<HTMLInputElement>}
                        className={`w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none ${className}`}
                    />
                )}
            </div>
        )
    }
);


Input.displayName = "Input";

export default Input;

