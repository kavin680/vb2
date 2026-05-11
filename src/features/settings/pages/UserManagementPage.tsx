import React, { useEffect } from 'react';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useUserManagement } from '../../../shared/hooks/useUserManagement';
import UserList from '../../users/components/UserList';
import UserForm from '../../users/components/UserForm';
import UserDetailModal from '../../users/components/UserDetailModal';

export const UserManagementPage: React.FC = () => {
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const {
        users, isLoading, showForm, setShowForm, editingId,
        selectedUser, setSelectedUser, notification, setNotification,
        formData, setFormData,
        loadUsers, resetForm, handleEdit, handleDelete, handleSubmit
    } = useUserManagement(confirm);

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div>
            <div style={headerSectionStyle}>
                <div>
                    <h1 style={titleStyle}>User Management</h1>
                    <p style={subtitleStyle}>Manage access controls and user accounts for your application.</p>
                </div>
            </div>

            <div style={cardStyle}>
                {notification && (
                    <div style={{
                        padding: '12px 16px',
                        marginBottom: '24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: notification.type === 'success' ? '#065f46' : '#991b1b',
                        border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span>{notification.message}</span>
                        <span
                            onClick={() => setNotification(null)}
                            style={{ cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
                        >
                            &times;
                        </span>
                    </div>
                )}

                {showForm ? (
                    <UserForm
                        formData={formData}
                        editingId={editingId}
                        onFormDataChange={setFormData}
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                    />
                ) : (
                    <UserList
                        users={users}
                        isLoading={isLoading}
                        onUserSelect={setSelectedUser}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddNew={() => setShowForm(true)}
                    />
                )}
            </div>

            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <ConfirmDialog />
        </div>
    );
};

const headerSectionStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '32px'
};

const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '8px'
};

const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#64748b'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};
