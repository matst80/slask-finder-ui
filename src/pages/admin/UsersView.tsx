import { Edit, Trash2, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Dialog } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { deleteUser, getUsers, updateUser } from '../../lib/datalayer/api'
import { User, UserUpdateRequest } from '../../lib/types'

const useUsers = () => {
  return useSWR('/admin/users', getUsers, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  })
}

const useUpdateUser = () => {
  return useSWRMutation(
    '/admin/users',
    (_, { arg }: { arg: { id: string; data: UserUpdateRequest } }) => {
      return updateUser(arg.id, arg.data)
    },
  )
}

const useDeleteUser = () => {
  return useSWRMutation('/admin/users', (_, { arg }: { arg: string }) => {
    return deleteUser(arg)
  })
}

const UserEditDialog = ({
  user,
  open,
  onClose,
  onSave,
}: {
  user: User | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UserUpdateRequest) => void
}) => {
  const [formData, setFormData] = useState<UserUpdateRequest>({})

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      })
    }
  }, [user])

  const handleSave = () => {
    if (user) {
      onSave(user.id, formData)
      onClose()
    }
  }

  const handleChange = (
    field: keyof UserUpdateRequest,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) return null

  return (
    <Dialog open={open} setOpen={onClose}>
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Display Name
            </label>
            <Input
              value={formData.displayName || ''}
              onChange={(e) => handleChange('displayName', e.target.value)}
              placeholder="Display Name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.isAdmin || false}
              onChange={(e) => handleChange('isAdmin', e.target.checked)}
            />
            <label htmlFor="isAdmin" className="text-sm font-medium">
              Admin User
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            onClick={onClose}
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

const UserRow = ({
  user,
  onEdit,
  onDelete,
}: {
  user: User
  onEdit: (user: User) => void
  onDelete: (id: string) => void
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2">{user.id}</td>
      <td className="px-4 py-2 font-medium">{user.displayName}</td>
      <td className="px-4 py-2">{user.email}</td>
      <td className="px-4 py-2">{user.name}</td>
      <td className="px-4 py-2">
        <Badge
          className={
            user.isAdmin
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }
        >
          {user.isAdmin ? 'Admin' : 'User'}
        </Badge>
      </td>
      <td className="px-4 py-2">
        <div className="flex space-x-2">
          <Button
            onClick={() => onEdit(user)}
            className="bg-blue-500 text-white hover:bg-blue-600 p-2"
            aria-label="Edit user"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(user.id)}
            className="bg-red-500 text-white hover:bg-red-600 p-2"
            aria-label="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export const UsersView = () => {
  const { data: users, isLoading, error, mutate } = useUsers()
  const { trigger: updateUserTrigger } = useUpdateUser()
  const { trigger: deleteUserTrigger } = useDeleteUser()

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = async (id: string, userData: UserUpdateRequest) => {
    try {
      await updateUserTrigger({ id, data: userData })
      mutate() // Refresh the users list
    } catch (error) {
      console.error('Failed to update user:', error)
      // You could add a toast notification here
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserTrigger(id)
        mutate() // Refresh the users list
      } catch (error) {
        console.error('Failed to delete user:', error)
        // You could add a toast notification here
      }
    }
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingUser(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">
          Error loading users: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-gray-600">
                Manage user accounts and permissions
              </p>
            </div>
            <Button className="bg-green-500 text-white hover:bg-green-600 flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!users || users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold">ID</th>
                    <th className="text-left px-4 py-3 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Display Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserEditDialog
        user={editingUser}
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveUser}
      />
    </div>
  )
}
