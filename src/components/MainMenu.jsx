import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Badge, Button } from 'react-bootstrap';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './prestamos/EstilosPrestamo.css';

export const MainMenu = () => {
  const { 
    isLoggedIn, 
    isAdmin, 
    isStudent, 
    isTeacher, 
    isTechnician,
    userRole, 
    userEmail, 
    logout 
  } = useAuth();

  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (!isLoggedIn) {
    return null; // No mostrar menú si no está logueado
  }

  return (
    <Navbar expand="lg" className="bg-primary" variant="dark">
      <Container>
        <Navbar.Brand onClick={() => handleNavigation('/prestamos')} style={{cursor: 'pointer'}}>
          <i className="fas fa-laptop me-2"></i>
          Sistema de Gestión de Activos IT
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            
            {/* Sección de Préstamos - Para todos los usuarios autenticados */}
            <NavDropdown title={<><i className="fas fa-handshake me-1"></i>Préstamos</>} id="prestamos-dropdown">
              <NavDropdown.Item onClick={() => handleNavigation('/prestamos')}>
                <i className="fas fa-list me-2"></i>Ver Préstamos
              </NavDropdown.Item>
              
              {/* Solicitar préstamo - Solo para estudiantes y profesores */}
              {(isStudent() || isTeacher()) && (
                <NavDropdown.Item onClick={() => handleNavigation('/solicitarprestamo')}>
                  <i className="fas fa-plus-circle me-2"></i>Solicitar Préstamo
                </NavDropdown.Item>
              )}
            </NavDropdown>

            {/* Sección Administrativa - Solo para administradores y técnicos */}
            {(isAdmin() || isTechnician()) && (
              <NavDropdown title={<><i className="fas fa-cog me-1"></i>Administración</>} id="admin-dropdown">
                
                {/* Gestión de Activos - Para admin y técnicos */}
                <NavDropdown.Header>Gestión de Activos</NavDropdown.Header>
                <NavDropdown.Item onClick={() => handleNavigation('/listaactivos')}>
                  <i className="fas fa-laptop me-2"></i>Lista de Activos
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleNavigation('/agregaractivo')}>
                  <i className="fas fa-plus me-2"></i>Agregar Activo
                </NavDropdown.Item>
                <NavDropdown.Header>Gestión de Catálogos</NavDropdown.Header>
                <NavDropdown.Item onClick={() => handleNavigation('/listacategorias')}>
                  <i className="fas fa-laptop me-2"></i>Lista de Categorías
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleNavigation('/listaubicaciones')}>
                  <i className="fas fa-laptop me-2"></i>Lista de Ubicaciones
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleNavigation('/listamarcas')}>
                  <i className="fas fa-laptop me-2"></i>Lista de Marcas-Activos
                </NavDropdown.Item>
                
                {/* Gestión de Usuarios - Solo para administradores */}
                {isAdmin() && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Header>Gestión de Usuarios</NavDropdown.Header>
                    <NavDropdown.Item onClick={() => handleNavigation('/register')}>
                      <i className="fas fa-user-plus me-2"></i>Registrar Usuario
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            )}

          </Nav>

          {/* Información del usuario y logout */}
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <i className="fas fa-user-circle me-1"></i>
                  {userEmail || 'Usuario'} 
                  <Badge bg="secondary" className="ms-2">{userRole}</Badge>
                </span>
              } 
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Header>
                <div className="text-center">
                  <i className="fas fa-user-circle fa-2x mb-2"></i>
                  <div><strong>{userEmail || 'Usuario'}</strong></div>
                  <small className="text-muted">{userRole}</small>
                </div>
              </NavDropdown.Header>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => handleNavigation('/prestamos')}>
                <i className="fas fa-home me-2"></i>Inicio
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>
                <i className="fas fa-sign-out-alt me-2 text-danger"></i>
                <span className="text-danger">Cerrar Sesión</span>
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
