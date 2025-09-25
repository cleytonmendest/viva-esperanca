export type FieldConfig = {
    name: string;
    label: string;
    type: 'text' | 'date' | 'tel' | 'email' | 'password' | 'select' | 'multiselect';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[]; // Para 'select' e 'multiselect'
};

export type FormConfig = FieldConfig[];