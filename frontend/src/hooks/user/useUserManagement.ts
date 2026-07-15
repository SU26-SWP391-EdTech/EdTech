import { useState, useMemo, useEffect } from 'react';
import type { User, Role, Status } from '../../types/user/user-management.types';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/user/user.service';

/**
 * Custom hook quản lý Danh sách và CRUD người dùng dành cho Quản trị viên (Admin User Management).
 * Hỗ trợ các chức năng:
 * - Tải danh sách người dùng (`fetchUsers`), chuyển đổi định dạng thực thể từ Backend sang DTO Frontend (`mapBackendUserToFrontend`).
 * - Lọc danh sách theo từ khóa tìm kiếm (search), vai trò (roleFilter), và trạng thái (statusFilter).
 * - Sắp xếp danh sách (sắp xếp theo tên hoặc ngày tham gia).
 * - Lưu người dùng (tạo mới `createUser` hoặc cập nhật `updateUser`).
 * - Vô hiệu hóa người dùng (thay vì xóa cứng, tắt Email Verification bằng cách đưa trạng thái `isEmailVerified` về `false`).
 */
export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);                               // Danh sách người dùng gốc
  const [loading, setLoading] = useState(false);                                 // Trạng thái đang tải danh sách
  const [saving, setSaving] = useState(false);                                   // Trạng thái đang lưu biểu mẫu
  const [error, setError] = useState<string | null>(null);                       // Lưu giữ thông báo lỗi
  const [search, setSearch] = useState('');                                      // Từ khóa tìm kiếm người dùng
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');             // Lọc theo vai trò người dùng
  const [statusFilter, setStatusFilter] = useState<string>('All Status');         // Lọc theo trạng thái người dùng
  
  // Trạng thái hiển thị các modal (thêm/sửa, xem chi tiết, cảnh báo xóa)
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined); // Người dùng đang được chọn xem/sửa
  const [userToDelete, setUserToDelete] = useState<User | undefined>(undefined); // Người dùng chuẩn bị bị vô hiệu hóa
  const [sortField, setSortField] = useState<'name' | 'joined'>('joined');       // Trường dữ liệu sắp xếp
  const [sortAsc, setSortAsc] = useState(false);                                 // Chiều sắp xếp (Tăng/Giảm dần)

  /**
   * Ánh xạ thông tin thực thể User trả về từ Backend sang định dạng giao diện Frontend mong muốn.
   * Chuyển đổi trạng thái, vai trò, ngày tham gia và tạo màu sắc đại diện avatar ngẫu nhiên.
   */
  const mapBackendUserToFrontend = (u: any): User => {
    let role: Role = 'Learner';
    const backendRole = u.role?.roleName || '';
    if (backendRole === 'admin') role = 'Admin';
    else if (backendRole === 'course provider') role = 'Course Provider';
    else if (backendRole === 'academic manager') role = 'Academic Manager';

    // Trạng thái hoạt động dựa trên email đã xác minh hay chưa
    const status: Status = u.isEmailVerified ? 'Active' : 'Inactive';

    const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : '—';

    // Sinh màu avatar ngẫu nhiên dựa trên modulo của userId
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

  /**
   * Ánh xạ vai trò hiển thị trên giao diện thành giá trị chuỗi lưu trong CSDL của Backend.
   */
  const mapFrontendRoleToBackend = (role: Role): string => {
    switch (role) {
      case 'Admin': return 'admin';
      case 'Learner': return 'learner';
      case 'Academic Manager': return 'academic manager';
      case 'Course Provider': return 'course provider';
      default: return 'learner';
    }
  };

  /**
   * Tải toàn bộ danh sách người dùng từ hệ thống.
   */
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

  // --- HÀM TÍNH TOÁN DỮ LIỆU ĐÃ QUA BỘ LỌC (COMPUTED MEMO) ---
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

  /**
   * Thay đổi tiêu chí sắp xếp hoặc đảo ngược thứ tự sắp xếp hiện tại.
   * 
   * @param field - Trường thông tin cần sắp xếp ('name' | 'joined')
   */
  const toggleSort = (field: 'name' | 'joined') => {
    if (sortField === field) setSortAsc(a => !a);
    else { setSortField(field); setSortAsc(true); }
  };

  /**
   * Lưu thông tin người dùng được soạn trong biểu mẫu modal.
   * Nếu có người dùng đang chọn (`selectedUser`), thực hiện gọi API chỉnh sửa (`updateUser`).
   * Ngược lại, thực hiện gọi API tạo mới người dùng (`createUser`).
   */
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
      await fetchUsers(); // Tải lại danh sách sau khi cập nhật thành công
    } catch (err: any) {
      console.error('Failed to save user', err);
      alert(err.response?.data?.message || 'Failed to save user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Thực hiện vô hiệu hóa người dùng bằng cách gỡ bỏ email verification.
   * 
   * @param id - ID của người dùng cần tắt kích hoạt
   */
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
