import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MainMenu } from "../components/MainMenu"
import { Login } from "../components/auth/Login"
import { RegistroUsuario } from "../components/auth/RegistroUsuario"
import { ListaActivos } from "../components/activos/ListaActivos"



export const AppRouter = () => {
  return (
    <>
    <BrowserRouter>
      <MainMenu />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistroUsuario />} />
        <Route path="/" element={<ListaActivos  />} />
        <Route path="/*" element={<Login />} />
      
      </Routes>

    </BrowserRouter>
    </>
    )
}
