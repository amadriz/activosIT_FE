import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MainMenu } from "../components/MainMenu"
import { Login } from "../components/auth/Login"
import { RegistroUsuario } from "../components/auth/RegistroUsuario"



export const AppRouter = () => {
  return (
    <>
    <BrowserRouter>
      <MainMenu />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistroUsuario />} />
        <Route path="/" element={<RegistroUsuario  />} />
        <Route path="/*" element={<Login />} />
      
      </Routes>

    </BrowserRouter>
    </>
    )
}
