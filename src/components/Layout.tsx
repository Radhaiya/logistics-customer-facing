import type { ReactNode } from 'react'
import {
  ActionIcon,
  AppShell,
  Badge,
  Box,
  Button,
  Burger,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
  rem,
  useMantineColorScheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconBuildingStore,
  IconBus,
  IconChevronRight,
  IconHome,
  IconLogout,
  IconMapPin,
  IconMoon,
  IconShield,
  IconSun,
  IconTruck,
  IconUsers,
} from '@tabler/icons-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import type { AppModule } from '../stores/useAuthStore'

const allNavSections = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', icon: IconHome, route: '/' },
      { label: 'Vehicles', icon: IconBuildingStore, route: '/vehicles' },
      { label: 'Map', icon: IconMapPin, route: '/map' },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Buses', icon: IconBus, route: '/buses' },
      { label: 'Trucks', icon: IconTruck, route: '/trucks' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', icon: IconUsers, route: '/users' },
      { label: 'Roles', icon: IconShield, route: '/roles' },
    ],
  },
]

function getNavSections(module: AppModule) {
  if (module === 'bus') {
    return [
      {
        label: 'Fleet',
        items: [
          { label: 'Buses', icon: IconBus, route: '/buses' },
          { label: 'Map', icon: IconMapPin, route: '/map' },
        ],
      },
    ]
  }
  if (module === 'truck') {
    return [
      {
        label: 'Fleet',
        items: [
          { label: 'Trucks', icon: IconTruck, route: '/trucks' },
          { label: 'Map', icon: IconMapPin, route: '/map' },
        ],
      },
    ]
  }
  return allNavSections
}

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/vehicles': 'Vehicles',
  '/map': 'Map',
  '/buses': 'Buses',
  '/trucks': 'Trucks',
  '/users': 'Users',
  '/roles': 'Roles',
}

