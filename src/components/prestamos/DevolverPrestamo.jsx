import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useGetPrestamosQuery, useDevolverPrestamoMutation } from '../../store/apis/prestamosApi';
import { useGetUsuariosQuery } from '../../store/apis/authApi';
import './EstilosPrestamo.css';

export const DevolverPrestamo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: prestamos, isLoading: loadingPrestamos } = useGetPrestamosQuery();
  const { data: usuarios, isLoading: loadingUsuarios } = useGetUsuariosQuery();
  const [devolverPrestamo, { isLoading: processingReturn }] = useDevolverPrestamoMutation();

  const [prestamo, setPrestamo] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [usuarioRecibe, setUsuarioRecibe] = useState('');
  const [calificacion, setCalificacion] = useState('');
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

  const getCalificacionStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`fas fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`}
        ></i>
      );
    }
    return stars;
  };

  const handleDevolver = () => {
    if (!usuarioRecibe || usuarioRecibe.trim() === '') {
      toast.error('Debe seleccionar un usuario para recibir la devolución');
      return;
    }

    if (!calificacion || calificacion === '') {
      toast.error('Debe seleccionar una calificación');
      return;
    }

    // Validar que el usuario seleccionado exista en la lista
    const usuario = usuarios?.data?.find(u => {
      if (!u) return false;
      const userId = u.id_usuario || u.id;
      if (!userId) return false;
      return String(userId) === String(usuarioRecibe);
    });
    
    if (!usuario) {
      toast.error('El usuario seleccionado no es válido');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmarDevolucion = async () => {
    try {
      // Validar que el usuario recibe sea un ID válido
      const usuarioRecibeId = parseInt(usuarioRecibe);
      if (!usuarioRecibeId || isNaN(usuarioRecibeId)) {
        toast.error('Debe seleccionar un usuario válido para recibir la devolución');
        return;
      }

      const calificacionInt = parseInt(calificacion);
      if (!calificacionInt || isNaN(calificacionInt) || calificacionInt < 1 || calificacionInt > 5) {
        toast.error('Debe seleccionar una calificación válida (1-5)');
        return;
      }

      const resultado = await devolverPrestamo({
        id_prestamo: prestamo.id_prestamo,
        usuario_recibe: usuarioRecibeId,
        calificacion: calificacionInt,
        observaciones: observaciones.trim() || null
      }).unwrap();

      toast.success('Préstamo devuelto exitosamente');
      navigate('/prestamos');
    } catch (error) {
      console.error('Error al devolver:', error);
      toast.error('Error al registrar la devolución del préstamo');
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

  const isEntregado = prestamo.estado_prestamo === 'Entregado';

  return (
    <Container className="mt-4 aprobacion-container">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="devolucion-card">
            <Card.Header className="bg-secondary text-white">
              <h4 className="mb-0">
                <i className="fas fa-undo me-2"></i>
                Devolver Préstamo #{prestamo.id_prestamo}
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
                      <p><strong>Fecha de Entrega:</strong> {formatDateTime(prestamo.fecha_entrega)}</p>
                      <p><strong>Usuario Aprobador:</strong> {prestamo.usuario_aprobador}</p>
                      <p><strong>Usuario que Entregó:</strong> {prestamo.usuario_entrega || 'No especificado'}</p>
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

              {/* Formulario de devolución */}
              {isEntregado && (
                <Card className="mt-3 proceso-devolucion-card">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="fas fa-clipboard-check me-2"></i>
                      Proceso de Devolución
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Usuario que Recibe *</strong>
                          </Form.Label>
                          <Form.Select
                            value={usuarioRecibe}
                            onChange={(e) => setUsuarioRecibe(e.target.value)}
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
                                  {usuario.nombre} {usuario.apellidos} - {usuario.rol}
                                </option>
                              ));
                            })()}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Seleccione el administrador o técnico que recibe el equipo devuelto
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Calificación del Préstamo *</strong>
                          </Form.Label>
                          <Form.Select
                            value={calificacion}
                            onChange={(e) => setCalificacion(e.target.value)}
                            required
                          >
                            <option value="">Seleccione una calificación</option>
                            <option value="5">⭐⭐⭐⭐⭐ Excelente (5)</option>
                            <option value="4">⭐⭐⭐⭐ Muy Bueno (4)</option>
                            <option value="3">⭐⭐⭐ Bueno (3)</option>
                            <option value="2">⭐⭐ Regular (2)</option>
                            <option value="1">⭐ Malo (1)</option>
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Califique el estado en que se devolvió el equipo y el cumplimiento del préstamo
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Observaciones de Devolución</strong>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Describa el estado del equipo devuelto, daños, accesorios, limpieza, etc..."
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
                        className="btn-devolver"
                        size="lg"
                        onClick={handleDevolver}
                        disabled={processingReturn}
                      >
                        <i className="fas fa-undo me-2"></i>
                        Confirmar Devolución
                      </Button>

                      <Button
                        variant="outline-secondary"
                        size="lg"
                        onClick={() => navigate('/prestamos')}
                        disabled={processingReturn}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Cancelar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Mensaje si no está entregado o ya fue devuelto */}
              {!isEntregado && (
                <div className="status-processed mt-3">
                  <h5><i className="fas fa-info-circle me-2"></i>Préstamo no disponible para devolución</h5>
                  {prestamo.estado_prestamo === 'Solicitado' && (
                    <p>Este préstamo aún está pendiente de aprobación.</p>
                  )}
                  {prestamo.estado_prestamo === 'Aprobado' && (
                    <p>Este préstamo aún no ha sido entregado.</p>
                  )}
                  {prestamo.estado_prestamo === 'Devuelto' && (
                    <>
                      <p>Este préstamo ya ha sido devuelto.</p>
                      {prestamo.fecha_devolucion && (
                        <p><strong>Fecha de devolución:</strong> {formatDateTime(prestamo.fecha_devolucion)}</p>
                      )}
                      {prestamo.usuario_recibe && (
                        <p><strong>Recibido por:</strong> {prestamo.usuario_recibe}</p>
                      )}
                      {prestamo.calificacion_prestamo && (
                        <p><strong>Calificación:</strong> {getCalificacionStars(prestamo.calificacion_prestamo)}</p>
                      )}
                      {prestamo.observaciones_devolucion && (
                        <p><strong>Observaciones:</strong> {prestamo.observaciones_devolucion}</p>
                      )}
                    </>
                  )}
                  {prestamo.estado_prestamo === 'Rechazado' && (
                    <p>Este préstamo fue rechazado y no puede ser devuelto.</p>
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
                          Confirmar Devolución del Préstamo
                        </h5>
                      </div>
                      <div className="modal-body">
                        <p>
                          ¿Está seguro que desea <strong>confirmar la devolución</strong> de este préstamo?
                        </p>
                        <p><strong>Préstamo:</strong> {prestamo.nombre_activo} (#{prestamo.id_prestamo})</p>
                        <p><strong>Usuario que Recibe:</strong> {(() => {
                          const usuario = usuarios?.data?.find(u => {
                            if (!u) return false;
                            const userId = u.id_usuario || u.id;
                            return userId && String(userId) === String(usuarioRecibe);
                          });
                          return usuario ? `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() : 'No seleccionado';
                        })()}</p>
                        <p><strong>Devuelto por:</strong> {prestamo.solicitante}</p>
                        <p><strong>Calificación:</strong> {getCalificacionStars(parseInt(calificacion))}</p>
                        {observaciones.trim() && (
                          <p><strong>Observaciones:</strong> {observaciones}</p>
                        )}
                        <div className="alert alert-warning mt-3">
                          <small>
                            <i className="fas fa-info-circle me-1"></i>
                            Una vez confirmada la devolución, el estado del préstamo cambiará a "Devuelto" y se registrará la fecha/hora actual.
                          </small>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <Button
                          variant="secondary"
                          onClick={() => setShowConfirmation(false)}
                          disabled={processingReturn}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={confirmarDevolucion}
                          disabled={processingReturn}
                        >
                          {processingReturn ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-undo me-2"></i>
                              Confirmar Devolución
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