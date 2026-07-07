import { Navigate, Outlet } from 'react-router-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { ModuleSelect } from './pages/ModuleSelect'
import { VehicleSelection } from './pages/VehicleSelection'
import { VehicleMap } from './pages/VehicleMap'
import { Buses } from './pages/Buses'
import { Trucks } from './pages/Trucks'
import { UsersPage } from './pages/UsersPage'
import { RolesPage } from './pages/RolesPage'
import { useAuthStore } from './stores/useAuthStore'
import type { AppModule } from './stores/useAuthStore'

function ModuleGuard() {
  const module = useAuthStore((state) => state.module) as AppModule
  if (!module) return <Navigate to="/select-module" replace />
  return <Outlet />
}

function RootRedirect() {
  const module = useAuthStore((state) => state.module) as AppModule
  if (!module) return <Navigate to="/select-module" replace />
  if (module === 'bus') return <Navigate to="/buses" replace />
  return <Navigate to="/trucks" replace />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/select-module" element={<ModuleSelect />} />
          <Route element={<ModuleGuard />}>
            <Route element={<Layout />}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/vehicles" element={<VehicleSelection />} />
              <Route path="/map" element={<VehicleMap />} />
              <Route path="/buses" element={<Buses />} />
              <Route path="/trucks" element={<Trucks />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/roles" element={<RolesPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
