import { useState, useMemo, useEffect } from 'react';
import type { User, Role, Status } from '../../types/user/user-management.types';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/user/user.service';

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<User | undefined>(undefined);
  const [sortField, setSortField] = useState<'name' | 'joined'>('joined');
  const [sortAsc, setSortAsc] = useState(false);

  const mapBackendUserToFrontend = (u: any): User => {
    let role: Role = 'Learner';
    const backendRole = u.role?.roleName || '';
    if (backendRole === 'admin') role = 'Admin';
    else if (backendRole === 'course provider') role = 'Course Provider';
    else if (backendRole === 'academic manager') role = 'Academic Manager';

    const status: Status = u.isEmailVerified ? 'Active' : 'Inactive';

    const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : '—';

    const colors = ['#E11D48', '#7C3AED', '#2563EB', '#16A34A', '#D97706', '#0891B2'];
    const avatarColor = colors[u.userId % colors.length];

    const updatedAtDate = u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + new Date(u.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined;

    return {
      id: u.userId,
      name: u.fullName || 'No Name',
      email: u.email,
      role,
      status,
      joined: joinedDate,
      avatar: u.avatar || (u.fullName ? u.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'),
      avatarColor,
      lastSeen: '—',
      updatedAt: updatedAtDate,
    };
  };

  const mapFrontendRoleToBackend = (role: Role): string => {
    switch (role) {
      case 'Admin': return 'admin';
      case 'Learner': return 'learner';
      case 'Academic Manager': return 'academic manager';
      case 'Course Provider': return 'course provider';
      default: return 'learner';
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data.map(mapBackendUserToFrontend));
    } catch (err: any) {
      console.error('Failed to fetch users', err);
      setError('Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    return users
      .filter(u => {
        const q = search.toLowerCase();
        const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        const matchRole = roleFilter === 'All Roles' || u.role === roleFilter;
        const matchStatus = statusFilter === 'All Status' || u.status === statusFilter;
        return matchQ && matchRole && matchStatus;
      })
      .sort((a, b) => {
        const dir = sortAsc ? 1 : -1;
        return sortField === 'name'
          ? a.name.localeCompare(b.name) * dir
          : (a.id - b.id) * dir;
      });
  }, [users, search, roleFilter, statusFilter, sortField, sortAsc]);

  const toggleSort = (field: 'name' | 'joined') => {
    if (sortField === field) setSortAsc(a => !a);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleSaveUser = async (userData: {
    name: string;
    email: string;
    role: Role;
    status: Status;
    avatar: string;
    avatarColor: string;
    password?: string;
  }) => {
    try {
      setSaving(true);
      if (selectedUser) {
        await updateUser(selectedUser.id, {
          fullName: userData.name,
          avatar_url: userData.avatar,
          isEmailVerified: userData.status === 'Active',
        });
      } else {
        await createUser({
          fullName: userData.name,
          email: userData.email,
          password: userData.password,
          roleName: mapFrontendRoleToBackend(userData.role),
          avatar_url: userData.avatar,
          isEmailVerified: userData.status === 'Active',
        });
      }
      setShowModal(false);
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to save user', err);
      alert(err.response?.data?.message || 'Failed to save user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      setLoading(true);
      await updateUser(id, { isEmailVerified: false });
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to deactivate user', err);
      alert(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    saving,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    showModal,
    setShowModal,
    showViewModal,
    setShowViewModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedUser,
    setSelectedUser,
    userToDelete,
    setUserToDelete,
    sortField,
    sortAsc,
    filtered,
    toggleSort,
    handleSaveUser,
    handleDeleteUser,
    fetchUsers,
  };
}
