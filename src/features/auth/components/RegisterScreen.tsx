import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../authSlice';
import type { RootState, AppDispatch } from '../../../app/store/store';
import type { RegisterRequestDTO } from '../../../shared/types/auth.types';
import {
    validateEmail,
    validatePassword,
    validateRequired,
} from '../../../shared/utils/validation';
import { ROUTES } from '../../../shared/constants/routes';
import styles from '../auth.module.css';

export function RegisterScreen() {
    const [formData, setFormData] = useState<RegisterRequestDTO>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state: RootState) => state.auth,
    );

    useEffect(() => {
        if (isSuccess) navigate(ROUTES.LOGIN);
        if (user) navigate(ROUTES.HOME);
        return () => { dispatch(reset()); };
    }, [user, isSuccess, navigate, dispatch]);

    const validate = (): boolean => {
        const errors: Record<string, string | null> = {
            firstName: validateRequired(formData.firstName, 'First name').error,
            lastName: validateRequired(formData.lastName, 'Last name').error,
            email: validateEmail(formData.email).error,
            password: validatePassword(formData.password).error,
        };
        setFieldErrors(errors);
        return Object.values(errors).every((e) => e === null);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (submitted) {
            const validators: Record<string, () => string | null> = {
                firstName: () => validateRequired(value, 'First name').error,
                lastName: () => validateRequired(value, 'Last name').error,
                email: () => validateEmail(value).error,
                password: () => validatePassword(value).error,
            };
            if (validators[name]) {
                setFieldErrors((prev) => ({ ...prev, [name]: validators[name]() }));
            }
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        if (!validate()) return;
        dispatch(register(formData));
    };

    const renderField = (
        name: keyof RegisterRequestDTO,
        label: string,
        type = 'text',
        placeholder = '',
        autoComplete = '',
    ) => (
        <div className={styles.inputGroup}>
            <label className={styles.label}>{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={onChange}
                className={`${styles.input}${fieldErrors[name] ? ` ${styles.hasError}` : ''}`}
                placeholder={placeholder}
                autoComplete={autoComplete}
            />
            {fieldErrors[name] && <span className={styles.fieldError}>{fieldErrors[name]}</span>}
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.headerBar}>
                <img
                    src="/icon.png"
                    alt="Logo"
                    className={styles.logo}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className={styles.brand}>BUILDING MANAGEMENT SYSTEM</span>
            </div>

            <div className={styles.card}>
                <h1 className={styles.heading}>Create Account</h1>
                <p className={styles.subheading}>Sign up to get started.</p>

                <form onSubmit={onSubmit} className={styles.form}>
                    <div className={styles.nameRow}>
                        {renderField('firstName', 'First Name', 'text', 'John', 'given-name')}
                        {renderField('lastName', 'Last Name', 'text', 'Doe', 'family-name')}
                    </div>
                    {renderField('email', 'Email', 'email', 'you@example.com', 'email')}
                    {renderField('password', 'Password', 'password', '••••••••', 'new-password')}

                    {isError && (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorMessage}>{message}</p>
                        </div>
                    )}

                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className={styles.footer}>
                        Already have an account?{' '}
                        <Link to={ROUTES.LOGIN} className={styles.link}>Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
