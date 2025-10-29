import { useLoginMutation } from "../../store/apis/authApi";

import{ useState } from "react";
import { useNavigate } from "react-router-dom";

import { Container, Row, Col, Form, Button } from "react-bootstrap";

//Import validator
import validator from "validator";

import { toast } from "react-toastify";
import "./Login.css";

const initialState = {
  email: "",
  password: "",
  
};


export const Login = () => {

  const [login, { isLoading, isError, error }] = useLoginMutation();


  let navigate = useNavigate();
    
  const [loginData, setLoginData] = useState(initialState);
  const { email, password } = loginData;

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return validator.isEmail(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6; 
  };


  const handleFormSubmit = async (e) => {
    
    e.preventDefault();

    let validationErrors = {};

    if (!validateEmail(email)) {
      validationErrors.email = "Ingresar un email válido";
    }

    if (!validatePassword(password)) {
      validationErrors.password = "El password debe tener al menos 6 caracteres";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      return;
    }      try {
      // Clear previous errors
      setErrors({});

      // The unwrap() function extracts the actual data payload from the 
      // mutation result or throws an error if the mutation was unsuccessful.
      const result = await login(loginData).unwrap();     

      console.log("Login result:", result); // Debug log
     
     const authToken = result.auth?.authToken;
     const userData = result.auth || {};

     // Save the complete user data in sessionStorage
     if (authToken && userData) {
       sessionStorage.setItem("token", authToken);
       sessionStorage.setItem("userData", JSON.stringify(userData));
       
       toast.success("Ingreso correcto");

       // Navigate to prestamos (the main protected route)
       navigate("/prestamos");
       
       // Don't reload the page - let React Router handle the navigation

     } else {
        toast.error("Error en el ingreso - Token no recibido");
        setLoginData(initialState);
      }

    } catch (e) {
      console.error("Login error:", e);
      
      // Handle different types of errors
      if (e?.data?.message) {
        toast.error(`Error en el ingreso: ${e.data.message}`);
      } else if (e?.message) {
        toast.error(`Error en el ingreso: ${e.message}`);
      } else if (error?.data?.message) {
        toast.error(`Error en el ingreso: ${error.data.message}`);
      } else {
        toast.error("Error en el ingreso. Verifique sus credenciales.");
      }
      
      setLoginData(initialState);
    }
  }
  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    
    });

    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-form-1">
          <h1 className="text-center">Ingresar</h1>
            <Form onSubmit={handleFormSubmit}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Email" 
                  name="email" 
                  value={email}                 
                  onChange={handleChange} 
                  autoComplete="email"
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  name="password"
                  autoComplete="password"
                  value={password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}                  
                />
                <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
              </Form.Group>
              <div className="d-grid gap-2 mt-3">
                <Button type="submit" variant="primary" className="btn-submit-custom" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="sr-only">Loading...</span>
                  </>
                ) : (
                  'Login'
                )}
                </Button>
            </div>
            </Form>
        </div>
      </div>
    </>
  )
}




