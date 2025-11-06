import React, { useEffect, useState } from "react";

//endpoint register
import { useRegisterMutation } from "../../store/apis/authApi";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
//import jwt decode
import { jwtDecode } from "jwt-decode";
import "./RegistroUsuario.css";

//Toastify para mostrar mensajes
import validator from "validator";

//React Bootstrap
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const initialState = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  rol: "",
  validated: false,
};

export const RegistroUsuario = () => {
  const [formData, setFormData] = useState(initialState);

  const [errors, setErrors] = useState({});
  const [confirmPassword, setConfirmPassword] = useState("");

  const [register] = useRegisterMutation();

  const { nombre, apellido, email, password, rol, validated } = formData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when input changes
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setErrors({
      ...errors,
      confirmPassword: "",
    });
  };

  const handleFormSubmit = async (e) => {
    try {
      e.preventDefault();
      let isValid = true;
      let newErrors = {};

      if (!validator.isAlpha(nombre)) {
        isValid = false;
        newErrors.nombre = "Debe ingresar un nombre";
      }
      if (!validator.isAlpha(apellido)) {
        isValid = false;
        newErrors.apellido = "Debe ingresar un apellido";
      }
      if (!validator.isEmail(email)) {
        isValid = false;
        newErrors.email = "Debe ingresar un email válido";
      }
      if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
        isValid = false;
        newErrors.password = "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número";
      }
      if (password !== confirmPassword) {
        isValid = false;
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
      if (rol === "") {
        isValid = false;
        newErrors.rol = "Debe seleccionar un rol";
      }

      setErrors(newErrors);

      if (!isValid) {
        setFormData({ ...formData, validated: true });
        return; // Prevent form submission if there are validation errors
      }

      // Submit form logic here
      register(formData);
      toast.success("Usuario registrado con éxito");
      setFormData(initialState);
    } catch (error) {
      // console.log(error);
      toast.error("Error al registrar el usuario");
    }
  };

  // user register permissions if not will be redirected to home
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

//   useEffect(() => {
//     const userRole = sessionStorage.getItem("rol");
//     const allowedRole = "admin";

//     if (userRole) {
//         // Case-insensitive comparison and trim whitespace
//         const processedRole = userRole.trim().toLowerCase();
        
//         if (processedRole === allowedRole) {
//             setIsAuthorized(true);
//         } else {
//             toast.error("No tienes permisos para acceder a esta página. Solo los administradores pueden registrar usuarios.");
//             navigate("/login");
//         }
//     } else {
//         console.log("No role found in session storage");
//         toast.error("Acceso denegado");
//         navigate("/");
//     }
// }, [navigate]);

//   if (!isAuthorized) {
//     return null;
//   }

  return (
    <Container className="registro-container">
      <Row className="formContainer mb-5">
        <Row>
          <h1 className="text-center p-5 ">Registro de usuario</h1>
        </Row>
        <Row>
          <Col className="mt-3">
            <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
              <Form.Control type="hidden" name="id" value={formData.id} />
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Nombre"
                  name="nombre"
                  value={nombre}
                  onChange={handleInputChange}
                  required
                  isInvalid={!!errors.nombre}
                  isValid={errors.nombre === ""}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Apellido"
                  name="apellido"
                  value={apellido}
                  onChange={handleInputChange}
                  required
                  isInvalid={!!errors.apellido}
                  isValid={errors.apellido === ""}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.apellido}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  required
                  isInvalid={!!errors.email}
                  isValid={errors.email === ""}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Select
                  name="rol"
                  value={rol}
                  onChange={handleInputChange}
                  required
                  isInvalid={!!errors.rol}
                  isValid={errors.rol === ""}
                >
                  <option value="">Seleccionar rol</option>
                  <option value="admin">Administrador</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="profesor">Profesor</option>
                  <option value="tecnico">Técnico</option>
                  
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.rol}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  required
                  isInvalid={!!errors.password}
                  isValid={errors.password === ""}
                  autoComplete="new-password"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Confirme la contraseña"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  isInvalid={!!errors.confirmPassword}
                  isValid={errors.confirmPassword === ""}
                  autoComplete="new-password"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="button-container">
                <Button className="btn-submit-custom" type="submit">
                  Enviar
                </Button>
                
              </div>
            </Form>
          </Col>
        </Row>
      </Row>
      <Row></Row>
    </Container>
  );
};
