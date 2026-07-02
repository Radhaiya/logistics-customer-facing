import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson, getApiErrorMessage } from './client'
import type { RoleResponse, PermissionResponse, RoleRequest } from '../types'
import { notifications } from '@mantine/notifications'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchJson<RoleResponse[]>('/api/roles'),
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => fetchJson<PermissionResponse[]>('/api/roles/permissions'),
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleRequest) =>
      fetchJson<RoleResponse>('/api/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      notifications.show({ title: 'Role created', message: 'Role has been added successfully.', color: 'green' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Failed to create role', message: getApiErrorMessage(err), color: 'red' })
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleRequest }) =>
      fetchJson<RoleResponse>(`/api/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      notifications.show({ title: 'Role updated', message: 'Role has been updated successfully.', color: 'green' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Failed to update role', message: getApiErrorMessage(err), color: 'red' })
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      fetchJson<void>(`/api/roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      notifications.show({ title: 'Role deleted', message: 'Role has been removed.', color: 'green' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Failed to delete role', message: getApiErrorMessage(err), color: 'red' })
    },
  })
}
