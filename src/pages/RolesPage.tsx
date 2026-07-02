import { useMemo, useState } from 'react'
import type { FormEventHandler } from 'react'
import type { UseFormReturnType } from '@mantine/form'
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconEdit, IconPlus, IconSearch, IconShield, IconTrash } from '@tabler/icons-react'
import { useCreateRole, useDeleteRole, usePermissions, useRoles, useUpdateRole } from '../api/roles'
import { EmptyState, ErrorState, LoadingState, PageFrame, PageHeader } from '../components/Feedback'
import type { PermissionResponse, RoleResponse } from '../types'

type RoleValues = {
  name: string
  description: string
  permissionIds: number[]
}

export function RolesPage() {
  const { data: roles, isLoading, error, refetch } = useRoles()
  const permissionsQuery = usePermissions()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const [opened, { open, close }] = useDisclosure()
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<RoleResponse | null>(null)
  const [search, setSearch] = useState('')

  const form = useForm<RoleValues>({
    initialValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Role name is required'),
    },
  })

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return roles ?? []

    return (roles ?? []).filter((role) =>
      [role.name, role.description, ...role.permissions]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [roles, search])

  const permissionsByModule = useMemo(() => {
    return (permissionsQuery.data ?? []).reduce<Record<string, PermissionResponse[]>>((acc, permission) => {
      ;(acc[permission.module] ??= []).push(permission)
      return acc
    }, {})
  }, [permissionsQuery.data])

  const openCreate = () => {
    setEditingRole(null)
    form.setValues({ name: '', description: '', permissionIds: [] })
    form.resetDirty()
    open()
  }

  const openEdit = (role: RoleResponse) => {
    const permissionIds =
      permissionsQuery.data
        ?.filter((permission) => role.permissions.includes(permission.name))
        .map((permission) => permission.id) ?? []

    setEditingRole(role)
    form.setValues({
      name: role.name,
      description: role.description,
      permissionIds,
    })
    form.resetDirty()
    open()
  }

  const handleSubmit = form.onSubmit((values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      permissionIds: values.permissionIds,
    }

    if (editingRole) {
      updateRole.mutate(
        { id: editingRole.id, data: payload },
        { onSuccess: close },
      )
      return
    }

    createRole.mutate(payload, { onSuccess: close })
  })

  const handleDeleteRole = () => {
    if (!deleteConfirm) return
    deleteRole.mutate(deleteConfirm.id, {
      onSuccess: () => setDeleteConfirm(null),
    })
  }

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Administration"
        title="Roles"
        meta={
          <Text size="sm" c="dimmed">
            {roles?.length ?? 0} access groups
          </Text>
        }
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            Create role
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading roles" />
      ) : error ? (
        <ErrorState error={error} title="Roles unavailable" onRetry={() => void refetch()} />
      ) : (
        <Paper withBorder radius="md" p="md" className="app-surface">
          <Stack gap="md">
            <Group justify="space-between">
              <TextInput
                placeholder="Search roles, permissions"
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                w={{ base: '100%', sm: 360 }}
              />
              <Badge variant="light" color="cyan">
                {filteredRoles.length} shown
              </Badge>
            </Group>

            {filteredRoles.length === 0 ? (
              <EmptyState
                title={roles?.length ? 'No matching roles' : 'No roles'}
                message={roles?.length ? 'Adjust the search term.' : 'Create the first role.'}
                icon={roles?.length ? 'search' : 'database'}
                action={
                  !roles?.length && (
                    <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
                      Create role
                    </Button>
                  )
                }
              />
            ) : (
              <Table.ScrollContainer minWidth={860}>
                <Table highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Permissions</Table.Th>
                      <Table.Th w={120}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredRoles.map((role) => (
                      <Table.Tr key={role.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <ActionIcon variant="light" radius="md" size="md" aria-label="Role">
                              <IconShield size={16} />
                            </ActionIcon>
                            <Stack gap={0} style={{ minWidth: 0 }}>
                              <Text size="sm" fw={650} truncate>
                                {role.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                ID {role.id}
                              </Text>
                            </Stack>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={2}>
                            {role.description || 'No description'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            {role.permissions.length > 0 ? (
                              <>
                                {role.permissions.slice(0, 6).map((permission) => (
                                  <Badge key={permission} size="sm" variant="light" color="cyan">
                                    {permission}
                                  </Badge>
                                ))}
                                {role.permissions.length > 6 && (
                                  <Badge size="sm" variant="light" color="gray">
                                    +{role.permissions.length - 6}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <Text size="xs" c="dimmed">
                                No permissions
                              </Text>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            <Tooltip label="Edit">
                              <ActionIcon
                                variant="subtle"
                                color="cyan"
                                onClick={() => openEdit(role)}
                                aria-label="Edit role"
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => setDeleteConfirm(role)}
                                aria-label="Delete role"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Stack>
        </Paper>
      )}

      <RoleFormModal
        opened={opened}
        onClose={close}
        editingRole={editingRole}
        form={form}
        onSubmit={handleSubmit}
        permissionsByModule={permissionsByModule}
        permissionsLoading={permissionsQuery.isLoading}
        permissionsError={permissionsQuery.error}
        loading={createRole.isPending || updateRole.isPending}
      />

      <DeleteRoleModal
        role={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteRole}
        loading={deleteRole.isPending}
      />
    </PageFrame>
  )
}

function RoleFormModal({
  opened,
  onClose,
  editingRole,
  form,
  onSubmit,
  permissionsByModule,
  permissionsLoading,
  permissionsError,
  loading,
}: {
  opened: boolean
  onClose: () => void
  editingRole: RoleResponse | null
  form: UseFormReturnType<RoleValues>
  onSubmit: FormEventHandler<HTMLFormElement>
  permissionsByModule: Record<string, PermissionResponse[]>
  permissionsLoading: boolean
  permissionsError: unknown
  loading: boolean
}) {
  const modules = Object.entries(permissionsByModule).sort(([a], [b]) => a.localeCompare(b))

  return (
    <Modal opened={opened} onClose={onClose} title={editingRole ? 'Edit role' : 'Create role'} size="lg">
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput label="Role name" required {...form.getInputProps('name')} />
          <Textarea label="Description" minRows={3} {...form.getInputProps('description')} />

          <Text size="sm" fw={650}>
            Permissions
          </Text>

          {permissionsLoading ? (
            <LoadingState label="Loading permissions" />
          ) : permissionsError ? (
            <ErrorState error={permissionsError} title="Permissions unavailable" />
          ) : modules.length === 0 ? (
            <EmptyState title="No permissions" message="Permissions are not available for this tenant." />
          ) : (
            <Stack gap="sm">
              {modules.map(([module, permissions]) => (
                <Paper key={module} withBorder p="sm" radius="md" className="app-surface">
                  <Stack gap="xs">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      {module}
                    </Text>
                    {permissions.map((permission) => (
                      <Checkbox
                        key={permission.id}
                        checked={form.values.permissionIds.includes(permission.id)}
                        onChange={() => {
                          const current = form.values.permissionIds
                          form.setFieldValue(
                            'permissionIds',
                            current.includes(permission.id)
                              ? current.filter((id) => id !== permission.id)
                              : [...current, permission.id],
                          )
                        }}
                        label={
                          <Stack gap={0}>
                            <Text size="sm">{permission.name}</Text>
                            {permission.description && (
                              <Text size="xs" c="dimmed">
                                {permission.description}
                              </Text>
                            )}
                          </Stack>
                        }
                      />
                    ))}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!!permissionsError || permissionsLoading}>
              {editingRole ? 'Save changes' : 'Create role'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

function DeleteRoleModal({
  role,
  onClose,
  onConfirm,
  loading,
}: {
  role: RoleResponse | null
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <Modal opened={!!role} onClose={onClose} title="Delete role" size="sm">
      <Stack>
        <Text size="sm">
          Delete <strong>{role?.name}</strong>?
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
