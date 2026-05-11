import React, { useEffect } from 'react';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { useUserManagement } from '../../shared/hooks/useUserManagement';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import UserDetailModal from './components/UserDetailModal';

type UserManagementModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const {
        users, isLoading, showForm, setShowForm, editingId,
        selectedUser, setSelectedUser, notification, setNotification,
        formData, setFormData,
        loadUsers, resetForm, handleEdit, handleDelete, handleSubmit
    } = useUserManagement(confirm);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
            setShowForm(false);
            setSelectedUser(null);
            setNotification(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0, fontSize: '20px' }}>User Management</h3>
                    <button onClick={onClose} style={closeButtonStyle}>
                        &times;
                    </button>
                </div>

                <div style={contentWrapperStyle}>
                    <div style={mainContentStyle}>
                        {notification && (
                            <div style={{
                                padding: '10px 12px',
                                marginBottom: '16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: notification.type === 'success' ? '#047857' : '#b91c1c',
                                border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span>{notification.message}</span>
                                <span
                                    onClick={() => setNotification(null)}
                                    style={{ cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                    &times;
                                </span>
                            </div>
                        )}

                        <h4 style={sectionTitleStyle}>Users</h4>

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
        </div>
    );
};

const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 900,
    display: 'flex',
    flexDirection: 'column'
};

const modalStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    zIndex: 10
};

const closeButtonStyle: React.CSSProperties = {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    color: '#6b7280',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
};

const contentWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
};

const mainContentStyle: React.CSSProperties = {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
};

const sectionTitleStyle: React.CSSProperties = {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827'
};

export default UserManagementModal;
