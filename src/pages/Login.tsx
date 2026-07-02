import { useEffect } from 'react'
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Badge,
  Divider,
  Group,
  PasswordInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconAlertCircle,
  IconArrowRight,
  IconBuildingStore,
  IconChartBar,
  IconChecklist,
  IconLock,
  IconMail,
  IconMoon,
  IconRoute,
  IconSun,
  IconShieldLock,
  IconSparkles,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { useLogin } from '../api/auth'
import { useAuthStore } from '../stores/useAuthStore'

export function Login() {
  const login = useLogin()
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      tenantId: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Enter a valid email'),
      password: (value) => (value.trim().length > 0 ? null : 'Password is required'),
      tenantId: (value) => (value.trim().length > 0 ? null : 'Tenant ID is required'),
    },
  })

  useEffect(() => {
    if (token) {
      navigate('/select-module', { replace: true })
    }
  }, [token, navigate])

  const handleSubmit = form.onSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: 'Signed in',
          message: 'Workspace ready.',
          color: 'green',
        })
        navigate('/select-module', { replace: true })
      },
    })
  })

  return (
    <Box className="login-split-shell">
      <ThemeToggle />

      <Box className="login-split-grid">
        <Box className="login-hero-panel">
          <Box className="login-splash-bg">
            <Box className="login-splash-shape login-splash-shape-1" />
            <Box className="login-splash-shape login-splash-shape-2" />
          </Box>

          <Stack gap="xl" className="login-hero-content">
            <Badge variant="light" color="cyan" size="lg" radius="sm" className="login-eyebrow">
              Fleet operations portal
            </Badge>

            <Stack gap="md" className="login-hero-copy">
              <Title order={1} className="login-hero-title">
                Manage dispatch, compliance, and vehicle access from one workspace.
              </Title>
              <Text className="login-hero-text">
                A fast, focused login experience for transport teams that need a clear path into their daily operations.
              </Text>
            </Stack>

            <SimpleGrid cols={2} spacing="md" className="login-metrics">
              <Paper className="login-metric-card" p="md" radius="lg">
                <ThemeIcon size={42} radius="md" variant="light" color="cyan">
                  <IconChartBar size={20} />
                </ThemeIcon>
                <Text fw={700} mt="sm">
                  Visibility first
                </Text>
                <Text size="sm" c="dimmed">
                  Track fleet usage and operational status with fewer clicks.
                </Text>
              </Paper>
              <Paper className="login-metric-card" p="md" radius="lg">
                <ThemeIcon size={42} radius="md" variant="light" color="teal">
                  <IconShieldLock size={20} />
                </ThemeIcon>
                <Text fw={700} mt="sm">
                  Secure access
                </Text>
                <Text size="sm" c="dimmed">
                  Tenant-scoped authentication keeps each workspace isolated.
                </Text>
              </Paper>
            </SimpleGrid>

            <Stack gap="sm" className="login-feature-list">
              {[
                {
                  icon: IconRoute,
                  title: 'Route-ready module entry',
                  text: 'Jump directly into buses or trucks after authentication.',
                },
                {
                  icon: IconChecklist,
                  title: 'Operational clarity',
                  text: 'Keep your onboarding surface clean and task focused.',
                },
                {
                  icon: IconSparkles,
                  title: 'Modern UI rhythm',
                  text: 'Balanced spacing, glass surfaces, and strong contrast on every screen.',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Group key={item.title} gap="md" className="login-feature">
                    <ThemeIcon size={42} radius="md" variant="light" color="cyan">
                      <Icon size={20} />
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Text fw={650}>{item.title}</Text>
                      <Text size="sm" c="dimmed">
                        {item.text}
                      </Text>
                    </Stack>
                  </Group>
                )
              })}
            </Stack>
          </Stack>
        </Box>

        <Box className="login-form-panel">
          <Paper className="login-form-card" radius="xl" p="xl" shadow="xl">
            <form onSubmit={handleSubmit}>
              <Stack gap="xl">
                <Stack gap={8} className="login-form-header">
                  <ThemeIcon size={56} radius="lg" variant="gradient" gradient={{ from: 'cyan', to: 'teal' }}>
                    <Text fw={850} size="28">
                      N
                    </Text>
                  </ThemeIcon>
                  <Box>
                    <Title order={2}>Welcome back</Title>
                    <Text c="dimmed" size="sm">
                      Sign in to your workspace
                    </Text>
                  </Box>
                </Stack>

                <Divider />

                {login.isError && (
                  <Alert color="red" radius="md" icon={<IconAlertCircle size={18} />}>
                    {getApiErrorMessage(login.error)}
                  </Alert>
                )}

                <Stack gap="md">
                  <TextInput
                    label="Email"
                    placeholder="you@company.com"
                    leftSection={<IconMail size={16} />}
                    autoComplete="email"
                    required
                    {...form.getInputProps('email')}
                  />
                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    leftSection={<IconLock size={16} />}
                    autoComplete="current-password"
                    required
                    {...form.getInputProps('password')}
                  />
                  <TextInput
                    label="Tenant ID"
                    placeholder="tenant-id"
                    leftSection={<IconBuildingStore size={16} />}
                    required
                    {...form.getInputProps('tenantId')}
                  />
                </Stack>

                <Button
                  type="submit"
                  size="md"
                  fullWidth
                  loading={login.isPending}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Sign in
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return (
    <Tooltip label="Toggle theme">
      <ActionIcon
        variant="subtle"
        onClick={() => toggleColorScheme()}
        size="lg"
        aria-label="Toggle theme"
        className="login-theme-toggle"
      >
        {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Tooltip>
  )
}
