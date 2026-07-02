import { useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { IconBus, IconFileDescription, IconSearch } from '@tabler/icons-react'
import { useBuses } from '../api/vehicles'
import { EmptyState, ErrorState, LoadingState, PageFrame, PageHeader, StatTile } from '../components/Feedback'
import { VehicleDocumentsModal } from '../components/VehicleDocumentsModal'
import type { Bus } from '../types'

export function Buses() {
  const { data: buses, isLoading, error, refetch } = useBuses()
  const [documentVehicle, setDocumentVehicle] = useState<Bus | null>(null)
  const [search, setSearch] = useState('')

  const filteredBuses = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return buses ?? []

    return (buses ?? []).filter((bus) =>
      [bus.registrationNumber, bus.make, bus.model, String(bus.year)]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [buses, search])

  const activeCount = buses?.filter((bus) => bus.isVehicleEnabled).length ?? 0
  const totalSeats = buses?.reduce((sum, bus) => sum + bus.passengerCapacity, 0) ?? 0
  const totalStanding = buses?.reduce((sum, bus) => sum + bus.standingCapacity, 0) ?? 0

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Fleet"
        title="Buses"
        meta={
          <Text size="sm" c="dimmed">
            {activeCount} active / {buses?.length ?? 0} total
          </Text>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading buses" />
      ) : error ? (
        <ErrorState error={error} title="Buses unavailable" onRetry={() => void refetch()} />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <StatTile
              label="Total"
              value={buses?.length ?? 0}
              icon={<IconBus size={20} />}
              tone="cyan"
              detail="Registered buses"
            />
            <StatTile
              label="Seating"
              value={totalSeats}
              icon={<IconBus size={20} />}
              tone="teal"
              detail="Passenger seats"
            />
            <StatTile
              label="Standing"
              value={totalStanding}
              icon={<IconBus size={20} />}
              tone="gray"
              detail="Standing capacity"
            />
          </SimpleGrid>

          <Paper withBorder radius="md" p="md" className="app-surface">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <TextInput
                  placeholder="Search registration, make, model"
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                  w={{ base: '100%', sm: 360 }}
                />
                <Badge variant="light" color="cyan">
                  {filteredBuses.length} shown
                </Badge>
              </Group>

              {filteredBuses.length === 0 ? (
                <EmptyState
                  title={buses?.length ? 'No matching buses' : 'No buses'}
                  message={buses?.length ? 'Adjust the search term.' : 'Bus records will appear here.'}
                  icon={buses?.length ? 'search' : 'database'}
                />
              ) : (
                <Table.ScrollContainer minWidth={760}>
                  <Table highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Registration</Table.Th>
                        <Table.Th>Vehicle</Table.Th>
                        <Table.Th>Year</Table.Th>
                        <Table.Th>Capacity</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th w={90}>Docs</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredBuses.map((bus) => (
                        <Table.Tr key={bus.id}>
                          <Table.Td>
                            <Text size="sm" fw={700} ff="monospace">
                              {bus.registrationNumber}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Stack gap={0}>
                              <Text size="sm" fw={600}>
                                {bus.make} {bus.model}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {bus.hasAc ? 'AC' : 'Non AC'} / {bus.hasUsb ? 'USB' : 'No USB'}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>{bus.year}</Table.Td>
                          <Table.Td>
                            {bus.passengerCapacity} seats / {bus.standingCapacity} standing
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" color={bus.isVehicleEnabled ? 'green' : 'gray'}>
                              {bus.isVehicleEnabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label="Documents">
                              <ActionIcon
                                variant="subtle"
                                color="cyan"
                                onClick={() => setDocumentVehicle(bus)}
                                aria-label="Open bus documents"
                              >
                                <IconFileDescription size={18} />
                              </ActionIcon>
                            </Tooltip>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Stack>
          </Paper>
        </>
      )}

      {documentVehicle && (
        <VehicleDocumentsModal
          vehicleId={documentVehicle.id}
          vehicleLabel={documentVehicle.registrationNumber}
          onClose={() => setDocumentVehicle(null)}
        />
      )}
    </PageFrame>
  )
}
