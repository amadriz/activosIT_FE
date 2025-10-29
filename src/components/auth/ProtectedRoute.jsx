import { Navigate } from 'react-router-dom';
import { Alert, Container, Row, Col, Button } from 'react-bootstrap';

export const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
  // Obtener datos del usuario desde sessionStorage
  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
  const token = sessionStorage.getItem('token');
  
   
  const isLoggedIn = !!(token && (userData?.email || userData?.authToken));
  const userRole = userData?.rol;

    // Si no está logueado, redirigir al login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifica un rol requerido específico
  if (requiredRole && userRole !== requiredRole) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>
                <i className="fas fa-lock me-2"></i>
                Acceso Denegado
              </Alert.Heading>
              <p>
                No tienes permisos para acceder a esta página. 
                Esta función está restringida para usuarios con rol: <strong>{requiredRole}</strong>
              </p>
              <p>
                Tu rol actual es: <strong>{userRole || 'No definido'}</strong>
              </p>
              <hr />
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-danger" 
                  onClick={() => window.history.back()}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Volver
                </Button>
                <Button 
                  variant="primary" 
                  href="/prestamos"
                >
                  <i className="fas fa-home me-2"></i>
                  Ir a Préstamos
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Si se especifican roles permitidos (array)
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>
                <i className="fas fa-lock me-2"></i>
                Acceso Denegado
              </Alert.Heading>
              <p>
                No tienes permisos para acceder a esta página. 
                Esta función está restringida para usuarios con los siguientes roles:
              </p>
              <ul>
                {allowedRoles.map((role, index) => (
                  <li key={index}><strong>{role}</strong></li>
                ))}
              </ul>
              <p>
                Tu rol actual es: <strong>{userRole || 'No definido'}</strong>
              </p>
              <hr />
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-danger" 
                  onClick={() => window.history.back()}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Volver
                </Button>
                <Button 
                  variant="primary" 
                  href="/prestamos"
                >
                  <i className="fas fa-home me-2"></i>
                  Ir a Préstamos
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Si tiene permisos, mostrar el componente
  return children;
};