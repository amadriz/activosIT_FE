import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MainMenu } from "../components/MainMenu"
import { Login } from "../components/auth/Login"
import { RegistroUsuario } from "../components/auth/RegistroUsuario"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"
import { ListaActivos } from "../components/activos/ListaActivos"
import { AgregarActivos } from "../components/activos/AgregarActivos"
import { ActualizarActivos } from "../components/activos/ActualizarActivos"
import { ListaCategorias } from "../components/categorias/ListaCategorias"
import { AgregarCategoria } from "../components/categorias/AgregarCategoria"
import { ActualizarCategoria } from "../components/categorias/ActualizarCategoria"
import { Footer } from "../components/Footer"
import { ListaPrestamos } from "../components/prestamos/listaPrestamos"
import { SolicitarPrestamo } from "../components/prestamos/SolicitarPrestamo"
import { AprobarPrestamo } from "../components/prestamos/AprobarPrestamo"
import { EntregarPrestamo } from "../components/prestamos/EntregarPrestamo"
import { DevolverPrestamo } from "../components/prestamos/DevolverPrestamo"



export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <MainMenu />
        <main className="flex-grow-1">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas solo para administradores */}
            <Route path="/register" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RegistroUsuario />
              </ProtectedRoute>
            } />
            <Route path="/agregaractivo" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgregarActivos />
              </ProtectedRoute>
            } />
            <Route path="/listaactivos" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ListaActivos />
              </ProtectedRoute>
            } />
            <Route path="/actualizaractivos/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ActualizarActivos />
              </ProtectedRoute>
            } />
            <Route path="/listacategorias" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ListaCategorias />
              </ProtectedRoute>
            } />
            <Route path="/agregarcategoria" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgregarCategoria />
              </ProtectedRoute>
            } />
            <Route path="/actualizarcategoria/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ActualizarCategoria />
              </ProtectedRoute>
            } />
            <Route path="/aprobarprestamo/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AprobarPrestamo />
              </ProtectedRoute>
            } />
            <Route path="/entregarprestamo/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EntregarPrestamo />
              </ProtectedRoute>
            } />
            <Route path="/devolverprestamo/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DevolverPrestamo />
              </ProtectedRoute>
            } />

            {/* Rutas para usuarios autenticados (cualquier rol) */}
            <Route path="/listaprestamos" element={
              <ProtectedRoute allowedRoles={["admin",  "estudiante", "profesor"]}>
                <ListaPrestamos />
              </ProtectedRoute>
            } />
            <Route path="/prestamos" element={
              <ProtectedRoute allowedRoles={["admin",  "estudiante", "profesor"]}>
                <ListaPrestamos />
              </ProtectedRoute>
            } />
            <Route path="/solicitarprestamo" element={
              <ProtectedRoute allowedRoles={["admin",  "estudiante", "profesor"]}>
                <SolicitarPrestamo />
              </ProtectedRoute>
            } />

            {/* Ruta por defecto */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={["admin",  "estudiante", "profesor"]}>
                <ListaPrestamos />
              </ProtectedRoute>
            } />
            
            {/* Ruta de fallback */}
            <Route path="/*" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
