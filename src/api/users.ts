import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson, getApiErrorMessage } from './client'
import type { UserResponse, RegisterUserRequest, AssignRolesRequest } from '../types'
import { notifications } from '@mantine/notifications'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchJson<UserResponse[]>('/api/users'),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchJson<UserResponse>(`/api/users/${id}`),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RegisterUserRequest) =>
      fetchJson<UserResponse>('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      notifications.show({ title: 'User created', message: 'User has been added successfully.', color: 'green' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Failed to create user', message: getApiErrorMessage(err), color: 'red' })
    },
  })
}

export function useAssignRoles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignRolesRequest }) =>
      fetchJson<UserResponse>(`/api/users/${id}/roles`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      notifications.show({ title: 'Roles updated', message: 'User roles have been assigned.', color: 'green' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Failed to update roles', message: getApiErrorMessage(err), color: 'red' })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      fetchJson<void>(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      notifications.show({ title: 'User deleted', message: 'User has been removed.', color: 'green' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Failed to delete user', message: getApiErrorMessage(err), color: 'red' })
    },
  })
}
