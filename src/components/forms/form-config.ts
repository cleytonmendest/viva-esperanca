export type FieldConfig = {
    name: string;
    label: string;
    type: 'text' | 'date' | 'tel' | 'email' | 'password' | 'select' | 'multiselect' | 'textarea' | 'radio';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
};

export type FormConfig = FieldConfig[];