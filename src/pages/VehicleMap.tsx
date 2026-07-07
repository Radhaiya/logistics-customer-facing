import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import {
  IconAlertCircle,
  IconBus,
  IconCurrentLocation,
  IconMapPin,
  IconMapSearch,
  IconNavigation,
  IconTruck,
} from '@tabler/icons-react'
import { useBuses, useTrucks, useVehicleLocation } from '../api/vehicles'
import { EmptyState, LoadingState, PageFrame, PageHeader } from '../components/Feedback'
import { appConfig } from '../config'
import { useAuthStore } from '../stores/useAuthStore'
import type { Bus, Truck } from '../types'

type VehicleType = 'BUS' | 'TRUCK'
type TrackableVehicle =
  | (Bus & { vehicleType: 'BUS' })
  | (Truck & { vehicleType: 'TRUCK' })

type MapboxMarker = {
  setLngLat: (lngLat: [number, number]) => MapboxMarker
  addTo: (map: MapboxMap) => MapboxMarker
  remove: () => void
}

type MapboxMap = {
  addControl: (control: unknown, position?: string) => void
  easeTo: (options: { center: [number, number]; zoom?: number; duration?: number; essential?: boolean }) => void
  getContainer: () => HTMLElement
  off: (event: string, callback: () => void) => void
  on: (event: string, callback: () => void) => void
  project: (lngLat: [number, number]) => { x: number; y: number }
  remove: () => void
  setStyle: (style: string) => void
}

type MapboxGl = {
  accessToken: string
  Map: new (options: {
    container: HTMLElement
    style: string
    center: [number, number]
    zoom: number
    pitch?: number
    bearing?: number
    attributionControl?: boolean
  }) => MapboxMap
  Marker: new (options?: { element?: HTMLElement; anchor?: string }) => MapboxMarker
  NavigationControl: new (options?: { visualizePitch?: boolean }) => unknown
  FullscreenControl: new () => unknown
  ScaleControl: new (options?: { maxWidth?: number; unit?: string }) => unknown
}

declare global {
  interface Window {
    mapboxgl?: MapboxGl
  }
}

const reverseGeocodeCache = new Map<string, string>()

function loadMapboxGl() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl)

  return new Promise<MapboxGl>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${appConfig.mapbox.glJsUrl}"]`)

    if (!document.querySelector(`link[href="${appConfig.mapbox.glCssUrl}"]`)) {
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = appConfig.mapbox.glCssUrl
      document.head.appendChild(css)
    }

    const script = existingScript ?? document.createElement('script')
    script.src = appConfig.mapbox.glJsUrl
    script.async = true
    script.onload = () => {
      if (window.mapboxgl) {
        resolve(window.mapboxgl)
      } else {
        reject(new Error('Mapbox GL failed to load.'))
      }
    }
    script.onerror = () => reject(new Error('Mapbox GL failed to load.'))

    if (!existingScript) {
      document.head.appendChild(script)
    }
  })
}

function createVehicleMarker(vehicleType: VehicleType, registrationNumber: string) {
  const marker = document.createElement('div')
  marker.className = `vehicle-mapbox-marker vehicle-mapbox-marker-${vehicleType.toLowerCase()}`
  marker.setAttribute('aria-label', `${registrationNumber} location`)
  const vehicleIcon =
    vehicleType === 'BUS'
      ? '<path d="M6 4h12a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2v1a1 1 0 0 1 -2 0v-1h-8v1a1 1 0 0 1 -2 0v-1a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2Z" fill="white"></path><path d="M7 7h10v4h-10z" fill="#f97316"></path><circle cx="8" cy="14" r="1.2" fill="#f97316"></circle><circle cx="16" cy="14" r="1.2" fill="#f97316"></circle>'
      : '<path d="M4 7h10v7h2.2l1.5-3h2.3l1 3v3h-2a2 2 0 0 1 -4 0h-5a2 2 0 0 1 -4 0h-2v-10Z" fill="white"></path><path d="M15 11h2.1l-.8 1.6h-1.3z" fill="#2563eb"></path><circle cx="8" cy="17" r="1" fill="#2563eb"></circle><circle cx="17" cy="17" r="1" fill="#2563eb"></circle>'

  marker.innerHTML = `
    <div class="vehicle-mapbox-marker-pin">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">${vehicleIcon}</svg>
    </div>
    <span>${registrationNumber}</span>
  `

  return marker
}

function getCoordinateKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`
}

function getReverseGeocodeUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    zoom: '18',
    addressdetails: '1',
  })

  return `${appConfig.geocoding.reverseUrl}?${params.toString()}`
}

function useReverseGeocodedAddress(latitude?: number | null, longitude?: number | null) {
  const [address, setAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setAddress(null)
      setStatus('idle')
      return
    }

    const coordinateKey = getCoordinateKey(latitude, longitude)
    const cachedAddress = reverseGeocodeCache.get(coordinateKey)
    if (cachedAddress) {
      setAddress(cachedAddress)
      setStatus('success')
      return
    }

    const controller = new AbortController()
    setAddress(null)
    setStatus('loading')

    fetch(getReverseGeocodeUrl(latitude, longitude), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Reverse geocode failed with status ${response.status}`)
        return response.json() as Promise<{ display_name?: string }>
      })
      .then((data) => {
        const nextAddress = data.display_name || 'Address unavailable for this location'
        reverseGeocodeCache.set(coordinateKey, nextAddress)
        setAddress(nextAddress)
        setStatus('success')
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setAddress(null)
        setStatus('error')
      })

    return () => controller.abort()
  }, [latitude, longitude])

  return { address, status }
}

function VehicleTileMap({
  latitude,
  longitude,
  registrationNumber,
  vehicleType,
}: {
  latitude: number
  longitude: number
  registrationNumber: string
  vehicleType: VehicleType
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const markerRef = useRef<MapboxMarker | null>(null)
  const coordinatesRef = useRef({ latitude, longitude })
  const [style, setStyle] = useState(appConfig.mapbox.streetsStyle)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [edgeIndicator, setEdgeIndicator] = useState<{ left: number; top: number; rotation: number } | null>(null)

  const updateEdgeIndicator = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const container = map.getContainer()
    const width = container.clientWidth
    const height = container.clientHeight
    if (!width || !height) return

    const { latitude: currentLatitude, longitude: currentLongitude } = coordinatesRef.current
    const point = map.project([currentLongitude, currentLatitude])
    const isOutside = point.x < 0 || point.x > width || point.y < 0 || point.y > height

    if (!isOutside) {
      setEdgeIndicator(null)
      return
    }

    const margin = 34
    const centerX = width / 2
    const centerY = height / 2
    setEdgeIndicator({
      left: Math.max(margin, Math.min(width - margin, point.x)),
      top: Math.max(margin, Math.min(height - margin, point.y)),
      rotation: (Math.atan2(point.y - centerY, point.x - centerX) * 180) / Math.PI + 90,
    })
  }, [])

  useEffect(() => {
    if (!containerRef.current || !appConfig.mapbox.accessToken) return

    let disposed = false

    loadMapboxGl()
      .then((mapboxgl) => {
        if (disposed || !containerRef.current) return

        mapboxgl.accessToken = appConfig.mapbox.accessToken
        const initialCoordinates = coordinatesRef.current
        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: appConfig.mapbox.streetsStyle,
          center: [initialCoordinates.longitude, initialCoordinates.latitude],
          zoom: 17,
          pitch: 0,
          bearing: 0,
          attributionControl: true,
        })
        const marker = new mapboxgl.Marker({
          element: createVehicleMarker(vehicleType, registrationNumber),
          anchor: 'bottom',
        })
          .setLngLat([initialCoordinates.longitude, initialCoordinates.latitude])
          .addTo(map)

        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right')
        map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left')

        mapRef.current = map
        markerRef.current = marker
        setMapReady(true)
        setMapError(null)
      })
      .catch((error) => {
        setMapError(error instanceof Error ? error.message : 'Unable to load map.')
      })

    return () => {
      disposed = true
      markerRef.current?.remove()
      mapRef.current?.remove()
      markerRef.current = null
      mapRef.current = null
      setMapReady(false)
      setEdgeIndicator(null)
    }
  }, [registrationNumber, vehicleType])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current
    map.on('move', updateEdgeIndicator)
    map.on('zoom', updateEdgeIndicator)
    map.on('resize', updateEdgeIndicator)
    updateEdgeIndicator()

    return () => {
      map.off('move', updateEdgeIndicator)
      map.off('zoom', updateEdgeIndicator)
      map.off('resize', updateEdgeIndicator)
    }
  }, [mapReady, updateEdgeIndicator])

  useEffect(() => {
    coordinatesRef.current = { latitude, longitude }
    if (!mapRef.current || !markerRef.current) return

    markerRef.current.setLngLat([longitude, latitude])
    mapRef.current.easeTo({
      center: [longitude, latitude],
      zoom: 17,
      duration: 900,
      essential: true,
    })
    window.setTimeout(updateEdgeIndicator, 950)
  }, [latitude, longitude, updateEdgeIndicator])

  useEffect(() => {
    mapRef.current?.setStyle(style)
  }, [style])

  return (
    <div className="vehicle-map-frame vehicle-mapbox-frame" aria-label={`${registrationNumber} map`}>
      <Group className="vehicle-map-style-switch" gap={6}>
        <Badge
          component="button"
          type="button"
          variant={style === appConfig.mapbox.streetsStyle ? 'filled' : 'light'}
          color="teal"
          onClick={() => setStyle(appConfig.mapbox.streetsStyle)}
        >
          Streets
        </Badge>
        <Badge
          component="button"
          type="button"
          variant={style === appConfig.mapbox.satelliteStyle ? 'filled' : 'light'}
          color="blue"
          onClick={() => setStyle(appConfig.mapbox.satelliteStyle)}
        >
          Satellite
        </Badge>
      </Group>
      {!appConfig.mapbox.accessToken ? (
        <div className="vehicle-mapbox-empty">
          <ThemeIcon size={42} radius="md" color="orange" variant="light">
            {vehicleType === 'BUS' ? <IconBus size={22} /> : <IconTruck size={22} />}
          </ThemeIcon>
          <Text fw={700}>Mapbox token required</Text>
          <Text size="sm" c="dimmed" ta="center">
            Detailed Mapbox maps are enabled only for production builds with VITE_MAPBOX_ACCESS_TOKEN.
          </Text>
        </div>
      ) : mapError ? (
        <div className="vehicle-mapbox-empty">
          <Text fw={700}>Map unavailable</Text>
          <Text size="sm" c="dimmed" ta="center">
            {mapError}
          </Text>
        </div>
      ) : (
        <div ref={containerRef} className="vehicle-mapbox-canvas" />
      )}
      {edgeIndicator && (
        <button
          aria-label={`Go to ${registrationNumber}`}
          className={`vehicle-mapbox-edge-pin vehicle-mapbox-edge-pin-${vehicleType.toLowerCase()}`}
          onClick={() => {
            mapRef.current?.easeTo({
              center: [longitude, latitude],
              zoom: 17,
              duration: 700,
              essential: true,
            })
          }}
          style={{ left: edgeIndicator.left, top: edgeIndicator.top }}
          type="button"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            style={{ transform: `rotate(${edgeIndicator.rotation}deg)` }}
          >
            <path d="M12 3l7 15l-7 -3l-7 3l7 -15Z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  )
}

function getVehicleDetail(vehicle: TrackableVehicle) {
  if (vehicle.vehicleType === 'BUS') {
    return `${vehicle.passengerCapacity} seats / ${vehicle.standingCapacity} standing`
  }

  return `${Number(vehicle.cargoCapacityKg ?? 0).toLocaleString()} kg cargo`
}

export function VehicleMap() {
  const module = useAuthStore((state) => state.module)
  const busesQuery = useBuses()
  const trucksQuery = useTrucks()
  const [vehicleId, setVehicleId] = useState<string | null>(null)

  const vehicles = useMemo<TrackableVehicle[]>(() => {
    const buses = module !== 'truck' ? (busesQuery.data ?? []).map((bus) => ({ ...bus, vehicleType: 'BUS' as const })) : []
    const trucks = module !== 'bus' ? (trucksQuery.data ?? []).map((truck) => ({ ...truck, vehicleType: 'TRUCK' as const })) : []
    return [...buses, ...trucks]
  }, [busesQuery.data, module, trucksQuery.data])

  const selectedVehicleId = vehicleId ? Number(vehicleId) : null
  const locationQuery = useVehicleLocation(selectedVehicleId)
  const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === vehicleId) ?? null
  const currentLocation = locationQuery.data ?? null
  const reverseGeocode = useReverseGeocodedAddress(currentLocation?.latitude, currentLocation?.longitude)

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: String(vehicle.id),
    label: vehicle.registrationNumber,
    description: `${vehicle.vehicleType} - ${vehicle.make} ${vehicle.model}`,
  }))

  useEffect(() => {
    if (!vehicleId && vehicles.length === 1) {
      setVehicleId(String(vehicles[0].id))
      return
    }

    if (!vehicleId) return
    const isStillVisible = vehicles.some((vehicle) => String(vehicle.id) === vehicleId)
    if (!isStillVisible) {
      setVehicleId(null)
    }
  }, [vehicleId, vehicles])

  const isLoading = module === 'bus' ? busesQuery.isLoading : module === 'truck' ? trucksQuery.isLoading : busesQuery.isLoading || trucksQuery.isLoading
  const loadError = busesQuery.error || trucksQuery.error || locationQuery.error

  if (isLoading) {
    return (
      <PageFrame>
        <LoadingState label="Loading vehicles" />
      </PageFrame>
    )
  }

  if (loadError) {
    return (
      <PageFrame>
        <Alert color="red" icon={<IconAlertCircle size={18} />} title="Failed to load map data">
          {loadError instanceof Error ? loadError.message : 'Unable to load vehicle map data.'}
        </Alert>
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Live map"
        title={module === 'truck' ? 'Truck map' : 'Bus map'}
        meta={
          <Text size="sm" c="dimmed">
            {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} available
          </Text>
        }
      />

      <Paper withBorder radius="md" p="md" className="app-surface">
        <Select
          label="Vehicle number"
          placeholder={vehicles.length ? 'Select vehicle' : 'No vehicles available'}
          data={vehicleOptions}
          value={vehicleId}
          onChange={setVehicleId}
          searchable
          clearable
          disabled={!vehicles.length}
          nothingFoundMessage="No vehicles found"
        />
      </Paper>

      {!vehicles.length ? (
        <Paper withBorder radius="md" p="lg" className="app-surface">
          <EmptyState title="No vehicles found" message="Vehicles assigned to your workspace will appear here." />
        </Paper>
      ) : !selectedVehicle ? (
        <Paper withBorder radius="md" p="lg" className="app-surface">
          <EmptyState title="Select a vehicle" message="Choose a vehicle number to view current location and details." />
        </Paper>
      ) : (
        <Grid>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="lg">
              <Paper withBorder radius="md" p="md" className="app-surface">
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={2}>
                      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                        Vehicle
                      </Text>
                      <Text fw={800} size="lg">
                        {selectedVehicle.registrationNumber}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {selectedVehicle.make} {selectedVehicle.model} / {selectedVehicle.year}
                      </Text>
                    </Stack>
                    <Stack gap={6} align="flex-end">
                      <Badge variant="light" color={selectedVehicle.isVehicleEnabled ? 'green' : 'gray'}>
                        {selectedVehicle.isVehicleEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Badge variant="light" color={currentLocation?.latitude != null && currentLocation?.longitude != null ? 'teal' : 'gray'}>
                        {currentLocation?.latitude != null && currentLocation?.longitude != null ? 'Location found' : 'No GPS data'}
                      </Badge>
                    </Stack>
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 1 }}>
                    <Paper withBorder p="md" radius="md" className="section-card">
                      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                        Vehicle type
                      </Text>
                      <Group gap="xs" mt={6}>
                        <ThemeIcon size={28} radius="md" color={selectedVehicle.vehicleType === 'BUS' ? 'orange' : 'blue'} variant="light">
                          {selectedVehicle.vehicleType === 'BUS' ? <IconBus size={16} /> : <IconTruck size={16} />}
                        </ThemeIcon>
                        <Text fw={600}>{selectedVehicle.vehicleType}</Text>
                      </Group>
                    </Paper>
                    <Paper withBorder p="md" radius="md" className="section-card">
                      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                        Capacity
                      </Text>
                      <Text fw={600} mt={6}>
                        {getVehicleDetail(selectedVehicle)}
                      </Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md" className="section-card">
                      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                        Last updated
                      </Text>
                      <Text fw={600} mt={6}>
                        {currentLocation?.recordedAt ? new Date(currentLocation.recordedAt).toLocaleString() : 'No timestamp available'}
                      </Text>
                    </Paper>
                  </SimpleGrid>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper withBorder radius="md" p="md" className="app-surface">
              {currentLocation?.latitude != null && currentLocation?.longitude != null ? (
                <Stack gap="md">
                  <SimpleGrid cols={{ base: 1, sm: 3 }}>
                    <Paper withBorder p="md" radius="md" className="section-card">
                      <Group gap="sm" align="flex-start" wrap="nowrap">
                        <ThemeIcon size={34} radius="md" color="teal" variant="light">
                          <IconMapPin size={18} />
                        </ThemeIcon>
                        <Stack gap={2}>
                          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                            Latitude
                          </Text>
                          <Text fw={700}>{currentLocation.latitude}</Text>
                        </Stack>
                      </Group>
                    </Paper>
                    <Paper withBorder p="md" radius="md" className="section-card">
                      <Group gap="sm" align="flex-start" wrap="nowrap">
                        <ThemeIcon size={34} radius="md" color="blue" variant="light">
                          <IconNavigation size={18} />
                        </ThemeIcon>
                        <Stack gap={2}>
                          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                            Longitude
                          </Text>
                          <Text fw={700}>{currentLocation.longitude}</Text>
                        </Stack>
                      </Group>
                    </Paper>
                    <Paper withBorder p="md" radius="md" className="section-card">
                      <Group gap="sm" align="flex-start" wrap="nowrap">
                        <ThemeIcon size={34} radius="md" color="orange" variant="light">
                          <IconMapSearch size={18} />
                        </ThemeIcon>
                        <Stack gap={2} style={{ minWidth: 0 }}>
                          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                            Address
                          </Text>
                          <Text fw={700} size="sm" lineClamp={2}>
                            {reverseGeocode.status === 'loading'
                              ? 'Finding address...'
                              : reverseGeocode.status === 'error'
                                ? 'Address lookup failed'
                                : reverseGeocode.address || 'Address unavailable'}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  </SimpleGrid>

                  <VehicleTileMap
                    latitude={currentLocation.latitude}
                    longitude={currentLocation.longitude}
                    registrationNumber={selectedVehicle.registrationNumber}
                    vehicleType={selectedVehicle.vehicleType}
                  />

                  <Group gap="xs">
                    <ThemeIcon size={30} radius="md" color="teal" variant="light">
                      <IconCurrentLocation size={16} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">
                      Location refreshes from the normal user API every 5 seconds.
                    </Text>
                  </Group>
                </Stack>
              ) : (
                <EmptyState title="No current location available" message="The selected vehicle has not emitted a GPS reading yet." />
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      )}
    </PageFrame>
  )
}
