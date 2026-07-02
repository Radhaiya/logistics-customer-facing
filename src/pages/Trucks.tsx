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
import { IconFileDescription, IconSearch, IconTruck } from '@tabler/icons-react'
import { useTrucks } from '../api/vehicles'
import { EmptyState, ErrorState, LoadingState, PageFrame, PageHeader, StatTile } from '../components/Feedback'
import { VehicleDocumentsModal } from '../components/VehicleDocumentsModal'
import type { Truck } from '../types'

export function Trucks() {
  const { data: trucks, isLoading, error, refetch } = useTrucks()
  const [documentVehicle, setDocumentVehicle] = useState<Truck | null>(null)
  const [search, setSearch] = useState('')

  const filteredTrucks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return trucks ?? []

    return (trucks ?? []).filter((truck) =>
      [truck.registrationNumber, truck.make, truck.model, String(truck.year)]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [search, trucks])

  const activeCount = trucks?.filter((truck) => truck.isVehicleEnabled).length ?? 0
  const cargoCapacity =
    trucks?.reduce((sum, truck) => sum + Number(truck.cargoCapacityKg ?? 0), 0) ?? 0
  const maxLoad = trucks?.reduce((sum, truck) => sum + Number(truck.maxLoadWeightKg ?? 0), 0) ?? 0

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Fleet"
        title="Trucks"
        meta={
          <Text size="sm" c="dimmed">
            {activeCount} active / {trucks?.length ?? 0} total
          </Text>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading trucks" />
      ) : error ? (
        <ErrorState error={error} title="Trucks unavailable" onRetry={() => void refetch()} />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <StatTile
              label="Total"
              value={trucks?.length ?? 0}
              icon={<IconTruck size={20} />}
              tone="orange"
              detail="Registered trucks"
            />
            <StatTile
              label="Cargo"
              value={cargoCapacity.toLocaleString()}
              icon={<IconTruck size={20} />}
              tone="yellow"
              detail="Capacity in kg"
            />
            <StatTile
              label="Max load"
              value={maxLoad.toLocaleString()}
              icon={<IconTruck size={20} />}
              tone="gray"
              detail="Load limit in kg"
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
                <Badge variant="light" color="orange">
                  {filteredTrucks.length} shown
                </Badge>
              </Group>

              {filteredTrucks.length === 0 ? (
                <EmptyState
                  title={trucks?.length ? 'No matching trucks' : 'No trucks'}
                  message={trucks?.length ? 'Adjust the search term.' : 'Truck records will appear here.'}
                  icon={trucks?.length ? 'search' : 'database'}
                />
              ) : (
                <Table.ScrollContainer minWidth={760}>
                  <Table highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Registration</Table.Th>
                        <Table.Th>Vehicle</Table.Th>
                        <Table.Th>Year</Table.Th>
                        <Table.Th>Cargo</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th w={90}>Docs</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredTrucks.map((truck) => (
                        <Table.Tr key={truck.id}>
                          <Table.Td>
                            <Text size="sm" fw={700} ff="monospace">
                              {truck.registrationNumber}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Stack gap={0}>
                              <Text size="sm" fw={600}>
                                {truck.make} {truck.model}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {truck.hasRefrigeration ? 'Refrigerated' : 'Standard cargo'}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>{truck.year}</Table.Td>
                          <Table.Td>
                            {Number(truck.cargoCapacityKg ?? 0).toLocaleString()} kg
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" color={truck.isVehicleEnabled ? 'green' : 'gray'}>
                              {truck.isVehicleEnabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label="Documents">
                              <ActionIcon
                                variant="subtle"
                                color="orange"
                                onClick={() => setDocumentVehicle(truck)}
                                aria-label="Open truck documents"
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
          scope="admin-truck"
          onClose={() => setDocumentVehicle(null)}
        />
      )}
    </PageFrame>
  )
}
