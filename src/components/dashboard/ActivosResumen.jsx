
import React from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useGetActivosResumenQuery } from '../../store/apis/dashboardApi';

const COLORS = {
  disponibles: '#28a745',      // Green
  en_mantenimiento: '#ffc107', // Yellow
  no_disponibles: '#dc3545'    // Red
};

export const ActivosResumen = () => {
  const { data: activosData, isLoading, error } = useGetActivosResumenQuery();

  if (isLoading) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-primary text-white">
          <i className="fas fa-laptop me-2"></i>
          Resumen de Activos
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-primary text-white">
          <i className="fas fa-laptop me-2"></i>
          Resumen de Activos
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            Error al cargar los datos de activos
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Transform data for the pie chart
  const chartData = [
    {
      name: 'Disponibles',
      value: parseInt(activosData.disponibles),
      color: COLORS.disponibles
    },
    {
      name: 'En Mantenimiento',
      value: parseInt(activosData.en_mantenimiento),
      color: COLORS.en_mantenimiento
    },
    {
      name: 'No Disponibles',
      value: parseInt(activosData.no_disponibles),
      color: COLORS.no_disponibles
    }
  ].filter(item => item.value > 0); // Only show categories with data

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark text-white p-2 rounded shadow">
          <p className="mb-1">{payload[0].name}</p>
          <p className="mb-0 fw-bold">{payload[0].value} activos</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <i className="fas fa-laptop me-2"></i>
        Resumen de Activos
      </Card.Header>
      <Card.Body>
        {/* Summary Stats */}
        <Row className="text-center mb-3">
          <Col>
            <h3 className="text-primary mb-0">{activosData.total_activos}</h3>
            <small className="text-muted">Total Activos</small>
          </Col>
        </Row>

        {/* Pie Chart */}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="small">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted">
            <i className="fas fa-chart-pie fa-3x mb-2"></i>
            <p>No hay datos para mostrar</p>
          </div>
        )}

        {/* Stats Cards */}
        <Row className="mt-3">
          <Col className="text-center">
            <div className="d-flex justify-content-between">
              <small className="text-success">
                <i className="fas fa-circle me-1"></i>
                Disponibles: {activosData.disponibles}
              </small>
              <small className="text-warning">
                <i className="fas fa-circle me-1"></i>
                Mantenimiento: {activosData.en_mantenimiento}
              </small>
              <small className="text-danger">
                <i className="fas fa-circle me-1"></i>
                No Disponibles: {activosData.no_disponibles}
              </small>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
