import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../authSlice';
import type { RootState, AppDispatch } from '../../../app/store/store';
import type { LoginRequestDTO } from '../../../shared/types/auth.types';
import { validateEmail, validatePassword } from '../../../shared/utils/validation';
import { ROUTES } from '../../../shared/constants/routes';
import styles from '../auth.module.css';

export function LoginScreen() {
    const [formData, setFormData] = useState<LoginRequestDTO>({
        email: '',
        password: '',
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
    const [submitted, setSubmitted] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state: RootState) => state.auth,
    );

    useEffect(() => {
        if (isSuccess || user) {
            navigate(ROUTES.HOME);
        }
    }, [user, isSuccess, navigate]);

    useEffect(() => {
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const validate = (): boolean => {
        const emailResult = validateEmail(formData.email);
        const passwordResult = validatePassword(formData.password);

        const errors = {
            email: emailResult.error,
            password: passwordResult.error,
        };

        setFieldErrors(errors);
        return emailResult.valid && passwordResult.valid;
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (submitted) {
            if (name === 'email') {
                setFieldErrors((prev) => ({
                    ...prev,
                    email: validateEmail(value).error,
                }));
            }

            if (name === 'password') {
                setFieldErrors((prev) => ({
                    ...prev,
                    password: validatePassword(value).error,
                }));
            }
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validate()) return;

        dispatch(login(formData));
    };

    return (
        <div className={styles.container}>
            {/* LEFT BRANDING PANEL */}
            <div className={styles.leftPanel}>
                {!logoError ? (
                    <div className={styles.logoWrapper}>
                        <img
                            src="/login.png"
                            alt="Company Logo"
                            className={styles.mainLogo}
                            onError={() => setLogoError(true)}
                        />
                    </div>
                ) : (
                    <div className={styles.logoFallback}></div>
                )}

                <div className={styles.brandText}>
                    <p>Product by Abc PVT LTD</p>
                </div>
            </div>

            {/* RIGHT LOGIN PANEL */}
            <div className={styles.rightPanel}>
                <div className={styles.card}>
                    <h1 className={styles.heading}>Sign In</h1>
                    <form onSubmit={onSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onChange}
                                className={`${styles.input} ${fieldErrors.email ? styles.hasError : ''
                                    }`}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                            {fieldErrors.email && (
                                <span className={styles.fieldError}>
                                    {fieldErrors.email}
                                </span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={onChange}
                                className={`${styles.input} ${fieldErrors.password ? styles.hasError : ''
                                    }`}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            {fieldErrors.password && (
                                <span className={styles.fieldError}>
                                    {fieldErrors.password}
                                </span>
                            )}
                        </div>

                        {isError && (
                            <div className={styles.errorContainer}>
                                <p className={styles.errorMessage}>{message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.button}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className={styles.footer}>
                            Don&apos;t have an account?{' '}
                            <Link to={ROUTES.REGISTER} className={styles.link}>
                                Register
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