export function Layout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const logout = useAuthStore((state) => state.logout)
  const setModule = useAuthStore((state) => state.setModule)
  const userName = useAuthStore((state) => state.userName)
  const userEmail = useAuthStore((state) => state.userEmail)
  const userRole = useAuthStore((state) => state.userRole)
  const module = useAuthStore((state) => state.module)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleNavigate = (route: string) => {
    navigate(route)
    closeMobile()
  }

  const handleModuleSwitch = (nextModule: Exclude<AppModule, null>) => {
    setModule(nextModule)
    navigate(nextModule === 'bus' ? '/buses' : '/trucks', { replace: true })
    closeMobile()
  }

  const initials = getInitials(userName || userEmail || 'User')
  const pageTitle = routeTitles[location.pathname] || 'Workspace'

  return (
    <AppShell
      padding={0}
      header={{ height: 64 }}
      navbar={{
        width: 272,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      styles={{
        main: {
          background: 'var(--app-shell-bg)',
        },
      }}
    >
      <AppShell.Header
        style={{
          borderBottom: '1px solid var(--app-border)',
          background: 'var(--app-panel-bg)',
        }}
      >
        <Group h="100%" px={{ base: 'md', md: 'xl' }} justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              aria-label="Toggle navigation"
            />
            <BrandMark />
            <Stack gap={0} visibleFrom="xs">
              <Text size="sm" fw={700}>
                {pageTitle}
              </Text>
              <Text size="xs" c="dimmed">
                Nexus Logistics
              </Text>
            </Stack>
          </Group>

          <Group gap={6} wrap="nowrap">
            {module === 'bus' && (
              <Button
                size="xs"
                variant="light"
                color="orange"
                leftSection={<IconTruck size={14} />}
                onClick={() => handleModuleSwitch('truck')}
                visibleFrom="sm"
              >
                Switch to Trucks
              </Button>
            )}
            {module === 'truck' && (
              <Button
                size="xs"
                variant="light"
                color="cyan"
                leftSection={<IconBus size={14} />}
                onClick={() => handleModuleSwitch('bus')}
                visibleFrom="sm"
              >
                Switch to Buses
              </Button>
            )}

            <Tooltip label="Toggle theme">
              <ActionIcon
                variant="subtle"
                onClick={() => toggleColorScheme()}
                size="lg"
                aria-label="Toggle theme"
              >
                {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
            </Tooltip>

            <Tooltip label={`${userName || userEmail || 'User'} - ${userRole || 'USER'}`}>
              <Group gap="xs" wrap="nowrap" px={6} py={4}>
                <AvatarInitials initials={initials} />
                <Stack gap={0} visibleFrom="sm" style={{ maxWidth: rem(168) }}>
                  <Text size="sm" fw={650} truncate>
                    {userName || userEmail?.split('@')[0] || 'User'}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {userRole || 'USER'}
                  </Text>
                </Stack>
              </Group>
            </Tooltip>

            <Tooltip label="Sign out">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={handleLogout}
                size="lg"
                aria-label="Sign out"
              >
                <IconLogout size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          borderRight: '1px solid var(--app-border)',
          background: 'var(--app-panel-bg)',
        }}
      >
        <Stack gap="md" h="100%">
          <TenantHeader />
          <Divider />
          <Stack gap="md" style={{ flex: 1 }}>
            {getNavSections(module).map((section) => (
              <Stack key={section.label} gap={4}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" px={8}>
                  {section.label}
                </Text>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active =
                    location.pathname === item.route ||
                    (item.route !== '/' && location.pathname.startsWith(item.route))

                  return (
                    <NavItem
                      key={item.route}
                      icon={<Icon size={18} />}
                      label={item.label}
                      active={active}
                      onClick={() => handleNavigate(item.route)}
                    />
                  )
                })}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

function BrandMark() {
  return (
    <ThemeIcon
      size={36}
      radius="md"
      variant="filled"
      color="cyan"
      style={{ color: 'var(--app-brand-contrast)' }}
    >
      <Text fw={800} size="sm">
        N
      </Text>
    </ThemeIcon>
  )
}

function AvatarInitials({ initials }: { initials: string }) {
  return (
    <Box
      style={{
        width: rem(32),
        height: rem(32),
        borderRadius: rem(8),
        background: 'var(--app-subtle-bg)',
        border: '1px solid var(--app-border)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Text size="xs" fw={750}>
        {initials}
      </Text>
    </Box>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      className="app-hover-row"
      style={{
        width: '100%',
        borderRadius: rem(8),
        border: '1px solid transparent',
        background: active ? 'var(--app-subtle-bg)' : 'transparent',
        color: active ? 'var(--app-brand)' : 'inherit',
        padding: `${rem(9)} ${rem(10)}`,
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <Box style={{ display: 'flex', opacity: active ? 1 : 0.72 }}>{icon}</Box>
          <Text size="sm" fw={active ? 700 : 550}>
            {label}
          </Text>
        </Group>
        {active && <IconChevronRight size={14} />}
      </Group>
    </UnstyledButton>
  )
}

function TenantHeader() {
  const tenantId = useAuthStore((state) => state.tenantId)

  return (
    <PaperLike>
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon variant="light" color="cyan" radius="md" size={38}>
          <IconBuildingStore size={18} />
        </ThemeIcon>
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed">
            Workspace
          </Text>
          <Text size="sm" fw={700} truncate>
            {tenantId || 'Tenant'}
          </Text>
        </Stack>
        <Badge variant="light" color="green" ml="auto">
          Live
        </Badge>
      </Group>
    </PaperLike>
  )
}

function PaperLike({ children }: { children: ReactNode }) {
  return (
    <Box
      p="sm"
      style={{
        borderRadius: rem(10),
        background: 'var(--app-subtle-bg)',
        border: '1px solid var(--app-border)',
      }}
    >
      {children}
    </Box>
  )
}

function getInitials(name: string) {
  return name
    .split(/[ @.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
