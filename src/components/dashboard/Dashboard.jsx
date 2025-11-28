import { Container, Row, Col } from 'react-bootstrap';
import { ActivosResumen } from './ActivosResumen';
import { ActivosTendencia } from './ActivosTendencia';
import { PrestamosTasaAprobacion } from './PrestamosTasaAprobacion';
import { PrestamosResumen } from './PrestamosResumen';
import { ActivosMasPrestados } from './ActivosMasPrestados';
import { UsuariosMasActivos } from './UsuariosMasActivos';

export const Dashboard = () => {
  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">
            <i className="fas fa-chart-bar me-2"></i>
            Dashboard - Gestión de Activos IT
          </h2>
        </Col>
      </Row>
      
      <Row>
        <Col lg={6} xl={4} className="mb-4">
          <ActivosResumen />
        </Col>
        <Col lg={6} xl={8} className="mb-4">
          <ActivosTendencia />
        </Col>
      </Row>
      
      <Row>
        <Col lg={6} xl={4} className="mb-4">
          <PrestamosTasaAprobacion />
        </Col>
        <Col lg={6} xl={8} className="mb-4">
          <PrestamosResumen />
        </Col>
      </Row>
      
      <Row>
        <Col className="mb-4">
          <ActivosMasPrestados />
        </Col>
      </Row>
      
      <Row>
        <Col className="mb-4">
          <UsuariosMasActivos />
        </Col>
      </Row>
    </Container>
  );
};