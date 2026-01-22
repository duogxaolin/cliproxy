import { useEffect, useState } from 'react';
import { UserLayout } from '../../components/layout';
import { Card, Button, Input, Badge, Spinner, Modal, ModalFooter } from '../../components/ui';
import { adminService, AdminUser } from '../../services/adminService';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [grantAmount, setGrantAmount] = useState('');
  const [grantDescription, setGrantDescription] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers(page, 20, search || undefined, statusFilter || undefined);
      setUsers(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search, statusFilter]);

  const handleGrantCredits = async () => {
    if (!selectedUser || !grantAmount) return;
    try {
      await adminService.grantCredits(selectedUser.id, parseFloat(grantAmount), grantDescription || undefined);
      setShowGrantModal(false);
      setSelectedUser(null);
      setGrantAmount('');
      setGrantDescription('');
      loadUsers();
    } catch (err) {
      console.error('Failed to grant credits:', err);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} ${user.username}?`)) return;
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      loadUsers();
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const openGrantModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowGrantModal(true);
  };

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage users, grant credits, and control access.</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by email or username..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <Card className="text-center py-12">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500">No users found</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consumed</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role === 'admin' ? 'info' : 'default'} size="sm">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{formatCost(user.credits.balance)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCost(user.credits.total_consumed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'active' ? 'success' : 'danger'} size="sm">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openGrantModal(user)}>
                          Grant Credits
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={user.status === 'active' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Grant Credits Modal */}
      <Modal
        isOpen={showGrantModal && !!selectedUser}
        onClose={() => setShowGrantModal(false)}
        title={`Grant Credits to ${selectedUser?.username}`}
        description="Add credits to this user's account."
      >
        <div className="space-y-4">
          <Input
            label="Amount ($)"
            type="number"
            step={0.01}
            min={0}
            value={grantAmount}
            onChange={(e) => setGrantAmount(e.target.value)}
            placeholder="10.00"
            required
          />
          <Input
            label="Description (optional)"
            value={grantDescription}
            onChange={(e) => setGrantDescription(e.target.value)}
            placeholder="Bonus credits"
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowGrantModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleGrantCredits} disabled={!grantAmount || parseFloat(grantAmount) <= 0}>
            Grant Credits
          </Button>
        </ModalFooter>
      </Modal>
    </UserLayout>
  );
}

