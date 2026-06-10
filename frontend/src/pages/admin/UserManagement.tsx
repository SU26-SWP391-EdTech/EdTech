import { Download, Plus, Search, ArrowUpDown, Eye, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useUserManagement } from '../../components/UserManagement/useUserManagement';
import { RoleBadge } from '../../components/UserManagement/RoleBadge';
import { StatusBadge } from '../../components/UserManagement/StatusBadge';
import { FilterSelect } from '../../components/UserManagement/FilterSelect';
import { UserModal } from '../../components/UserManagement/UserModal';
import { ViewUserModal } from '../../components/UserManagement/ViewUserModal';
import { DeleteConfirmationModal } from '../../components/UserManagement/DeleteConfirmationModal';

const ROLES = ['All Roles', 'Admin', 'Learner', 'Academic Manager', 'Course Provider'];
const STATUSES = ['All Status', 'Active', 'Inactive'];

export function UserManagement() {
  const {
    users,
    loading,
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
    filtered,
    toggleSort,
    handleSaveUser,
    handleDeleteUser,
    fetchUsers,
  } = useUserManagement();

  return (
    <>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1376px] mx-auto px-8 py-8">

          {/* ── Page Header ── */}
          <div className="mb-7">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[#111827] mb-1" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                  User Management
                </h1>
                <p className="text-[#6B7280] text-sm">
                  Manage platform users, assign roles, and control access permissions across the organization.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                  <Download className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={() => { setSelectedUser(undefined); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Plus className="w-4 h-4" /> Create User
                </button>
              </div>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-12 gap-5">

            {/* Left: Table (9 cols) */}
            <div className="col-span-12 flex flex-col gap-4">

              {/* Toolbar */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3.5 flex items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                  />
                </div>

                <div className="h-5 w-px bg-[#E5E7EB]" />

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <FilterSelect value={roleFilter} options={ROLES} onChange={setRoleFilter} />
                  <FilterSelect value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
                </div>

                <div className="h-5 w-px bg-[#E5E7EB]" />

                {/* Sort */}
                <button
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort by Name
                </button>

                <div className="ml-auto flex items-center gap-2">
                  {/* Results count */}
                  <span className="text-xs text-[#9CA3AF]">
                    {filtered.length} of {users.length} users
                  </span>
                  {(search || roleFilter !== 'All Roles' || statusFilter !== 'All Status') && (
                    <button
                      onClick={() => { setSearch(''); setRoleFilter('All Roles'); setStatusFilter('All Status'); }}
                      className="flex items-center gap-1 text-xs text-[#E11D48] hover:text-[#BE123C]"
                      style={{ fontWeight: 500 }}
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E11D48] mb-3"></div>
                    <p className="text-sm text-[#6B7280]">Loading users...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <AlertCircle className="w-8 h-8 text-[#DC2626] mb-3" />
                    <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{error}</p>
                    <button
                      onClick={fetchUsers}
                      className="mt-3 px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs hover:bg-[#F3F4F6]"
                      style={{ fontWeight: 500 }}
                    >
                      Retry
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-[#D1D5DB]" />
                    </div>
                    <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>No users found</p>
                    <p className="text-xs text-[#6B7280] mt-1 mb-4">Try adjusting your search or filter criteria.</p>
                    <button
                      onClick={() => { setSearch(''); setRoleFilter('All Roles'); setStatusFilter('All Status'); }}
                      className="px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs hover:bg-[#F3F4F6]"
                      style={{ fontWeight: 500 }}
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '22%' }}>
                            <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-[#111827]">
                              Full Name <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '20%' }}>Email</th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '16%' }}>Role</th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Status</th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>
                            <button onClick={() => toggleSort('joined')} className="flex items-center gap-1 hover:text-[#111827]">
                              Created <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Change At</th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '6%' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((user, i) => (
                          <tr
                            key={user.id}
                            className={`group hover:bg-[#FAFAFA] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#F3F4F6]' : ''} ${i % 2 === 1 ? 'bg-[#FAFAFA]/40' : ''}`}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden"
                                  style={{ backgroundColor: user.avatarColor, fontSize: '11px', fontWeight: 700 }}
                                >
                                  {user.avatar.startsWith('data:') || user.avatar.startsWith('http') ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    user.avatar
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 500 }}>{user.name}</p>
                                  <p className="text-[10px] text-[#9CA3AF]">ID: {user.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-[#6B7280] truncate block">{user.email}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <RoleBadge role={user.role} />
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={user.status} />
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-[#6B7280]">{user.joined}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-[#6B7280]">{user.updatedAt || '—'}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                                  className="p-1.5 hover:bg-[#EFF6FF] rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                                </button>
                                <button
                                  onClick={() => { setSelectedUser(user); setShowModal(true); }}
                                  className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#6B7280]" />
                                </button>
                                <button
                                  onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}
                                  className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#FCA5A5]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="px-5 py-3.5 border-t border-[#F3F4F6] flex items-center justify-between bg-[#FAFAFA]">
                      <p className="text-xs text-[#6B7280]">
                        Showing <span style={{ fontWeight: 500 }} className="text-[#111827]">{filtered.length}</span> of <span style={{ fontWeight: 500 }} className="text-[#111827]">{users.length}</span> users
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>Previous</button>
                        {[1, 2, 3].map(p => (
                          <button
                            key={p}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${p === 1 ? 'bg-[#E11D48] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'}`}
                            style={{ fontWeight: p === 1 ? 600 : 400 }}
                          >{p}</button>
                        ))}
                        <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>Next</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ── User Modal (Create/Edit) ── */}
      {showModal && <UserModal user={selectedUser} onClose={() => setShowModal(false)} onSave={handleSaveUser} />}

      {/* ── View User Modal ── */}
      {showViewModal && selectedUser && <ViewUserModal user={selectedUser} onClose={() => setShowViewModal(false)} />}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && userToDelete && (
        <DeleteConfirmationModal
          user={userToDelete}
          onClose={() => { setShowDeleteModal(false); setUserToDelete(undefined); }}
          onConfirm={async () => {
            await handleDeleteUser(userToDelete.id);
            setShowDeleteModal(false);
            setUserToDelete(undefined);
          }}
        />
      )}
    </>
  );
}
