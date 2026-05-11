import React from 'react';
import type { UserDTO } from '../../../shared/types/user.types';

interface UserListProps {
    users: UserDTO[];
    isLoading: boolean;
    onUserSelect: (user: UserDTO) => void;
    onEdit: (user: UserDTO) => void;
    onDelete: (id: string) => void;
    onAddNew: () => void;
}

const UserList: React.FC<UserListProps> = ({
    users = [],
    isLoading,
    onUserSelect,
    onEdit,
    onDelete,
    onAddNew
}) => {
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button
                    onClick={onAddNew}
                    style={{ ...saveBtnStyle, padding: '8px 12px', fontSize: '13px' }}
                >
                    + Add New User
                </button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading users...</div>
            ) : (users?.length ?? 0) > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>Role</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr
                                    key={user.id}
                                    style={trStyle}
                                    onClick={() => onUserSelect(user)}
                                    className="hover-row"
                                >
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{user.email}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            ...badgeStyle,
                                            backgroundColor: user.role === 'ADMIN' ? '#fef3c7' : '#dbeafe',
                                            color: user.role === 'ADMIN' ? '#92400e' : '#1e40af'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            ...badgeStyle,
                                            backgroundColor: user.isActive ? '#d1fae5' : '#fee2e2',
                                            color: user.isActive ? '#065f46' : '#991b1b'
                                        }}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => onEdit(user)}
                                                style={editBtnStyle}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(user.id)}
                                                style={deleteBtnStyle}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .hover-row:hover { background-color: #f9fafb !important; cursor: pointer; }
                    `}} />
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No users found.</div>
            )}
        </>
    );
};

const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    textAlign: 'left'
};

const thStyle: React.CSSProperties = {
    borderBottom: '2px solid #e5e7eb',
    padding: '12px 8px',
    fontWeight: 600,
    color: '#374151'
};

const tdStyle: React.CSSProperties = {
    borderBottom: '1px solid #e5e7eb',
    padding: '12px 8px',
    color: '#4b5563'
};

const trStyle: React.CSSProperties = {
    transition: 'background-color 0.1s'
};

const badgeStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block'
};

const editBtnStyle: React.CSSProperties = {
    padding: '6px 10px',
    backgroundColor: '#fff',
    border: '1px solid #3b82f6',
    borderRadius: 4,
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500
};

const deleteBtnStyle: React.CSSProperties = {
    padding: '6px 10px',
    backgroundColor: '#fff',
    border: '1px solid #ef4444',
    borderRadius: 4,
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500
};

const saveBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
};

export default UserList;
