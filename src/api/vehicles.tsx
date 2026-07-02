import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showNotification } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'
import { fetchJson, getApiErrorMessage } from './client'
import type { Bus, Truck, VehicleDocument } from '../types'

const BUS_BASE = '/api/buses'
const TRUCK_BASE = '/api/trucks'

export type VehicleDocumentScope = 'tenant-vehicle' | 'admin-truck'

function getDocumentBase(vehicleId: number, scope: VehicleDocumentScope) {
  if (scope === 'admin-truck') return `${TRUCK_BASE}/${vehicleId}/documents`
  return `/api/vehicles/${vehicleId}/documents`
}

export function useBuses() {
  return useQuery<Bus[]>({
    queryKey: ['buses'],
    queryFn: () => fetchJson<Bus[]>(BUS_BASE) as Promise<Bus[]>,
  })
}

export function useTrucks() {
  return useQuery<Truck[]>({
    queryKey: ['trucks'],
    queryFn: () => fetchJson<Truck[]>(TRUCK_BASE) as Promise<Truck[]>,
  })
}

export function useVehicleDocuments(vehicleId: number, scope: VehicleDocumentScope = 'tenant-vehicle') {
  return useQuery<VehicleDocument[]>({
    queryKey: ['vehicles', scope, vehicleId, 'documents'],
    queryFn: () => fetchJson<VehicleDocument[]>(getDocumentBase(vehicleId, scope)) as Promise<VehicleDocument[]>,
    enabled: !!vehicleId,
  })
}

export function useUploadVehicleDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      vehicleId,
      documentType,
      documentName,
      file,
      expiryDate,
      scope = 'tenant-vehicle',
    }: {
      vehicleId: number
      documentType: string
      documentName?: string
      file: File
      expiryDate?: string
      scope?: VehicleDocumentScope
    }) => {
      const fd = new FormData()
      fd.append('documentType', documentType)
      if (documentName) fd.append('documentName', documentName)
      fd.append('file', file)
      if (expiryDate) fd.append('expiryDate', expiryDate)
      return fetchJson<VehicleDocument>(`${getDocumentBase(vehicleId, scope)}/upload`, { method: 'POST', body: fd })
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['vehicles', vars.scope ?? 'tenant-vehicle', vars.vehicleId, 'documents'] })
      showNotification({ color: 'green', title: 'Uploaded', message: 'Document uploaded', icon: <IconCheck size={18} /> })
    },
    onError: (e: Error) => {
      showNotification({ color: 'red', title: 'Upload failed', message: getApiErrorMessage(e), icon: <IconX size={18} /> })
    },
  })
}

export function useDeleteVehicleDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      vehicleId,
      documentId,
      scope = 'tenant-vehicle',
    }: {
      vehicleId: number
      documentId: number
      scope?: VehicleDocumentScope
    }) => fetchJson(`${getDocumentBase(vehicleId, scope)}/${documentId}`, { method: 'DELETE' }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['vehicles', vars.scope ?? 'tenant-vehicle', vars.vehicleId, 'documents'] })
      showNotification({ color: 'green', title: 'Deleted', message: 'Document deleted', icon: <IconCheck size={18} /> })
    },
    onError: (e: Error) => {
      showNotification({ color: 'red', title: 'Delete failed', message: getApiErrorMessage(e), icon: <IconX size={18} /> })
    },
  })
}
