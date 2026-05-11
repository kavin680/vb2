import { useState } from 'react';
import {
    fetchAllUsers,
    createUser,
    updateUser,
    deleteUser,
} from '../api/userApi';
import type { UserDTO, CreateUserDTO, UpdateUserDTO, UserRole } from '../types/user.types';

/**
 * Form state for user create / edit forms.
 * Field names match the backend DTO contract.
 */
export interface UserFormData {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
    isActive: boolean;
}

const DEFAULT_FORM_DATA: UserFormData = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'USER',
    isActive: true,
};

export interface ConfirmFn {
    (opts: { title: string; message: string; confirmText: string; confirmColor: string }): Promise<boolean>;
}

/**
 * Shared hook for user CRUD operations.
 * Used by both `UserManagementModal` and `UserManagementPage`.
 */
export function useUserManagement(confirm: ConfirmFn) {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [formData, setFormData] = useState<UserFormData>(DEFAULT_FORM_DATA);

    const loadUsers = () => {
        setIsLoading(true);
        fetchAllUsers()
            .then((response) => {
                if (response.success && response.data) {
                    if (Array.isArray(response.data)) {
                        setUsers(response.data as unknown as UserDTO[]);
                    } else if (response.data.users && Array.isArray(response.data.users)) {
                        setUsers(response.data.users);
                    } else {
                        setUsers([]);
                    }
                } else {
                    setNotification({ type: 'error', message: response.message || 'Failed to load users' });
                }
            })
            .catch(() => {
                setNotification({ type: 'error', message: 'Failed to load users' });
            })
            .finally(() => setIsLoading(false));
    };

    const resetForm = () => {
        setFormData(DEFAULT_FORM_DATA);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (user: UserDTO) => {
        setFormData({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            password: '',
            role: user.role,
            isActive: user.isActive,
        });
        setEditingId(user.id);
        setShowForm(true);
        setSelectedUser(null);
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            confirmText: 'Delete',
            confirmColor: '#ef4444',
        });

        if (!isConfirmed) return;

        try {
            const response = await deleteUser(id);
            if (response.success) {
                setSelectedUser(null);
                loadUsers();
                setNotification({ type: 'success', message: 'User deleted successfully' });
            } else {
                setNotification({ type: 'error', message: response.message || 'Failed to delete user' });
            }
            setTimeout(() => setNotification(null), 3000);
        } catch {
            setNotification({ type: 'error', message: 'Failed to delete user' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                const updateData: UpdateUserDTO = {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    role: formData.role,
                    isActive: formData.isActive,
                };
                if (formData.password.trim()) {
                    updateData.password = formData.password;
                }
                const response = await updateUser(editingId, updateData);
                if (response.success) {
                    setNotification({ type: 'success', message: 'User updated successfully' });
                    resetForm();
                    loadUsers();
                } else {
                    setNotification({ type: 'error', message: response.message || 'Failed to update user' });
                }
            } else {
                const createData: CreateUserDTO = {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    password: formData.password,
                    role: formData.role,
                };
                const response = await createUser(createData);
                if (response.success) {
                    setNotification({ type: 'success', message: 'User created successfully' });
                    resetForm();
                    loadUsers();
                } else {
                    setNotification({ type: 'error', message: response.message || 'Failed to create user' });
                }
            }
            setTimeout(() => setNotification(null), 3000);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError.response?.data?.message || 'Failed to save user';
            setNotification({ type: 'error', message: errorMessage });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return {
        users,
        isLoading,
        showForm,
        setShowForm,
        editingId,
        selectedUser,
        setSelectedUser,
        notification,
        setNotification,
        formData,
        setFormData,
        loadUsers,
        resetForm,
        handleEdit,
        handleDelete,
        handleSubmit,
    };
}
