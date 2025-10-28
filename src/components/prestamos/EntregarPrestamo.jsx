import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useGetPrestamosQuery, useEntregarPrestamoMutation } from '../../store/apis/prestamosApi';
import { useGetUsuariosQuery } from '../../store/apis/authApi';
import './EstilosPrestamo.css';

export const EntregarPrestamo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: prestamos, isLoading: loadingPrestamos } = useGetPrestamosQuery();
  const { data: usuarios, isLoading: loadingUsuarios } = useGetUsuariosQuery();
  const [entregarPrestamo, { isLoading: processingDelivery }] = useEntregarPrestamoMutation();

  const [prestamo, setPrestamo] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [usuarioEntrega, setUsuarioEntrega] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (prestamos?.data && id) {
      const prestamoEncontrado = prestamos.data.find(p => p.id_prestamo.toString() === id.toString());
      if (prestamoEncontrado) {
        setPrestamo(prestamoEncontrado);
      }
    }
  }, [prestamos, id]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const estadosConfig = {
      'Solicitado': { bg: 'warning', text: 'dark' },
      'Aprobado': { bg: 'success', text: 'white' },
      'Entregado': { bg: 'info', text: 'white' },
      'Devuelto': { bg: 'secondary', text: 'white' },
      'Rechazado': { bg: 'danger', text: 'white' }
    };
    
    const config = estadosConfig[estado] || { bg: 'light', text: 'dark' };
    return <Badge bg={config.bg} text={config.text}>{estado}</Badge>;
  };

  const handleEntregar = () => {
    if (!usuarioEntrega || usuarioEntrega.trim() === '') {
      toast.error('Debe seleccionar un usuario para la entrega');
      return;
    }

    // Validar que el usuario seleccionado exista en la lista
    const usuario = usuarios?.data?.find(u => {
      if (!u) return false;
      const userId = u.id_usuario || u.id;
      if (!userId) return false;
      return String(userId) === String(usuarioEntrega);
    });
    
    if (!usuario) {
      toast.error('El usuario seleccionado no es válido');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmarEntrega = async () => {
    try {
      // Validar que el usuario entrega sea un ID válido
      const usuarioEntregaId = parseInt(usuarioEntrega);
      if (!usuarioEntregaId || isNaN(usuarioEntregaId)) {
        toast.error('Debe seleccionar un usuario válido para la entrega');
        return;
      }

      const resultado = await entregarPrestamo({
        id_prestamo: prestamo.id_prestamo,
        usuario_entregador: usuarioEntregaId,
        observaciones: observaciones.trim() || null
      }).unwrap();

      toast.success('Préstamo entregado exitosamente');
      navigate('/prestamos');
    } catch (error) {
      console.error('Error al entregar:', error);
      toast.error('Error al registrar la entrega del préstamo');
    } finally {
      setShowConfirmation(false);
    }
  };

  if (loadingPrestamos || loadingUsuarios) {
    return (
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Cargando información del préstamo...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!prestamo) {
    return (
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="warning">
              <Alert.Heading>Préstamo no encontrado</Alert.Heading>
              <p>No se pudo encontrar el préstamo con ID: {id}</p>
              <Button variant="outline-primary" onClick={() => navigate('/prestamos')}>
                Volver a la lista
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const isAprobado = prestamo.estado_prestamo === 'Aprobado';

  return (
    <Container className="mt-4 aprobacion-container">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="aprobacion-card">
            <Card.Header className="bg-info text-white">
              <h4 className="mb-0">
                <i className="fas fa-handshake me-2"></i>
                Entregar Préstamo #{prestamo.id_prestamo}
              </h4>
            </Card.Header>
            <Card.Body>
              {/* Información del préstamo */}
              <Row>
                <Col md={6}>
                  <Card className="mb-3 info-card">
                    <Card.Header>
                      <h6 className="mb-0">
                        <i className="fas fa-info-circle me-2"></i>
                        Información del Préstamo
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Estado Actual:</strong> {getEstadoBadge(prestamo.estado_prestamo)}</p>
                      <p><strong>Usuario Solicitante:</strong> {prestamo.solicitante}</p>
                      <p><strong>Fecha de Solicitud:</strong> {formatDateTime(prestamo.fecha_solicitud)}</p>
                      <p><strong>Fecha de Aprobación:</strong> {formatDateTime(prestamo.fecha_aprobacion)}</p>
                      <p><strong>Usuario Aprobador:</strong> {prestamo.usuario_aprobador}</p>
                      <p><strong>Fecha Inicio Solicitada:</strong> {formatDateTime(prestamo.fecha_inicio_solicitada)}</p>
                      <p><strong>Fecha Fin Solicitada:</strong> {formatDateTime(prestamo.fecha_fin_solicitada)}</p>
                      <p><strong>Propósito:</strong> {prestamo.proposito}</p>
                      <p><strong>Duración Planificada:</strong> {prestamo.duracion_planificada_horas} horas</p>
                      
                      {prestamo.observaciones_aprobacion && (
                        <p><strong>Observaciones de Aprobación:</strong> {prestamo.observaciones_aprobacion}</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="mb-3 info-card">
                    <Card.Header>
                      <h6 className="mb-0">
                        <i className="fas fa-laptop me-2"></i>
                        Información del Activo
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Activo:</strong> {prestamo.nombre_activo}</p>
                      <p><strong>Código:</strong> {prestamo.codigo_activo}</p>
                      <p><strong>Marca:</strong> {prestamo.marca}</p>
                      <p><strong>Categoría:</strong> {prestamo.categoria}</p>
                      <p><strong>Ubicación:</strong> {prestamo.ubicacion}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Formulario de entrega */}
              {isAprobado && (
                <Card className="mt-3 proceso-entrega-card">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="fas fa-truck me-2"></i>
                      Proceso de Entrega
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Usuario que Entrega *</strong>
                          </Form.Label>
                          <Form.Select
                            value={usuarioEntrega}
                            onChange={(e) => setUsuarioEntrega(e.target.value)}
                            required
                          >
                            <option value="">Seleccione el usuario responsable</option>
                            {(() => {
                              if (!usuarios?.data) return null;
                              
                              const staffUsers = usuarios.data.filter(usuario => {
                                if (!usuario) return false;
                                return usuario.rol === "Administrador" || 
                                       usuario.rol === "Admin" || 
                                       usuario.rol === "admin" ||
                                       usuario.rol === "Técnico" ||
                                       usuario.rol === "tecnico";
                              });
                              
                              return staffUsers.map((usuario, index) => (
                                <option key={`staff-${usuario.id_usuario || usuario.id || index}`} value={usuario.id_usuario || usuario.id}>
                                  {usuario.nombre} {usuario.apellidos} - {usuario.rol} - {usuario.email}
                                </option>
                              ));
                            })()}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Seleccione el administrador o técnico responsable de la entrega física del equipo
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Observaciones de Entrega (Opcional)</strong>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Ingrese observaciones sobre la entrega del equipo (estado físico, accesorios entregados, instrucciones especiales, etc.)..."
                            maxLength={500}
                          />
                          <Form.Text className="text-muted">
                            {observaciones.length}/500 caracteres
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex gap-3 justify-content-center mt-4">
                      <Button
                        className="btn-entregar"
                        size="lg"
                        onClick={handleEntregar}
                        disabled={processingDelivery}
                      >
                        <i className="fas fa-handshake me-2"></i>
                        Confirmar Entrega
                      </Button>

                      <Button
                        variant="outline-secondary"
                        size="lg"
                        onClick={() => navigate('/prestamos')}
                        disabled={processingDelivery}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Cancelar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Mensaje si no está aprobado o ya fue procesado */}
              {!isAprobado && (
                <div className="status-processed mt-3">
                  <h5><i className="fas fa-info-circle me-2"></i>Préstamo no disponible para entrega</h5>
                  {prestamo.estado_prestamo === 'Solicitado' && (
                    <p>Este préstamo aún está pendiente de aprobación.</p>
                  )}
                  {prestamo.estado_prestamo === 'Entregado' && (
                    <>
                      <p>Este préstamo ya ha sido entregado.</p>
                      {prestamo.fecha_entrega && (
                        <p><strong>Fecha de entrega:</strong> {formatDateTime(prestamo.fecha_entrega)}</p>
                      )}
                      {prestamo.usuario_entrega && (
                        <p><strong>Entregado por:</strong> {prestamo.usuario_entrega}</p>
                      )}
                    </>
                  )}
                  {prestamo.estado_prestamo === 'Rechazado' && (
                    <p>Este préstamo fue rechazado y no puede ser entregado.</p>
                  )}
                  {prestamo.estado_prestamo === 'Devuelto' && (
                    <p>Este préstamo ya fue devuelto.</p>
                  )}
                  <Button variant="outline-light" onClick={() => navigate('/prestamos')}>
                    <i className="fas fa-arrow-left me-2"></i>
                    Volver a la lista
                  </Button>
                </div>
              )}

              {/* Modal de confirmación */}
              {showConfirmation && (
                <div className="modal show d-block modal-confirmacion" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          Confirmar Entrega del Préstamo
                        </h5>
                      </div>
                      <div className="modal-body">
                        <p>
                          ¿Está seguro que desea <strong>confirmar la entrega</strong> de este préstamo?
                        </p>
                        <p><strong>Préstamo:</strong> {prestamo.nombre_activo} (#{prestamo.id_prestamo})</p>
                        <p><strong>Usuario que Entrega:</strong> {(() => {
                          const usuario = usuarios?.data?.find(u => {
                            if (!u) return false;
                            const userId = u.id_usuario || u.id;
                            return userId && String(userId) === String(usuarioEntrega);
                          });
                          return usuario ? `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() : 'No seleccionado';
                        })()}</p>
                        <p><strong>Para:</strong> {prestamo.solicitante}</p>
                        {observaciones.trim() && (
                          <p><strong>Observaciones:</strong> {observaciones}</p>
                        )}
                        <div className="alert alert-info mt-3">
                          <small>
                            <i className="fas fa-info-circle me-1"></i>
                            Una vez confirmada la entrega, el estado del préstamo cambiará a "Entregado" y se registrará la fecha y hora actual.
                          </small>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <Button
                          variant="secondary"
                          onClick={() => setShowConfirmation(false)}
                          disabled={processingDelivery}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="info"
                          onClick={confirmarEntrega}
                          disabled={processingDelivery}
                        >
                          {processingDelivery ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-handshake me-2"></i>
                              Confirmar Entrega
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};