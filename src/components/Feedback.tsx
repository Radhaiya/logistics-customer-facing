import type { ReactNode } from 'react'
import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconDatabaseOff,
  IconRefresh,
  IconSearchOff,
} from '@tabler/icons-react'
import { getApiErrorMessage } from '../api/client'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  meta?: ReactNode
  actions?: ReactNode
}

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <Box px={{ base: 'md', md: 'xl' }} py={{ base: 'md', md: 'xl' }} maw={1240} mx="auto">
      <Stack gap="lg">{children}</Stack>
    </Box>
  )
}

export function PageHeader({ eyebrow, title, meta, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" gap="md">
      <Stack gap={4}>
        {eyebrow && (
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            {eyebrow}
          </Text>
        )}
        <Title order={2}>{title}</Title>
        {meta && <Box>{meta}</Box>}
      </Stack>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  )
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <Center py={64}>
      <Stack align="center" gap="sm">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Stack>
    </Center>
  )
}

export function EmptyState({
  title,
  message,
  action,
  icon = 'database',
}: {
  title: string
  message?: string
  action?: ReactNode
  icon?: 'database' | 'search'
}) {
  const Icon = icon === 'search' ? IconSearchOff : IconDatabaseOff

  return (
    <Center py={56}>
      <Stack align="center" gap="sm" maw={360}>
        <ThemeIcon variant="light" color="gray" size={44} radius="md">
          <Icon size={22} />
        </ThemeIcon>
        <Text fw={650} ta="center">
          {title}
        </Text>
        {message && (
          <Text size="sm" c="dimmed" ta="center">
            {message}
          </Text>
        )}
        {action}
      </Stack>
    </Center>
  )
}

export function ErrorState({
  error,
  title = 'Could not load data',
  onRetry,
}: {
  error: unknown
  title?: string
  onRetry?: () => void
}) {
  return (
    <Alert
      color="red"
      variant="light"
      radius="md"
      icon={<IconAlertTriangle size={18} />}
      title={title}
    >
      <Group justify="space-between" align="center" gap="md">
        <Text size="sm">{getApiErrorMessage(error)}</Text>
        {onRetry && (
          <Button
            size="xs"
            variant="subtle"
            color="red"
            leftSection={<IconRefresh size={14} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Group>
    </Alert>
  )
}

export function StatTile({
  label,
  value,
  icon,
  tone = 'blue',
  detail,
  loading,
  error,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  tone?: string
  detail?: ReactNode
  loading?: boolean
  error?: boolean
}) {
  return (
    <Paper withBorder radius="md" p="lg" className="app-surface">
      <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
        <Stack gap={6}>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            {label}
          </Text>
          <Text fw={750} style={{ fontSize: rem(28), lineHeight: 1 }}>
            {loading ? <Loader size="xs" /> : value}
          </Text>
          {detail && (
            <Text size="sm" c={error ? 'red' : 'dimmed'}>
              {detail}
            </Text>
          )}
        </Stack>
        <ThemeIcon variant="light" color={error ? 'red' : tone} size={40} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  )
}
