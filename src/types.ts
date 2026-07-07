export interface LoginRequest {
  email: string
  password: string
  tenantId: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ApiError {
  status: number
  body: string
}

export interface Bus {
  id: number
  tenantId: string
  registrationNumber: string
  make: string
  model: string
  year: number
  isVehicleEnabled: boolean
  passengerCapacity: number
  standingCapacity: number
  hasAc: boolean
  hasUsb: boolean
}

export interface Truck {
  id: number
  tenantId: string
  registrationNumber: string
  make: string
  model: string
  year: number
  isVehicleEnabled: boolean
  cargoCapacityKg: number
  hasRefrigeration: boolean
  maxLoadWeightKg: number
}

export interface RegisterUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface UserResponse {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  enabled: boolean
  roles: string[]
  systemRoles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface AssignRolesRequest {
  roleIds: number[]
}

export interface RoleResponse {
  id: number
  name: string
  description: string
  tenantId: string
  permissions: string[]
  createdAt: string
}

export interface PermissionResponse {
  id: number
  name: string
  module: string
  description: string
}

export interface RoleRequest {
  name: string
  description: string
  permissionIds: number[]
}

export interface VehicleDocument {
  id: number
  vehicleId: number
  documentType: string
  documentName: string
  fileUrl: string
  expiryDate: string | null
  createdAt: string
  updatedAt: string
}

export interface VehicleCoordinates {
  latitude: number | null
  longitude: number | null
  recordedAt: string | null
}
