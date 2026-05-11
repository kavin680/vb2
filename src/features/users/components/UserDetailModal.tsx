import React from 'react';
import type { UserDTO } from '../../../shared/types/user.types';

interface UserDetailModalProps {
    user: UserDTO;
    onClose: () => void;
    onEdit: (user: UserDTO) => void;
    onDelete: (id: string) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
    user,
    onClose,
    onEdit,
    onDelete
}) => {
    return (
        <div style={detailOverlayStyle} onClick={onClose}>
            <div style={detailModalStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>User Details</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#6b7280' }}>
                        &times;
                    </button>
                </div>

                <div style={{ maxHeight: 'calc(80vh - 120px)', overflowY: 'auto', paddingRight: '12px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>ID:</span>
                            <span style={detailValueStyle}>{user.id}</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Name:</span>
                            <span style={detailValueStyle}>{user.firstName} {user.lastName}</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Email:</span>
                            <span style={detailValueStyle}>{user.email}</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Role:</span>
                            <span style={{
                                ...detailValueStyle,
                                ...badgeStyle,
                                backgroundColor: user.role === 'ADMIN' ? '#fef3c7' : '#dbeafe',
                                color: user.role === 'ADMIN' ? '#92400e' : '#1e40af'
                            }}>
                                {user.role}
                            </span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Status:</span>
                            <span style={{
                                ...detailValueStyle,
                                color: user.isActive ? '#059669' : '#dc2626',
                                fontWeight: 500
                            }}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Created At:</span>
                            <span style={detailValueStyle}>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Updated At:</span>
                            <span style={detailValueStyle}>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                    <button
                        onClick={() => onDelete(user.id)}
                        style={deleteBtnStyle}
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => onEdit(user)}
                        style={editBtnStyle}
                    >
                        Edit
                    </button>
                    <button
                        onClick={onClose}
                        style={cancelBtnStyle}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const detailOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100
};

const detailModalStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    width: '100%',
    maxWidth: 600,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
};

const detailRowStyle: React.CSSProperties = {
    display: 'flex',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6'
};

const detailLabelStyle: React.CSSProperties = {
    width: '140px',
    fontWeight: 500,
    color: '#6b7280',
    fontSize: '14px'
};

const detailValueStyle: React.CSSProperties = {
    flex: 1,
    color: '#111827',
    fontSize: '14px'
};

const badgeStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block'
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
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

export default UserDetailModal;
