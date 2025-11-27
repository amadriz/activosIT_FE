import React from 'react';
import { Card, Table, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useGetActivosMasPrestadosQuery } from '../../store/apis/dashboardApi';

export const ActivosMasPrestados = () => {
  const { data: activosData, isLoading, error } = useGetActivosMasPrestadosQuery();

  if (isLoading) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-secondary text-white">
          <i className="fas fa-trophy me-2"></i>
          Activos Más Prestados
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="secondary" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-secondary text-white">
          <i className="fas fa-trophy me-2"></i>
          Activos Más Prestados
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            Error al cargar los datos de activos más prestados
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Ensure activosData is an array
  const activosList = Array.isArray(activosData) ? activosData : (activosData ? [activosData] : []);
  
  // Format last loan date
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
      case 0: return { variant: 'warning', icon: 'fas fa-trophy', text: '1°' };
      case 1: return { variant: 'secondary', icon: 'fas fa-medal', text: '2°' };
      case 2: return { variant: 'info', icon: 'fas fa-award', text: '3°' };
      default: return { variant: 'light', icon: 'fas fa-hashtag', text: `${index + 1}°` };
    }
  };

  // Get activity status
  const getActivityStatus = (activePrestamos) => {
    const activos = parseInt(activePrestamos) || 0;
    return activos > 0 
      ? { variant: 'success', text: 'En uso', icon: 'fas fa-circle' }
      : { variant: 'secondary', text: 'Disponible', icon: 'fas fa-circle' };
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-secondary text-white">
        <Row className="align-items-center">
          <Col>
            <i className="fas fa-trophy me-2"></i>
            Activos Más Prestados
          </Col>
          <Col xs="auto">
            <Badge bg="light" text="dark" className="ms-2">
              Top {activosList.length}
            </Badge>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        {activosList.length > 0 ? (
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-center" width="80">#</th>
                <th>Activo</th>
                <th className="text-center">Categoría</th>
                <th className="text-center">Total</th>
                <th className="text-center">Completados</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Uso Promedio</th>
                <th className="text-center">Último Préstamo</th>
              </tr>
            </thead>
            <tbody>
              {activosList.map((activo, index) => {
                const ranking = getRankingBadge(index);
                const activity = getActivityStatus(activo.prestamos_activos);
                
                return (
                  <tr key={activo.id_activo}>
                    {/* Ranking */}
                    <td className="text-center align-middle">
                      <Badge bg={ranking.variant} className="d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                        <i className={ranking.icon} style={{ fontSize: '12px' }}></i>
                      </Badge>
                      <small className="text-muted d-block mt-1">{ranking.text}</small>
                    </td>
                    
                    {/* Asset Info */}
                    <td className="align-middle">
                      <div>
                        <strong className="text-primary">{activo.nombre_activo}</strong>
                        <br />
                        <small className="text-muted">
                          <i className="fas fa-barcode me-1"></i>
                          {activo.codigo_activo}
                        </small>
                        <br />
                        <small className="text-info">
                          <i className="fas fa-tag me-1"></i>
                          {activo.marca}
                        </small>
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td className="text-center align-middle">
                      <Badge bg="outline-primary" className="badge-outline">
                        {activo.categoria}
                      </Badge>
                    </td>
                    
                    {/* Total Loans */}
                    <td className="text-center align-middle">
                      <h5 className="mb-0 text-primary">{activo.total_prestamos}</h5>
                      <small className="text-muted">préstamos</small>
                    </td>
                    
                    {/* Completed Loans */}
                    <td className="text-center align-middle">
                      <span className="fw-bold text-success">{activo.prestamos_completados}</span>
                      {parseInt(activo.total_prestamos) > 0 && (
                        <small className="d-block text-muted">
                          {((parseInt(activo.prestamos_completados) / parseInt(activo.total_prestamos)) * 100).toFixed(0)}%
                        </small>
                      )}
                    </td>
                    
                    {/* Status */}
                    <td className="text-center align-middle">
                      <div className="d-flex align-items-center justify-content-center">
                        <i className={activity.icon} style={{ color: activity.variant === 'success' ? '#28a745' : '#6c757d', fontSize: '8px' }}></i>
                        <span className={`ms-2 small text-${activity.variant}`}>{activity.text}</span>
                      </div>
                      {parseInt(activo.prestamos_activos) > 0 && (
                        <small className="text-warning">({activo.prestamos_activos} activos)</small>
                      )}
                    </td>
                    
                    {/* Average Usage */}
                    <td className="text-center align-middle">
                      <span className="fw-bold">{parseFloat(activo.promedio_horas_uso).toFixed(1)}</span>
                      <small className="d-block text-muted">horas</small>
                    </td>
                    
                    {/* Last Loan */}
                    <td className="text-center align-middle">
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(activo.ultimo_prestamo)}
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
            <i className="fas fa-trophy fa-3x mb-3 opacity-50"></i>
            <h6 className="mb-2">Sin Datos de Préstamos</h6>
            <p className="small mb-0">No hay activos con historial de préstamos</p>
            <div className="mt-3 p-3 bg-light rounded mx-3">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Los datos aparecerán cuando se completen préstamos de activos
              </small>
            </div>
          </div>
        )}
      </Card.Body>
      
      {/* Footer with summary */}
      {activosList.length > 0 && (
        <Card.Footer className="bg-light">
          <Row className="text-center">
            <Col md={3}>
              <small className="text-muted">Total Activos Prestados</small>
              <div className="fw-bold text-primary">{activosList.length}</div>
            </Col>
            <Col md={3}>
              <small className="text-muted">Total Préstamos</small>
              <div className="fw-bold text-info">
                {activosList.reduce((sum, activo) => sum + parseInt(activo.total_prestamos), 0)}
              </div>
            </Col>
            <Col md={3}>
              <small className="text-muted">Préstamos Completados</small>
              <div className="fw-bold text-success">
                {activosList.reduce((sum, activo) => sum + parseInt(activo.prestamos_completados), 0)}
              </div>
            </Col>
            <Col md={3}>
              <small className="text-muted">Promedio de Uso</small>
              <div className="fw-bold text-warning">
                {activosList.length > 0 
                  ? (activosList.reduce((sum, activo) => sum + parseFloat(activo.promedio_horas_uso), 0) / activosList.length).toFixed(1)
                  : 0
                } hrs
              </div>
            </Col>
          </Row>
        </Card.Footer>
      )}
    </Card>
  );
};