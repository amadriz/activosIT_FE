import React from 'react';
import { Card, Table, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useGetUsuariosMasActivosQuery } from '../../store/apis/dashboardApi';

export const UsuariosMasActivos = () => {
  const { data: usuariosData, isLoading, error } = useGetUsuariosMasActivosQuery();

  if (isLoading) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-dark text-white">
          <i className="fas fa-users me-2"></i>
          Usuarios Más Activos
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="dark" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-dark text-white">
          <i className="fas fa-users me-2"></i>
          Usuarios Más Activos
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            Error al cargar los datos de usuarios más activos
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Ensure usuariosData is an array
  const usuariosList = Array.isArray(usuariosData) ? usuariosData : (usuariosData ? [usuariosData] : []);
  
  // Format last request date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get ranking position style
  const getRankingBadge = (index) => {
    switch(index) {
      case 0: return { variant: 'warning', icon: 'fas fa-crown', text: '1°' };
      case 1: return { variant: 'secondary', icon: 'fas fa-medal', text: '2°' };
      case 2: return { variant: 'info', icon: 'fas fa-star', text: '3°' };
      default: return { variant: 'light', icon: 'fas fa-user', text: `${index + 1}°` };
    }
  };

  // Get role badge styling
  const getRoleBadge = (rol) => {
    switch(rol.toLowerCase()) {
      case 'admin': return { variant: 'danger', icon: 'fas fa-user-shield' };
      case 'profesor': return { variant: 'primary', icon: 'fas fa-chalkboard-teacher' };
      case 'estudiante': return { variant: 'success', icon: 'fas fa-user-graduate' };
      case 'tecnico': return { variant: 'info', icon: 'fas fa-tools' };
      default: return { variant: 'secondary', icon: 'fas fa-user' };
    }
  };

  // Calculate activity level
  const getActivityLevel = (totalPrestamos) => {
    const total = parseInt(totalPrestamos) || 0;
    if (total >= 10) return { level: 'Muy Alto', color: 'success', progress: 100 };
    if (total >= 5) return { level: 'Alto', color: 'warning', progress: 75 };
    if (total >= 2) return { level: 'Medio', color: 'info', progress: 50 };
    if (total >= 1) return { level: 'Bajo', color: 'secondary', progress: 25 };
    return { level: 'Inactivo', color: 'light', progress: 0 };
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-dark text-white">
        <Row className="align-items-center">
          <Col>
            <i className="fas fa-users me-2"></i>
            Usuarios Más Activos
          </Col>
          <Col xs="auto">
            <Badge bg="light" text="dark" className="ms-2">
              Top {usuariosList.length}
            </Badge>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        {usuariosList.length > 0 ? (
          <Table responsive hover className="mb-0">
            <thead className="table-dark">
              <tr>
                <th className="text-center" width="80">#</th>
                <th>Usuario</th>
                <th className="text-center">Rol</th>
                <th className="text-center">Total Préstamos</th>
                <th className="text-center">Aprobados</th>
                <th className="text-center">Pendientes</th>
                <th className="text-center">Nivel Actividad</th>
                <th className="text-center">Última Solicitud</th>
              </tr>
            </thead>
            <tbody>
              {usuariosList.map((usuario, index) => {
                const ranking = getRankingBadge(index);
                const roleBadge = getRoleBadge(usuario.rol);
                const activity = getActivityLevel(usuario.total_prestamos);
                
                return (
                  <tr key={usuario.id_usuario}>
                    {/* Ranking */}
                    <td className="text-center align-middle">
                      <Badge bg={ranking.variant} className="d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                        <i className={ranking.icon} style={{ fontSize: '12px' }}></i>
                      </Badge>
                      <small className="text-muted d-block mt-1">{ranking.text}</small>
                    </td>
                    
                    {/* User Info */}
                    <td className="align-middle">
                      <div>
                        <strong className="text-primary">{usuario.usuario}</strong>
                        <br />
                        <small className="text-muted">
                          <i className="fas fa-envelope me-1"></i>
                          {usuario.email}
                        </small>
                      </div>
                    </td>
                    
                    {/* Role */}
                    <td className="text-center align-middle">
                      <Badge bg={roleBadge.variant} className="d-flex align-items-center justify-content-center mx-auto" style={{ width: 'fit-content' }}>
                        <i className={`${roleBadge.icon} me-1`}></i>
                        {usuario.rol}
                      </Badge>
                    </td>
                    
                    {/* Total Loans */}
                    <td className="text-center align-middle">
                      <h5 className="mb-0 text-primary">{usuario.total_prestamos}</h5>
                      <small className="text-muted">préstamos</small>
                    </td>
                    
                    {/* Approved Loans */}
                    <td className="text-center align-middle">
                      <span className="fw-bold text-success">{usuario.prestamos_aprobados}</span>
                      {parseInt(usuario.total_prestamos) > 0 && (
                        <small className="d-block text-muted">
                          {((parseInt(usuario.prestamos_aprobados) / parseInt(usuario.total_prestamos)) * 100).toFixed(0)}%
                        </small>
                      )}
                    </td>
                    
                    {/* Pending Loans */}
                    <td className="text-center align-middle">
                      {parseInt(usuario.prestamos_pendientes) > 0 ? (
                        <>
                          <span className="fw-bold text-warning">{usuario.prestamos_pendientes}</span>
                          <small className="d-block text-muted">pendientes</small>
                        </>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    
                    {/* Activity Level */}
                    <td className="text-center align-middle">
                      <div className="d-flex flex-column align-items-center">
                        <Badge bg={activity.color} className="mb-1">
                          {activity.level}
                        </Badge>
                        <div className="progress" style={{ width: '60px', height: '4px' }}>
                          <div 
                            className={`progress-bar bg-${activity.color}`} 
                            role="progressbar" 
                            style={{ width: `${activity.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Last Request */}
                    <td className="text-center align-middle">
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(usuario.ultima_solicitud)}
                      </small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          /* No Data State */
          <div className="text-center text-muted py-5">
            <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
            <h6 className="mb-2">Sin Usuarios Activos</h6>
            <p className="small mb-0">No hay usuarios con actividad de préstamos</p>
            <div className="mt-3 p-3 bg-light rounded mx-3">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Los datos aparecerán cuando los usuarios soliciten préstamos
              </small>
            </div>
          </div>
        )}
      </Card.Body>
      
      {/* Footer with summary */}
      {usuariosList.length > 0 && (
        <Card.Footer className="bg-light">
          <Row className="text-center">
            <Col md={3}>
              <small className="text-muted">Total Usuarios Activos</small>
              <div className="fw-bold text-primary">{usuariosList.length}</div>
            </Col>
            <Col md={3}>
              <small className="text-muted">Total Préstamos</small>
              <div className="fw-bold text-info">
                {usuariosList.reduce((sum, usuario) => sum + parseInt(usuario.total_prestamos), 0)}
              </div>
            </Col>
            <Col md={3}>
              <small className="text-muted">Préstamos Aprobados</small>
              <div className="fw-bold text-success">
                {usuariosList.reduce((sum, usuario) => sum + parseInt(usuario.prestamos_aprobados), 0)}
              </div>
            </Col>
            <Col md={3}>
              <small className="text-muted">Préstamos Pendientes</small>
              <div className="fw-bold text-warning">
                {usuariosList.reduce((sum, usuario) => sum + parseInt(usuario.prestamos_pendientes), 0)}
              </div>
            </Col>
          </Row>
        </Card.Footer>
      )}
    </Card>
  );
};