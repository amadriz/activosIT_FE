import { HashRouter, Route, Routes } from "react-router-dom"
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
import { ListaUbicaciones } from "../components/ubicaciones/ListaUbicaciones"
import { ActualizarUbicacion } from "../components/ubicaciones/ActualizarUbicacion"
import { AgregarUbicacion } from "../components/ubicaciones/AgregarUbicacion"
import { ListaMarcas } from "../components/marcas/ListaMarcas"
import { AgregarMarca } from "../components/marcas/AgregarMarca"
import { ActualizarMarca } from "../components/marcas/ActualizarMarca"
import { ListaProveedores } from "../components/proveedores/ListaProveedores"
import { AgregarProveedor } from "../components/proveedores/AgregarProveedor"
import { ActualizarProveedor } from "../components/proveedores/ActualizarProveedor"
import { Dashboard } from "../components/dashboard/Dashboard"



export const AppRouter = () => {
  return (
    <HashRouter>
      <div className="d-flex flex-column min-vh-100">
        <MainMenu />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard route - for admins */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Rutas solo para administradores */}
            <Route path="/register" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RegistroUsuario />
              </ProtectedRoute>
            } />
            
            {/* RUTAS ACTIVOS */}
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
            {/* RUTAS CATEGORIAS */}
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
            {/* RUTAS UBICACIONES */}
            <Route path="/listaubicaciones" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ListaUbicaciones />
              </ProtectedRoute>
            } />
            <Route path="/agregarubicacion" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgregarUbicacion />
              </ProtectedRoute>
            } />
            <Route path="/actualizarubicacion/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ActualizarUbicacion />
              </ProtectedRoute>
            } />
            {/* RUTAS PRESTAMO */}
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

            {/**RUTAS MARCAS **/}
            <Route path="/listamarcas" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ListaMarcas />
              </ProtectedRoute>
            } />
            <Route path="/agregarmarca" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgregarMarca />
              </ProtectedRoute>
            } />
            <Route path="/actualizarmarca/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ActualizarMarca />
              </ProtectedRoute>
            } />

            {/* RUTAS PROVEEDORES */}
            <Route path="/listaproveedores" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ListaProveedores />
              </ProtectedRoute>
            } />
            <Route path="/agregarproveedor" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgregarProveedor />
              </ProtectedRoute>
            } />
            <Route path="/actualizarproveedor/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ActualizarProveedor />
              </ProtectedRoute>
            } />
            <Route path="/agregarproveedor" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgregarProveedor />
              </ProtectedRoute>
            } />
            <Route path="/actualizarproveedor/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ActualizarProveedor />
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
    </HashRouter>
  )
}
