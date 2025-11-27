import React from 'react';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGetPrestamosResumenQuery } from '../../store/apis/dashboardApi';

const STATUS_COLORS = {
  solicitados: '#6c757d',   // Gray
  aprobados: '#17a2b8',     // Info blue
  entregados: '#28a745',    // Success green
  devueltos: '#20c997',     // Teal
  rechazados: '#dc3545'     // Danger red
};

const STATUS_ICONS = {
  solicitados: 'fas fa-clock',
  aprobados: 'fas fa-check',
  entregados: 'fas fa-handshake',
  devueltos: 'fas fa-undo',
  rechazados: 'fas fa-times'
};

const STATUS_LABELS = {
  solicitados: 'Solicitados',
  aprobados: 'Aprobados',
  entregados: 'Entregados',
  devueltos: 'Devueltos',
  rechazados: 'Rechazados'
};

export const PrestamosResumen = () => {
  const { data: resumenData, isLoading, error } = useGetPrestamosResumenQuery();

  if (isLoading) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-warning text-white">
          <i className="fas fa-handshake me-2"></i>
          Resumen de Préstamos
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="warning" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-warning text-white">
          <i className="fas fa-handshake me-2"></i>
          Resumen de Préstamos
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            Error al cargar los datos de préstamos
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Transform data for the bar chart
  const chartData = [
    {
      name: 'Solicitados',
      value: parseInt(resumenData.solicitados) || 0,
      color: STATUS_COLORS.solicitados
    },
    {
      name: 'Aprobados',
      value: parseInt(resumenData.aprobados) || 0,
      color: STATUS_COLORS.aprobados
    },
    {
      name: 'Entregados',
      value: parseInt(resumenData.entregados) || 0,
      color: STATUS_COLORS.entregados
    },
    {
      name: 'Devueltos',
      value: parseInt(resumenData.devueltos) || 0,
      color: STATUS_COLORS.devueltos
    },
    {
      name: 'Rechazados',
      value: parseInt(resumenData.rechazados) || 0,
      color: STATUS_COLORS.rechazados
    }
  ];

  const totalPrestamos = parseInt(resumenData.total_prestamos) || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark text-white p-2 rounded shadow">
          <p className="mb-1 fw-bold">{payload[0].payload.name}</p>
          <p className="mb-0">{payload[0].value} préstamos</p>
        </div>
      );
    }
    return null;
  };

  // Helper function to get status variant
  const getStatusVariant = (status) => {
    switch(status) {
      case 'entregados': return 'success';
      case 'devueltos': return 'info';
      case 'aprobados': return 'primary';
      case 'solicitados': return 'secondary';
      case 'rechazados': return 'danger';
      default: return 'light';
    }
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-warning text-white">
        <i className="fas fa-handshake me-2"></i>
        Resumen de Préstamos
        <Badge bg="light" text="dark" className="ms-2">
          Total: {totalPrestamos}
        </Badge>
      </Card.Header>
      <Card.Body>
        {totalPrestamos > 0 ? (
          <>
            {/* Status Cards */}
            <Row className="mb-3">
              {Object.entries(STATUS_LABELS).map(([key, label]) => {
                const value = parseInt(resumenData[key]) || 0;
                return (
                  <Col key={key} className="mb-2">
                    <div className="text-center p-2 border rounded">
                      <div className="d-flex align-items-center justify-content-center mb-1">
                        <i className={`${STATUS_ICONS[key]} me-2`} style={{ color: STATUS_COLORS[key] }}></i>
                        <Badge bg={getStatusVariant(key)} className="small">
                          {value}
                        </Badge>
                      </div>
                      <small className="text-muted">{label}</small>
                    </div>
                  </Col>
                );
              })}
            </Row>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <Row className="mt-3">
              <Col className="text-center">
                <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                  <small className="text-muted">
                    <i className="fas fa-chart-bar me-1"></i>
                    Flujo de Préstamos
                  </small>
                  <div className="d-flex gap-2">
                    <Badge bg="secondary" className="small">
                      Activos: {parseInt(resumenData.solicitados) + parseInt(resumenData.aprobados) + parseInt(resumenData.entregados)}
                    </Badge>
                    <Badge bg="success" className="small">
                      Completados: {resumenData.devueltos}
                    </Badge>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        ) : (
          /* No Data State */
          <div className="text-center text-muted h-100 d-flex flex-column justify-content-center">
            <i className="fas fa-handshake fa-3x mb-3 opacity-50"></i>
            <h6 className="mb-2">Sin Préstamos</h6>
            <p className="small mb-0">No hay préstamos registrados aún</p>
            <div className="mt-3 p-3 bg-light rounded">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Los datos aparecerán cuando se registren préstamos
              </small>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};