import React from 'react';
import { Card, Row, Col, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useGetPrestamosTasaAprobacionQuery } from '../../store/apis/dashboardApi';

const COLORS = {
  aprobados: '#28a745',    // Green
  rechazados: '#dc3545',  // Red
  pendientes: '#6c757d'   // Gray
};

export const PrestamosTasaAprobacion = () => {
  const { data: tasaData, isLoading, error } = useGetPrestamosTasaAprobacionQuery();

  if (isLoading) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-success text-white">
          <i className="fas fa-check-circle me-2"></i>
          Tasa de Aprobación
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="success" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-success text-white">
          <i className="fas fa-check-circle me-2"></i>
          Tasa de Aprobación
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            Error al cargar los datos de aprobación
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const totalSolicitudes = parseInt(tasaData.total_solicitudes) || 0;
  const aprobados = parseInt(tasaData.aprobados) || 0;
  const rechazados = parseInt(tasaData.rechazados) || 0;
  const tasaAprobacion = parseFloat(tasaData.tasa_aprobacion) || 0;

  // Create chart data only if there are solicitudes
  const chartData = totalSolicitudes > 0 ? [
    {
      name: 'Aprobados',
      value: aprobados,
      color: COLORS.aprobados
    },
    {
      name: 'Rechazados',
      value: rechazados,
      color: COLORS.rechazados
    }
  ].filter(item => item.value > 0) : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalSolicitudes) * 100).toFixed(1);
      return (
        <div className="bg-dark text-white p-2 rounded shadow">
          <p className="mb-1">{payload[0].name}</p>
          <p className="mb-0 fw-bold">{payload[0].value} ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  // Determine progress bar variant based on approval rate
  const getProgressVariant = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    if (rate >= 40) return 'info';
    return 'danger';
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-success text-white">
        <i className="fas fa-check-circle me-2"></i>
        Tasa de Aprobación
      </Card.Header>
      <Card.Body>
        {totalSolicitudes > 0 ? (
          <>
            {/* Main Approval Rate */}
            <Row className="text-center mb-3">
              <Col>
                <h2 className="text-success mb-1">{tasaAprobacion.toFixed(1)}%</h2>
                <small className="text-muted">Tasa de Aprobación</small>
              </Col>
            </Row>

            {/* Progress Bar */}
            <div className="mb-3">
              <ProgressBar 
                now={tasaAprobacion} 
                variant={getProgressVariant(tasaAprobacion)}
                className="mb-1"
                style={{ height: '8px' }}
              />
              <div className="d-flex justify-content-between">
                <small className="text-muted">0%</small>
                <small className="text-muted">100%</small>
              </div>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-3">
              <Col className="text-center">
                <div className="border rounded p-2">
                  <h5 className="text-primary mb-1">{totalSolicitudes}</h5>
                  <small className="text-muted">Total Solicitudes</small>
                </div>
              </Col>
            </Row>

            {/* Pie Chart */}
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={24}
                    formatter={(value) => (
                      <span className="small">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Breakdown Stats */}
            <Row className="mt-2">
              <Col className="text-center">
                <div className="d-flex justify-content-around">
                  <small className="text-success">
                    <i className="fas fa-check-circle me-1"></i>
                    Aprobados: {aprobados}
                  </small>
                  <small className="text-danger">
                    <i className="fas fa-times-circle me-1"></i>
                    Rechazados: {rechazados}
                  </small>
                </div>
              </Col>
            </Row>
          </>
        ) : (
          /* No Data State */
          <div className="text-center text-muted h-100 d-flex flex-column justify-content-center">
            <i className="fas fa-clipboard-list fa-3x mb-3 opacity-50"></i>
            <h6 className="mb-2">Sin Solicitudes</h6>
            <p className="small mb-0">No hay solicitudes de préstamos aún</p>
            <div className="mt-3 p-3 bg-light rounded">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Las estadísticas aparecerán cuando se registren solicitudes
              </small>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};