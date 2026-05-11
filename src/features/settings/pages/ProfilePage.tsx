import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../../shared/api/userApi';
import { updateUserLocal } from '../../auth/authSlice';
import type { RootState } from '../../../app/store/store';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { validateEmail, validatePassword, validateRequired } from '../../../shared/utils/validation';

export const ProfilePage: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { ConfirmDialog } = useConfirmDialog();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const [editForm, setEditForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });

    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

    const displayName = user ? `${user.firstName} ${user.lastName}` : 'Guest User';

    const handleEditProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        const errors: Record<string, string | null> = {
            firstName: validateRequired(editForm.firstName, 'First name').error,
            lastName: validateRequired(editForm.lastName, 'Last name').error,
            email: validateEmail(editForm.email).error,
        };
        setFieldErrors(errors);
        if (Object.values(errors).some((e) => e !== null)) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await updateUser(user.id, {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
            });

            if (response.success && response.data) {
                const updatedUser = {
                    ...user,
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    email: editForm.email,
                };
                dispatch(updateUserLocal(updatedUser));
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditModalOpen(false);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to update profile.' });
            }
        } catch (error: unknown) {
            const axiosErr = error as { response?: { data?: { message?: string } } };
            setMessage({ type: 'error', text: axiosErr.response?.data?.message || 'An error occurred during update.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setFieldErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }

        const pwResult = validatePassword(passwordForm.newPassword);
        if (!pwResult.valid) {
            setFieldErrors({ newPassword: pwResult.error });
            return;
        }

        setIsLoading(true);
        setMessage(null);
        setFieldErrors({});

        try {
            const response = await updateUser(user.id, {
                password: passwordForm.newPassword,
            });

            if (response.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setIsPasswordModalOpen(false);
                setPasswordForm({ newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to change password.' });
            }
        } catch (error: unknown) {
            const axiosErr = error as { response?: { data?: { message?: string } } };
            setMessage({ type: 'error', text: axiosErr.response?.data?.message || 'An error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 style={titleStyle}>My Profile</h1>
            <p style={subtitleStyle}>Manage your personal information and account security.</p>

            {message && (
                <div style={{
                    padding: '12px 16px',
                    marginBottom: '24px',
                    borderRadius: '8px',
                    backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
                </div>
            )}

            <div style={cardStyle}>
                <div style={profileHeaderStyle}>
                    <div style={largeAvatarStyle}>
                        {user?.firstName?.charAt(0).toUpperCase() || 'G'}
                    </div>
                    <div>
                        <h2 style={nameStyle}>{displayName}</h2>
                        <span style={roleBadgeStyle}>{user?.role || 'USER'}</span>
                    </div>
                </div>

                <div style={infoGridStyle}>
                    <div style={infoItemStyle}>
                        <div style={labelStyle}>First Name</div>
                        <div style={valueStyle}>{user?.firstName}</div>
                    </div>
                    <div style={infoItemStyle}>
                        <div style={labelStyle}>Last Name</div>
                        <div style={valueStyle}>{user?.lastName}</div>
                    </div>
                    <div style={infoItemStyle}>
                        <div style={labelStyle}>Email Address</div>
                        <div style={valueStyle}>{user?.email || 'Not provided'}</div>
                    </div>
                    <div style={infoItemStyle}>
                        <div style={labelStyle}>Account Status</div>
                        <div style={{ ...valueStyle, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={dotStyle}></span> Active
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                    <button
                        onClick={() => {
                            setEditForm({
                                firstName: user?.firstName || '',
                                lastName: user?.lastName || '',
                                email: user?.email || '',
                            });
                            setFieldErrors({});
                            setIsEditModalOpen(true);
                        }}
                        style={editButtonStyle}
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={() => {
                            setFieldErrors({});
                            setIsPasswordModalOpen(true);
                        }}
                        style={passwordButtonStyle}
                    >
                        Change Password
                    </button>
                </div>
            </div>

            {isEditModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>Edit Profile</h3>
                        <form onSubmit={handleEditProfile}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ ...formGroupStyle, flex: 1 }}>
                                    <label style={inputLabelStyle}>First Name</label>
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        style={fieldErrors.firstName ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                                    />
                                    {fieldErrors.firstName && <span style={fieldErrorStyle}>{fieldErrors.firstName}</span>}
                                </div>
                                <div style={{ ...formGroupStyle, flex: 1 }}>
                                    <label style={inputLabelStyle}>Last Name</label>
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        style={fieldErrors.lastName ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                                    />
                                    {fieldErrors.lastName && <span style={fieldErrorStyle}>{fieldErrors.lastName}</span>}
                                </div>
                            </div>
                            <div style={formGroupStyle}>
                                <label style={inputLabelStyle}>Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    style={fieldErrors.email ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                                />
                                {fieldErrors.email && <span style={fieldErrorStyle}>{fieldErrors.email}</span>}
                            </div>
                            <div style={modalActionsStyle}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} style={cancelButtonStyle}>Cancel</button>
                                <button type="submit" disabled={isLoading} style={saveButtonStyle}>
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPasswordModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <div style={formGroupStyle}>
                                <label style={inputLabelStyle}>New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    style={fieldErrors.newPassword ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                                    required
                                />
                                {fieldErrors.newPassword && <span style={fieldErrorStyle}>{fieldErrors.newPassword}</span>}
                            </div>
                            <div style={formGroupStyle}>
                                <label style={inputLabelStyle}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    style={fieldErrors.confirmPassword ? { ...inputStyle, borderColor: '#dc2626' } : inputStyle}
                                    required
                                />
                                {fieldErrors.confirmPassword && <span style={fieldErrorStyle}>{fieldErrors.confirmPassword}</span>}
                            </div>
                            <div style={modalActionsStyle}>
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} style={cancelButtonStyle}>Cancel</button>
                                <button type="submit" disabled={isLoading} style={saveButtonStyle}>
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog />
        </div>
    );
};

const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' };
const subtitleStyle: React.CSSProperties = { fontSize: '16px', color: '#64748b', marginBottom: '32px' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const profileHeaderStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' };
const largeAvatarStyle: React.CSSProperties = { width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800 };
const nameStyle: React.CSSProperties = { fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' };
const roleBadgeStyle: React.CSSProperties = { backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const infoGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' };
const infoItemStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' };
const valueStyle: React.CSSProperties = { fontSize: '16px', color: '#334155', fontWeight: 500 };
const dotStyle: React.CSSProperties = { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' };
const editButtonStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginRight: '12px', fontSize: '14px' };
const passwordButtonStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' };

const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const modalTitleStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' };
const formGroupStyle: React.CSSProperties = { marginBottom: '20px' };
const inputLabelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const fieldErrorStyle: React.CSSProperties = { color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' };
const modalActionsStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' };
const cancelButtonStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' };
const saveButtonStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' };
