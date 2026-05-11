import React, { useState } from 'react';
import type { UserFormData } from '../../../shared/hooks/useUserManagement';
import type { UserRole } from '../../../shared/types/user.types';
import {
    validateEmail,
    validatePassword,
    validateRequired,
} from '../../../shared/utils/validation';

interface UserFormProps {
    formData: UserFormData;
    editingId: string | null;
    onFormDataChange: (data: UserFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

const ROLES: UserRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN', 'ENGINEER', 'OPERATOR'];

const UserForm: React.FC<UserFormProps> = ({
    formData,
    editingId,
    onFormDataChange,
    onSubmit,
    onCancel,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = (): boolean => {
        const errors: Record<string, string | null> = {
            firstName: validateRequired(formData.firstName, 'First name').error,
            lastName: validateRequired(formData.lastName, 'Last name').error,
            email: validateEmail(formData.email).error,
            password: validatePassword(formData.password, !editingId).error,
        };
        setFieldErrors(errors);
        return Object.values(errors).every((e) => e === null);
    };

    const handleFieldChange = (field: keyof UserFormData, value: string | boolean) => {
        onFormDataChange({ ...formData, [field]: value });

        if (submitted) {
            const validators: Record<string, () => string | null> = {
                firstName: () => validateRequired(value as string, 'First name').error,
                lastName: () => validateRequired(value as string, 'Last name').error,
                email: () => validateEmail(value as string).error,
                password: () => validatePassword(value as string, !editingId).error,
            };
            if (validators[field]) {
                setFieldErrors((prev) => ({ ...prev, [field]: validators[field]() }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!validate()) return;
        onSubmit(e);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>First Name *</label>
                    <input
                        style={fieldErrors.firstName ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                        value={formData.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                        placeholder="John"
                    />
                    {fieldErrors.firstName && <span style={errorStyle}>{fieldErrors.firstName}</span>}
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Last Name *</label>
                    <input
                        style={fieldErrors.lastName ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                        value={formData.lastName}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                        placeholder="Doe"
                    />
                    {fieldErrors.lastName && <span style={errorStyle}>{fieldErrors.lastName}</span>}
                </div>
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Email *</label>
                <input
                    type="email"
                    style={fieldErrors.email ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="user@example.com"
                />
                {fieldErrors.email && <span style={errorStyle}>{fieldErrors.email}</span>}
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>
                    Password {editingId ? '(leave blank to keep current)' : '*'}
                </label>
                <div style={{ position: 'relative' }}>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        style={fieldErrors.password ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                        value={formData.password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={togglePasswordStyle}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
                {fieldErrors.password && <span style={errorStyle}>{fieldErrors.password}</span>}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Role</label>
                    <select
                        style={inputStyle}
                        value={formData.role}
                        onChange={(e) => handleFieldChange('role', e.target.value)}
                    >
                        {ROLES.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '28px' }}>
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                        />
                        <span style={labelStyle}>Active</span>
                    </label>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={saveBtnStyle}>
                    {editingId ? 'Update User' : 'Create User'}
                </button>
            </div>
        </form>
    );
};

const formGroupStyle: React.CSSProperties = {
    marginBottom: 20,
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 8,
    fontWeight: 500,
    fontSize: '14px',
    color: '#374151',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

const errorStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
};

const togglePasswordStyle: React.CSSProperties = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#6b7280',
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
};

const saveBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
};

export default UserForm;
