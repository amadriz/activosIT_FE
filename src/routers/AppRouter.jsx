import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MainMenu } from "../components/MainMenu"
import { Login } from "../components/auth/Login"
import { RegistroUsuario } from "../components/auth/RegistroUsuario"
import { ListaActivos } from "../components/activos/ListaActivos"
import { AgregarActivos } from "../components/activos/AgregarActivos"
import { ActualizarActivos } from "../components/activos/ActualizarActivos"
import { Footer } from "../components/Footer"
import { ListaPrestamos } from "../components/prestamos/listaPrestamos"
import { SolicitarPrestamo } from "../components/prestamos/SolicitarPrestamo"



export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <MainMenu />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegistroUsuario />} />
            <Route path="/agregaractivo" element={<AgregarActivos />} />
            <Route path="/" element={<ListaPrestamos />} />
            <Route path="/listaactivos" element={<ListaActivos />} />
            <Route path="/actualizaractivos/:id" element={<ActualizarActivos />} />
            <Route path="/listaPrestamos" element={<ListaPrestamos />} />
            <Route path="/solicitarprestamo" element={<SolicitarPrestamo />} />
            <Route path="/*" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
