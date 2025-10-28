import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useGetPrestamosQuery, useAprobarPrestamoMutation } from '../../store/apis/prestamosApi';
import { useGetUsuariosQuery } from '../../store/apis/authApi';
import './EstilosPrestamo.css';

export const AprobarPrestamo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: prestamos, isLoading: loadingPrestamos } = useGetPrestamosQuery();
  const { data: usuarios, isLoading: loadingUsuarios } = useGetUsuariosQuery();
  const [aprobarRechazarPrestamo, { isLoading: processingApproval }] = useAprobarPrestamoMutation();

  const [prestamo, setPrestamo] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [usuarioAprobador, setUsuarioAprobador] = useState('');
  const [accionSeleccionada, setAccionSeleccionada] = useState(null);
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

  const handleAccion = (accion) => {
    if (!usuarioAprobador || usuarioAprobador.trim() === '') {
      toast.error('Debe seleccionar un usuario aprobador');
      return;
    }

    // Validar que el usuario seleccionado exista en la lista
    const usuario = usuarios?.data?.find(u => {
      if (!u) return false;
      const userId = u.id_usuario || u.id;
      if (!userId) return false;
      return String(userId) === String(usuarioAprobador);
    });
    
    if (!usuario) {
      toast.error('El usuario seleccionado no es válido');
      return;
    }

    setAccionSeleccionada(accion);
    setShowConfirmation(true);
  };

  const confirmarAccion = async () => {
    try {
      // Validar que el usuario aprobador sea un ID válido
      const usuarioAprobadorId = parseInt(usuarioAprobador);
      if (!usuarioAprobadorId || isNaN(usuarioAprobadorId)) {
        toast.error('Debe seleccionar un usuario aprobador válido');
        return;
      }

      const resultado = await aprobarRechazarPrestamo({
        id_prestamo: prestamo.id_prestamo,
        accion: accionSeleccionada,
        usuario_aprobador: usuarioAprobadorId,
        observaciones: observaciones.trim() || null
      }).unwrap();

      toast.success(`Préstamo ${accionSeleccionada === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente`);
      navigate('/prestamos');
    } catch (error) {
      console.error('Error al procesar:', error);
      toast.error(`Error al ${accionSeleccionada === 'aprobar' ? 'aprobar' : 'rechazar'} el préstamo`);
    } finally {
      setShowConfirmation(false);
      setAccionSeleccionada(null);
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
              <Button variant="primary" onClick={() => navigate('/prestamos')}>
                Volver a la lista
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const isSolicitado = prestamo.estado_prestamo === 'Solicitado';

  return (
    <Container className="mt-4 aprobacion-container">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="aprobacion-card">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-check-circle me-2"></i>
                Aprobar/Rechazar Préstamo #{prestamo.id_prestamo}
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
                      <p><strong>Fecha Inicio Solicitada:</strong> {formatDateTime(prestamo.fecha_inicio_solicitada)}</p>
                      <p><strong>Fecha Fin Solicitada:</strong> {formatDateTime(prestamo.fecha_fin_solicitada)}</p>
                      <p><strong>Propósito:</strong> {prestamo.proposito}</p>
                      <p><strong>Duración Planificada:</strong> {prestamo.duracion_planificada_horas} horas</p>
                      
                      {prestamo.observaciones_aprobacion && (
                        <p><strong>Observaciones:</strong> {prestamo.observaciones_aprobacion}</p>
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

              {/* Formulario de aprobación/rechazo */}
              {isSolicitado && (
                <Card className="mt-3 proceso-aprobacion-card">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="fas fa-user-check me-2"></i>
                      Proceso de Aprobación
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Usuario Aprobador *</strong>
                          </Form.Label>
                          <Form.Select
                            value={usuarioAprobador}
                            onChange={(e) => setUsuarioAprobador(e.target.value)}
                            required
                          >
                            <option value="">Seleccione un administrador</option>
                            {(() => {
                              if (!usuarios?.data) return null;
                              
                              const adminUsers = usuarios.data.filter(usuario => {
                                if (!usuario) return false;
                                return usuario.rol === "Administrador" || 
                                       usuario.rol === "Admin" || 
                                       usuario.rol === "admin";
                              });
                              
                              return adminUsers.map((usuario, index) => (
                                <option key={`admin-${usuario.id_usuario || usuario.id || index}`} value={usuario.id_usuario || usuario.id}>
                                  {usuario.nombre} {usuario.apellidos} - {usuario.email}
                                </option>
                              ));
                            })()}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Observaciones (Opcional)</strong>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Ingrese observaciones sobre la aprobación o rechazo..."
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
                        className="btn-aprobar"
                        size="lg"
                        onClick={() => handleAccion('aprobar')}
                        disabled={processingApproval}
                      >
                        <i className="fas fa-check me-2"></i>
                        Aprobar Préstamo
                      </Button>

                      <Button
                        className="btn-rechazar"
                        size="lg"
                        onClick={() => handleAccion('rechazar')}
                        disabled={processingApproval}
                      >
                        <i className="fas fa-times me-2"></i>
                        Rechazar Préstamo
                      </Button>

                      <Button
                        variant="outline-secondary"
                        size="lg"
                        onClick={() => navigate('/prestamos')}
                        disabled={processingApproval}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Cancelar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Mensaje si ya fue procesado */}
              {!isSolicitado && (
                <div className="status-processed mt-3">
                  <h5><i className="fas fa-info-circle me-2"></i>Préstamo ya procesado</h5>
                  <p>Este préstamo ya ha sido {prestamo.estado_prestamo.toLowerCase()}.</p>
                  {prestamo.fecha_aprobacion && (
                    <p><strong>Fecha de procesamiento:</strong> {formatDateTime(prestamo.fecha_aprobacion)}</p>
                  )}
                  {prestamo.usuario_aprobador && (
                    <p><strong>Procesado por:</strong> {prestamo.usuario_aprobador}</p>
                  )}
                  {prestamo.observaciones_aprobacion && (
                    <p><strong>Observaciones:</strong> {prestamo.observaciones_aprobacion}</p>
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
                          Confirmar {accionSeleccionada === 'aprobar' ? 'Aprobación' : 'Rechazo'}
                        </h5>
                      </div>
                      <div className="modal-body">
                        <p>
                          ¿Está seguro que desea <strong>
                            {accionSeleccionada === 'aprobar' ? 'aprobar' : 'rechazar'}
                          </strong> este préstamo?
                        </p>
                        <p><strong>Préstamo:</strong> {prestamo.nombre_activo} (#{prestamo.id_prestamo})</p>
                        <p><strong>Usuario Aprobador:</strong> {(() => {
                          const usuario = usuarios?.data?.find(u => {
                            if (!u) return false;
                            const userId = u.id_usuario || u.id;
                            return userId && String(userId) === String(usuarioAprobador);
                          });
                          return usuario ? `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() : 'No seleccionado';
                        })()}</p>
                        {observaciones.trim() && (
                          <p><strong>Observaciones:</strong> {observaciones}</p>
                        )}
                      </div>
                      <div className="modal-footer">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setShowConfirmation(false);
                            setAccionSeleccionada(null);
                          }}
                          disabled={processingApproval}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant={accionSeleccionada === 'aprobar' ? 'success' : 'danger'}
                          onClick={confirmarAccion}
                          disabled={processingApproval}
                        >
                          {processingApproval ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              Confirmar {accionSeleccionada === 'aprobar' ? 'Aprobación' : 'Rechazo'}
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
