import { useEffect, useMemo, useState } from 'react'
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
  PasswordInput,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconSearch, IconShield, IconTrash, IconUser } from '@tabler/icons-react'
import { useAssignRoles, useCreateUser, useDeleteUser, useUsers } from '../api/users'
import { useRoles } from '../api/roles'
import { EmptyState, ErrorState, LoadingState, PageFrame, PageHeader } from '../components/Feedback'
import type { RoleResponse, UserResponse } from '../types'

type CreateUserValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
}

export function UsersPage() {
  const { data: users, isLoading, error, refetch } = useUsers()
  const rolesQuery = useRoles()
  const createUser = useCreateUser()
  const assignRoles = useAssignRoles()
  const deleteUser = useDeleteUser()

  const [opened, { open, close }] = useDisclosure()
  const [roleModal, setRoleModal] = useState<{ open: boolean; user: UserResponse | null }>({
    open: false,
    user: null,
  })
  const [deleteConfirm, setDeleteConfirm] = useState<UserResponse | null>(null)
  const [search, setSearch] = useState('')

  const form = useForm<CreateUserValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Enter a valid email'),
      password: (value) => (value.length >= 6 ? null : 'Use at least 6 characters'),
      firstName: (value) => (value.trim().length > 0 ? null : 'First name is required'),
      lastName: (value) => (value.trim().length > 0 ? null : 'Last name is required'),
    },
  })

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users ?? []

    return (users ?? []).filter((user) =>
      [
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        ...user.roles,
        ...user.systemRoles,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [search, users])

  const handleCreate = form.onSubmit((values) => {
    createUser.mutate(
      {
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
      },
      {
        onSuccess: () => {
          form.reset()
          close()
        },
      },
    )
  })

  const handleAssignRoles = (roleIds: number[]) => {
    if (!roleModal.user) return
    assignRoles.mutate(
      { id: roleModal.user.id, data: { roleIds } },
      { onSuccess: () => setRoleModal({ open: false, user: null }) },
    )
  }

  const handleDeleteUser = () => {
    if (!deleteConfirm) return
    deleteUser.mutate(deleteConfirm.id, {
      onSuccess: () => setDeleteConfirm(null),
    })
  }

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Administration"
        title="Users"
        meta={
          <Text size="sm" c="dimmed">
            {users?.length ?? 0} accounts
          </Text>
        }
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add user
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading users" />
      ) : error ? (
        <ErrorState error={error} title="Users unavailable" onRetry={() => void refetch()} />
      ) : (
        <Paper withBorder radius="md" p="md" className="app-surface">
          <Stack gap="md">
            <Group justify="space-between">
              <TextInput
                placeholder="Search users, email, roles"
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                w={{ base: '100%', sm: 360 }}
              />
              <Badge variant="light" color="cyan">
                {filteredUsers.length} shown
              </Badge>
            </Group>

            {filteredUsers.length === 0 ? (
              <EmptyState
                title={users?.length ? 'No matching users' : 'No users'}
                message={users?.length ? 'Adjust the search term.' : 'Create the first workspace account.'}
                icon={users?.length ? 'search' : 'database'}
                action={
                  !users?.length && (
                    <Button leftSection={<IconPlus size={16} />} onClick={open}>
                      Add user
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
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Roles</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th w={140}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredUsers.map((user) => (
                      <Table.Tr key={user.id}>
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <ActionIcon variant="light" radius="md" size="md" aria-label="User">
                              <IconUser size={16} />
                            </ActionIcon>
                            <Stack gap={0} style={{ minWidth: 0 }}>
                              <Text size="sm" fw={650} truncate>
                                {user.firstName} {user.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                ID {user.id}
                              </Text>
                            </Stack>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{user.email}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            {user.systemRoles.map((role) => (
                              <Badge key={role} size="sm" variant="light" color="orange">
                                {role}
                              </Badge>
                            ))}
                            {user.roles.map((role) => (
                              <Badge key={role} size="sm" variant="light" color="cyan">
                                {role}
                              </Badge>
                            ))}
                            {user.roles.length === 0 && user.systemRoles.length === 0 && (
                              <Text size="xs" c="dimmed">
                                No roles
                              </Text>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" variant="light" color={user.enabled ? 'green' : 'gray'}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            <Button
                              size="xs"
                              variant="light"
                              leftSection={<IconShield size={14} />}
                              onClick={() => setRoleModal({ open: true, user })}
                            >
                              Roles
                            </Button>
                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => setDeleteConfirm(user)}
                                aria-label="Delete user"
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

      <CreateUserModal
        opened={opened}
        onClose={close}
        form={form}
        onSubmit={handleCreate}
        loading={createUser.isPending}
      />

      <RoleModal
        opened={roleModal.open}
        user={roleModal.user}
        roles={rolesQuery.data || []}
        rolesLoading={rolesQuery.isLoading}
        rolesError={rolesQuery.error}
        onClose={() => setRoleModal({ open: false, user: null })}
        onAssign={handleAssignRoles}
        loading={assignRoles.isPending}
      />

      <DeleteConfirmModal
        user={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteUser}
        loading={deleteUser.isPending}
      />
    </PageFrame>
  )
}

function CreateUserModal({
  opened,
  onClose,
  form,
  onSubmit,
  loading,
}: {
  opened: boolean
  onClose: () => void
  form: UseFormReturnType<CreateUserValues>
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Add user" size="md">
      <form onSubmit={onSubmit}>
        <Stack>
          <Group grow>
            <TextInput label="First name" required {...form.getInputProps('firstName')} />
            <TextInput label="Last name" required {...form.getInputProps('lastName')} />
          </Group>
          <TextInput label="Email" required {...form.getInputProps('email')} />
          <PasswordInput label="Password" required {...form.getInputProps('password')} />
          <TextInput label="Phone" {...form.getInputProps('phone')} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create user
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

function RoleModal({
  opened,
  user,
  roles,
  rolesLoading,
  rolesError,
  onClose,
  onAssign,
  loading,
}: {
  opened: boolean
  user: UserResponse | null
  roles: RoleResponse[]
  rolesLoading: boolean
  rolesError: unknown
  onClose: () => void
  onAssign: (roleIds: number[]) => void
  loading: boolean
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    if (user && opened) {
      const userRoleIds = roles.filter((role) => user.roles.includes(role.name)).map((role) => role.id)
      setSelectedIds(userRoleIds)
    }
  }, [opened, roles, user])

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={user ? `Roles - ${user.firstName} ${user.lastName}` : 'Roles'}
      size="md"
    >
      <Stack>
        {rolesLoading ? (
          <LoadingState label="Loading roles" />
        ) : rolesError ? (
          <ErrorState error={rolesError} title="Roles unavailable" />
        ) : roles.length === 0 ? (
          <EmptyState title="No roles" message="Create a role before assigning access." />
        ) : (
          roles.map((role) => {
            const selected = selectedIds.includes(role.id)
            return (
              <Paper
                key={role.id}
                withBorder
                p="sm"
                radius="md"
                className="app-hover-row"
                style={{
                  cursor: 'pointer',
                  borderColor: selected ? 'var(--app-brand)' : 'var(--app-border)',
                  background: selected ? 'var(--app-subtle-bg)' : 'var(--app-panel-bg)',
                }}
                onClick={() => {
                  setSelectedIds((previous) =>
                    previous.includes(role.id)
                      ? previous.filter((id) => id !== role.id)
                      : [...previous, role.id],
                  )
                }}
              >
                <Group align="flex-start" wrap="nowrap">
                  <Checkbox checked={selected} onChange={() => null} aria-label={role.name} />
                  <Stack gap={4} style={{ minWidth: 0 }}>
                    <Text size="sm" fw={650}>
                      {role.name}
                    </Text>
                    {role.description && (
                      <Text size="xs" c="dimmed">
                        {role.description}
                      </Text>
                    )}
                    {role.permissions.length > 0 && (
                      <Group gap={4}>
                        {role.permissions.slice(0, 6).map((permission) => (
                          <Badge key={permission} size="xs" variant="light" color="gray">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 6 && (
                          <Badge size="xs" variant="light" color="gray">
                            +{role.permissions.length - 6}
                          </Badge>
                        )}
                      </Group>
                    )}
                  </Stack>
                </Group>
              </Paper>
            )
          })
        )}
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onAssign(selectedIds)} loading={loading} disabled={!!rolesError || rolesLoading}>
            Save roles
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function DeleteConfirmModal({
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: UserResponse | null
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <Modal opened={!!user} onClose={onClose} title="Delete user" size="sm">
      <Stack>
        <Text size="sm">
          Delete <strong>{user?.firstName} {user?.lastName}</strong>?
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
