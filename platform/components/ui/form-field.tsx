'use client';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}
