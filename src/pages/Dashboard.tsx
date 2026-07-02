import { useMemo } from 'react'
import {
  Alert,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
  rem,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBus,
  IconRefresh,
  IconShield,
  IconTruck,
  IconUsers,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useRoles } from '../api/roles'
import { useUsers } from '../api/users'
import { useBuses, useTrucks } from '../api/vehicles'
import { getApiErrorMessage } from '../api/client'
import { useAuthStore } from '../stores/useAuthStore'
import type { AppModule } from '../stores/useAuthStore'
import { PageFrame, PageHeader, StatTile } from '../components/Feedback'

export function Dashboard() {
  const navigate = useNavigate()
  const module = useAuthStore((state) => state.module) as AppModule
  const busesQuery = useBuses()
  const trucksQuery = useTrucks()
  const usersQuery = useUsers()
  const rolesQuery = useRoles()

  const counts = useMemo(
    () => ({
      buses: busesQuery.data?.length ?? 0,
      trucks: trucksQuery.data?.length ?? 0,
      users: usersQuery.data?.length ?? 0,
      roles: rolesQuery.data?.length ?? 0,
      activeBuses: busesQuery.data?.filter((bus) => bus.isVehicleEnabled).length ?? 0,
      activeTrucks: trucksQuery.data?.filter((truck) => truck.isVehicleEnabled).length ?? 0,
    }),
    [busesQuery.data, rolesQuery.data, trucksQuery.data, usersQuery.data],
  )

  const loadErrors = [
    !module || module === 'bus' ? (busesQuery.error && ['Buses', busesQuery.error, busesQuery.refetch] as const) : null,
    !module || module === 'truck' ? (trucksQuery.error && ['Trucks', trucksQuery.error, trucksQuery.refetch] as const) : null,
    usersQuery.error && (['Users', usersQuery.error, usersQuery.refetch] as const),
    rolesQuery.error && (['Roles', rolesQuery.error, rolesQuery.refetch] as const),
  ].filter(Boolean) as Array<readonly [string, Error, () => Promise<unknown>]>

  const workspaceLinks = useMemo(() => {
    const links: { label: string; route: string; icon: typeof IconArrowRight }[] = []
    if (!module || module === 'bus') {
      links.push({ label: 'Buses', route: '/buses', icon: IconBus })
    }
    if (!module || module === 'truck') {
      links.push({ label: 'Trucks', route: '/trucks', icon: IconTruck })
    }
    if (!module) {
      links.push(
        { label: 'Vehicle hub', route: '/vehicles', icon: IconArrowRight },
        { label: 'Users', route: '/users', icon: IconUsers },
        { label: 'Roles', route: '/roles', icon: IconShield },
      )
    }
    return links
  }, [module])

  const showModuleStats = module === 'bus' || module === 'truck'

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Overview"
        title={module === 'bus' ? 'Buses' : module === 'truck' ? 'Trucks' : 'Dashboard'}
        meta={
          <Text size="sm" c="dimmed">
            {showModuleStats
              ? `${module === 'bus' ? counts.activeBuses : counts.activeTrucks} active`
              : `${counts.activeBuses + counts.activeTrucks} active vehicles`}
          </Text>
        }
      />

      {loadErrors.length > 0 && (
        <Alert
          color="yellow"
          radius="md"
          icon={<IconAlertTriangle size={18} />}
          title="Some data did not load"
        >
          <Stack gap="xs">
            {loadErrors.map(([label, error, refetch]) => (
              <Group key={label} justify="space-between" gap="sm">
                <Text size="sm">
                  <strong>{label}:</strong> {getApiErrorMessage(error)}
                </Text>
                <Button
                  size="xs"
                  variant="subtle"
                  color="yellow"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => void refetch()}
                >
                  Retry
                </Button>
              </Group>
            ))}
          </Stack>
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: showModuleStats ? 2 : 2, lg: showModuleStats ? 3 : 4 }} spacing="md">
        {(!module || module === 'bus') && (
          <StatTile
            label="Buses"
            value={counts.buses}
            icon={<IconBus size={20} />}
            tone="cyan"
            detail={`${counts.activeBuses} active`}
            loading={busesQuery.isLoading}
            error={!!busesQuery.error}
          />
        )}
        {(!module || module === 'truck') && (
          <StatTile
            label="Trucks"
            value={counts.trucks}
            icon={<IconTruck size={20} />}
            tone="orange"
            detail={`${counts.activeTrucks} active`}
            loading={trucksQuery.isLoading}
            error={!!trucksQuery.error}
          />
        )}
        {!module && (
          <>
            <StatTile
              label="Users"
              value={counts.users}
              icon={<IconUsers size={20} />}
              tone="teal"
              detail="Workspace accounts"
              loading={usersQuery.isLoading}
              error={!!usersQuery.error}
            />
            <StatTile
              label="Roles"
              value={counts.roles}
              icon={<IconShield size={20} />}
              tone="violet"
              detail="Access groups"
              loading={rolesQuery.isLoading}
              error={!!rolesQuery.error}
            />
          </>
        )}
      </SimpleGrid>

      {workspaceLinks.length > 0 && (
        <Paper withBorder radius="md" p="lg" className="app-surface">
          <Group justify="space-between" mb="md">
            <Stack gap={2}>
              <Title order={4}>Workspace</Title>
              <Text size="sm" c="dimmed">
                Core operations
              </Text>
            </Stack>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: Math.min(workspaceLinks.length, 4) }} spacing="sm">
            {workspaceLinks.map((link) => {
              const Icon = link.icon
              return (
                <UnstyledButton
                  key={link.route}
                  className="app-hover-row"
                  onClick={() => navigate(link.route)}
                  style={{
                    border: '1px solid var(--app-border)',
                    borderRadius: rem(8),
                    padding: rem(14),
                    background: 'var(--app-panel-bg)',
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm" fw={650}>
                      {link.label}
                    </Text>
                    <ThemeIcon variant="light" color="cyan" radius="md">
                      <Icon size={17} />
                    </ThemeIcon>
                  </Group>
                </UnstyledButton>
              )
            })}
          </SimpleGrid>
        </Paper>
      )}
    </PageFrame>
  )
}
