import React from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetActivosTendenciaQuery } from '../../store/apis/dashboardApi';

export const ActivosTendencia = () => {
  const { data: tendenciaData, isLoading, error } = useGetActivosTendenciaQuery();

  if (isLoading) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-info text-white">
          <i className="fas fa-chart-line me-2"></i>
          Tendencia de Activos
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="info" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-info text-white">
          <i className="fas fa-chart-line me-2"></i>
          Tendencia de Activos
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            Error al cargar los datos de tendencia
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Transform data for the line chart - since we only have one data point for now
  // We'll create a simple chart that can be expanded when more historical data is available
  const chartData = Array.isArray(tendenciaData) ? tendenciaData : [tendenciaData];
  
  // Format data for better display
  const formattedData = chartData.map(item => ({
    ...item,
    cantidad_agregada: parseInt(item.cantidad_agregada),
    // Extract month name for better display
    mes: new Date(item.periodo + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark text-white p-3 rounded shadow">
          <p className="mb-1 fw-bold">{data.periodo_texto}</p>
          <p className="mb-0">
            <span className="text-info">Activos agregados: </span>
            <span className="fw-bold">{data.cantidad_agregada}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate some basic stats
  const totalActivos = formattedData.reduce((sum, item) => sum + item.cantidad_agregada, 0);
  const lastPeriod = formattedData[formattedData.length - 1];

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-info text-white">
        <i className="fas fa-chart-line me-2"></i>
        Tendencia de Activos
      </Card.Header>
      <Card.Body>
        {/* Summary Stats */}
        <Row className="text-center mb-3">
          <Col md={6}>
            <h4 className="text-info mb-0">{lastPeriod?.cantidad_agregada || 0}</h4>
            <small className="text-muted">Último Período</small>
          </Col>
          <Col md={6}>
            <h4 className="text-success mb-0">{totalActivos}</h4>
            <small className="text-muted">Total Histórico</small>
          </Col>
        </Row>

        {/* Line Chart */}
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#6c757d' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#6c757d' }}
                label={{ value: 'Activos', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="cantidad_agregada" 
                stroke="#17a2b8" 
                strokeWidth={3}
                dot={{ fill: '#17a2b8', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#17a2b8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted">
            <i className="fas fa-chart-line fa-3x mb-2"></i>
            <p>No hay datos de tendencia disponibles</p>
          </div>
        )}

        {/* Period Info */}
        {lastPeriod && (
          <Row className="mt-3">
            <Col className="text-center">
              <small className="text-muted">
                <i className="fas fa-calendar me-1"></i>
                Último período: <strong>{lastPeriod.periodo_texto}</strong>
                {formattedData.length === 1 && (
                  <span className="ms-2 text-info">
                    <i className="fas fa-info-circle me-1"></i>
                    Datos históricos se mostrarán conforme se agreguen más períodos
                  </span>
                )}
              </small>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};