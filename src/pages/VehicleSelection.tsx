import {
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  rem,
} from '@mantine/core'
import { IconArrowRight, IconBus, IconTruck } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useBuses, useTrucks } from '../api/vehicles'
import { PageFrame, PageHeader } from '../components/Feedback'

const vehicles = [
  {
    id: 'buses',
    label: 'Buses',
    route: '/buses',
    icon: IconBus,
    color: 'cyan',
  },
  {
    id: 'trucks',
    label: 'Trucks',
    route: '/trucks',
    icon: IconTruck,
    color: 'orange',
  },
]

export function VehicleSelection() {
  const navigate = useNavigate()
  const buses = useBuses()
  const trucks = useTrucks()

  const counts: Record<string, number | null> = {
    buses: buses.data?.length ?? null,
    trucks: trucks.data?.length ?? null,
  }

  const errors: Record<string, boolean> = {
    buses: !!buses.error,
    trucks: !!trucks.error,
  }

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Fleet"
        title="Vehicles"
        meta={
          <Text size="sm" c="dimmed">
            {`${buses.data?.length ?? 0} buses / ${trucks.data?.length ?? 0} trucks`}
          </Text>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {vehicles.map((vehicle) => {
          const Icon = vehicle.icon
          return (
            <Paper key={vehicle.id} withBorder radius="md" p="lg" className="app-surface">
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <ThemeIcon size={44} radius="md" color={vehicle.color} variant="light">
                    <Icon size={22} />
                  </ThemeIcon>
                  <Badge variant="light" color={errors[vehicle.id] ? 'red' : vehicle.color}>
                    {errors[vehicle.id] ? 'Unavailable' : counts[vehicle.id] ?? 'Loading'}
                  </Badge>
                </Group>

                <Stack gap={2}>
                  <Text fw={750} style={{ fontSize: rem(24) }}>
                    {vehicle.label}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Customer fleet assets
                  </Text>
                </Stack>

                <Button
                  variant="light"
                  color={vehicle.color}
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() => navigate(vehicle.route)}
                >
                  Open
                </Button>
              </Stack>
            </Paper>
          )
        })}
      </SimpleGrid>
    </PageFrame>
  )
}
