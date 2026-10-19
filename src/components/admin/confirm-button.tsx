"use client";

export function ConfirmButton({
  message,
  formAction,
  className,
  children,
}: {
  message: string;
  formAction: (formData: FormData) => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      formAction={formAction}
      formNoValidate
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
