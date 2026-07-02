import { Box, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconBus, IconTruck } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

const modules = [
  {
    id: 'bus' as const,
    label: 'Buses',
    description: 'Manage bus fleet, passenger capacity, and documentation',
    icon: IconBus,
    color: 'cyan',
    route: '/buses',
  },
  {
    id: 'truck' as const,
    label: 'Trucks',
    description: 'Manage truck fleet, cargo capacity, and documentation',
    icon: IconTruck,
    color: 'orange',
    route: '/trucks',
  },
]

export function ModuleSelect() {
  const navigate = useNavigate()
  const setModule = useAuthStore((state) => state.setModule)
  const userName = useAuthStore((state) => state.userName)

  const handleSelect = (id: 'bus' | 'truck', route: string) => {
    setModule(id)
    navigate(route, { replace: true })
  }

  return (
    <Box className="module-select-shell">
      <Box className="login-splash-bg">
        <Box className="login-splash-shape login-splash-shape-1" />
        <Box className="login-splash-shape login-splash-shape-2" />
      </Box>

      <Box className="module-select-content">
        <Box className="module-select-card">
          <Stack gap="xl">
            <Stack gap={4} align="center">
              <Title order={2} ta="center">
                Choose your module
              </Title>
              <Text c="dimmed" size="sm" ta="center">
                {userName ? `Welcome, ${userName}` : 'Select a workspace module to get started'}
              </Text>
            </Stack>

            <Group gap="md" grow>
              {modules.map((mod) => {
                const Icon = mod.icon
                return (
                  <Box
                    key={mod.id}
                    className="module-option"
                    onClick={() => handleSelect(mod.id, mod.route)}
                  >
                    <ThemeIcon size={56} radius="lg" color={mod.color} variant="light">
                      <Icon size={28} />
                    </ThemeIcon>
                    <Stack gap={4} align="center">
                      <Text fw={700} size="lg">
                        {mod.label}
                      </Text>
                      <Text size="xs" c="dimmed" ta="center" lh={1.4}>
                        {mod.description}
                      </Text>
                    </Stack>
                  </Box>
                )
              })}
            </Group>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
