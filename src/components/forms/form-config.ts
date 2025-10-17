export type FieldConfig = {
    name: string;
    label: string;
    type: 'text' | 'datetime-local' | 'tel' | 'email' | 'password' | 'select' | 'multiselect' | 'textarea' | 'radio' | 'date' | 'number' | 'combobox';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    empty?: string; // Added for combobox
};

export type FormConfig = FieldConfig[];