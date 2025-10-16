import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// API imports
import { useAddPrestamoMutation, useGetEstadoPrestamosQuery } from '../../store/apis/prestamosApi';
import { useGetActivosQuery } from '../../store/apis/activosApi';
import { useGetUbicacionesQuery } from '../../store/apis/ubicacionesApi';
import { useGetUsuariosQuery } from '../../store/apis/authApi';

const initialState = {
  id_usuario: '',
  id_activo: '',
  fecha_inicio_solicitada: '',
  fecha_fin_solicitada: '',
  proposito: '',
  id_ubicacion: ''
};

export const SolicitarPrestamo = () => {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // RTK Query hooks
  const [addPrestamo] = useAddPrestamoMutation();
  const { data: activosData, isLoading: loadingActivos } = useGetActivosQuery();
  const { data: ubicacionesData, isLoading: loadingUbicaciones } = useGetUbicacionesQuery();
  const { data: usuariosData, isLoading: loadingUsuarios } = useGetUsuariosQuery();
  const { data: estadosPrestamoData, isLoading: loadingEstados } = useGetEstadoPrestamosQuery();

  // Extraer datos de las APIs
  const activos = Array.isArray(activosData) ? activosData : (activosData?.data || []);
  const ubicaciones = Array.isArray(ubicacionesData) ? ubicacionesData : (ubicacionesData?.data || []);
  const usuarios = Array.isArray(usuariosData) ? usuariosData : (usuariosData?.data || []);
  const estadosPrestamo = Array.isArray(estadosPrestamoData) ? estadosPrestamoData : (estadosPrestamoData?.data || []);

  // Obtener el ID del estado "Solicitado" (ID = 1 según la tabla)
  const estadoSolicitado = estadosPrestamo.find(estado => 
    estado.nombre_estado?.toLowerCase() === 'solicitado' ||
    estado.id_estado_prestamo === 1
  );

  // Filtrar solo activos disponibles
  const activosDisponibles = activos.filter(activo => 
    activo.estado_activo === 'Disponible'
  );

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate dates and times
  const validateDates = () => {
    if (formData.fecha_inicio_solicitada && formData.fecha_fin_solicitada) {
      const fechaInicio = new Date(formData.fecha_inicio_solicitada);
      const fechaFin = new Date(formData.fecha_fin_solicitada);
      const ahora = new Date();
      
      // Agregar un buffer de 1 minuto para evitar problemas de precisión
      const ahoraConBuffer = new Date(ahora.getTime() - (1 * 60 * 1000)); // 1 minuto antes

      // Validate that start date is not too far in the past (allow some buffer)
      if (fechaInicio < ahoraConBuffer) {
        toast.error('La fecha y hora de inicio no puede ser anterior al momento actual');
        return false;
      }

      // Validate that end time is after start time
      if (fechaFin <= fechaInicio) {
        toast.error('La fecha y hora de fin debe ser posterior a la fecha y hora de inicio');
        return false;
      }

      // Validate minimum loan period (1 hour)
      const diffTime = fechaFin - fechaInicio;
      const diffHours = diffTime / (1000 * 60 * 60); // Convert to hours
      
      if (diffHours < 1) {
        toast.error('El período de préstamo mínimo es de 1 hora');
        return false;
      }

      // Validate maximum loan period (adjust as needed - e.g., 7 days = 168 hours)
      if (diffHours > 168) {
        toast.error('El período de préstamo no puede exceder 7 días (168 horas)');
        return false;
      }

      return true;
    }
    return true;
  };

  // Get selected asset info
  const getSelectedAssetInfo = () => {
    if (formData.id_activo) {
      return activos.find(activo => activo.id_activo === parseInt(formData.id_activo));
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsLoading(true);
    setValidated(true);

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setIsLoading(false);
      return;
    }

    // Additional validations
    if (!formData.proposito || formData.proposito.trim() === '') {
      toast.error('El propósito del préstamo es obligatorio');
      setIsLoading(false);
      return;
    }

    // Validate dates
    if (!validateDates()) {
      setIsLoading(false);
      return;
    }

    // Validate that we have the "Solicitado" state
    if (!estadoSolicitado) {
      toast.error('Error: No se pudo obtener el estado de préstamo. Intente nuevamente.');
      setIsLoading(false);
      return;
    }

    try {
      // Función para convertir formato datetime-local a formato MySQL
      const convertDateTimeFormat = (datetimeLocal) => {
        if (!datetimeLocal) return null;
        // Convierte de "YYYY-MM-DDTHH:MM" a "YYYY-MM-DD HH:MM:SS"
        return datetimeLocal.replace('T', ' ') + ':00';
      };

      // Convert string IDs to integers and add the "Solicitado" state (ID = 1)
      const prestamoData = {
        ...formData,
        id_usuario: parseInt(formData.id_usuario),
        id_activo: parseInt(formData.id_activo),
        id_ubicacion: parseInt(formData.id_ubicacion),
        id_estado_prestamo: estadoSolicitado.id_estado_prestamo,
        fecha_inicio_solicitada: convertDateTimeFormat(formData.fecha_inicio_solicitada),
        fecha_fin_solicitada: convertDateTimeFormat(formData.fecha_fin_solicitada),
        proposito: formData.proposito.trim()
      };

      const result = await addPrestamo(prestamoData).unwrap();
      
      const selectedAsset = getSelectedAssetInfo();
      toast.success(`Solicitud de préstamo para "${selectedAsset?.nombre_activo || 'el activo'}" enviada exitosamente`);
      
      // Reset form and validation state
      setFormData(initialState); 
      setValidated(false);
      
      // Navigate after a brief delay to show the success message
      setTimeout(() => {
        navigate('/listaprestamos');
      }, 1500);
    } catch (error) {
      console.error('Error creating loan request:', error);
      
      if (error.data?.message) {
        toast.error(`Error: ${error.data.message}`);
      } else {
        toast.error('Error al enviar la solicitud de préstamo. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get current datetime in YYYY-MM-DDTHH:MM format for min datetime validation
  // Se resta 5 minutos para dar flexibilidad al usuario
  const getCurrentDateTime = () => {
    const now = new Date();
    // Restar 5 minutos para dar flexibilidad
    const adjustedTime = new Date(now.getTime() - (5 * 60 * 1000));
    
    const year = adjustedTime.getFullYear();
    const month = String(adjustedTime.getMonth() + 1).padStart(2, '0');
    const day = String(adjustedTime.getDate()).padStart(2, '0');
    const hours = String(adjustedTime.getHours()).padStart(2, '0');
    const minutes = String(adjustedTime.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Calculate duration in hours
  const calculateDuration = () => {
    if (formData.fecha_inicio_solicitada && formData.fecha_fin_solicitada) {
      const inicio = new Date(formData.fecha_inicio_solicitada);
      const fin = new Date(formData.fecha_fin_solicitada);
      const diffTime = fin - inicio;
      const diffHours = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
      return diffHours > 0 ? diffHours : 0;
    }
    return 0;
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12} className='mb-5'>
          <Card>
            <Card.Header>
              <h4>Solicitar Préstamo de Activo</h4>
            </Card.Header>
            <Card.Body>
              <Form 
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
              >
                <Row>
                  {/* Estado del Préstamo */}
                  <Col md={12}>
                    <div className="alert alert-success mb-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        <div>
                          <strong>Estado de la Solicitud:</strong> Esta solicitud se enviará con estado{' '}
                          <span className="badge bg-primary">
                            {estadoSolicitado?.nombre_estado || 'Solicitado'}
                          </span>
                          {' '}y quedará pendiente de aprobación por parte del administrador.
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Información del Solicitante */}
                  <Col md={12}>
                    <h5 className="mb-3 text-primary">Información del Solicitante</h5>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Usuario Solicitante *</Form.Label>
                      <Form.Select
                        name="id_usuario"
                        value={formData.id_usuario}
                        onChange={handleInputChange}
                        required
                        disabled={loadingUsuarios}
                      >
                        <option value="">Seleccione el usuario solicitante</option>
                        {usuarios.map((usuario) => (
                          <option key={usuario.id_usuario} value={usuario.id_usuario}>
                            {usuario.nombre} {usuario.apellido} - {usuario.rol}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar el usuario solicitante.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ubicación de Uso *</Form.Label>
                      <Form.Select
                        name="id_ubicacion"
                        value={formData.id_ubicacion}
                        onChange={handleInputChange}
                        required
                        disabled={loadingUbicaciones}
                      >
                        <option value="">Seleccione la ubicación donde usará el activo</option>
                        {ubicaciones.map((ubicacion) => (
                          <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                            {ubicacion.edificio} - {ubicacion.aula_oficina}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar la ubicación de uso.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Información del Activo */}
                  <Col md={12}>
                    <hr />
                    <h5 className="mb-3 text-primary">Selección de Activo</h5>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Activo a Solicitar *</Form.Label>
                      <Form.Select
                        name="id_activo"
                        value={formData.id_activo}
                        onChange={handleInputChange}
                        required
                        disabled={loadingActivos}
                      >
                        <option value="">Seleccione el activo que desea solicitar</option>
                        {activosDisponibles.map((activo) => (
                          <option key={activo.id_activo} value={activo.id_activo}>
                            {activo.codigo_activo} - {activo.nombre_activo}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar un activo disponible.
                      </Form.Control.Feedback>
                      {activosDisponibles.length === 0 && !loadingActivos && (
                        <Form.Text className="text-warning">
                          ⚠️ No hay activos disponibles para préstamo en este momento.
                        </Form.Text>
                      )}
                      {loadingEstados && (
                        <Form.Text className="text-info">
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Cargando estados de préstamo...
                        </Form.Text>
                      )}
                      {!loadingEstados && !estadoSolicitado && (
                        <Form.Text className="text-danger">
                          ❌ Error: No se pudo cargar el estado de préstamo "Solicitado".
                        </Form.Text>
                      )}
                    </Form.Group>

                  </Col>

                  {/* Información del activo seleccionado */}
                  {formData.id_activo && (
                    <Col md={12}>
                      <div className="alert alert-info">
                        {(() => {
                          const selectedAsset = getSelectedAssetInfo();
                          return selectedAsset ? (
                            <div>
                              <strong>Información del Activo Seleccionado:</strong>
                              <ul className="mb-0 mt-2">
                                <li><strong>Nombre:</strong> {selectedAsset.nombre_activo}</li>
                                <li><strong>Categoría:</strong> {selectedAsset.categoria}</li>
                                <li><strong>Marca:</strong> {selectedAsset.marca}</li>
                                <li><strong>Modelo:</strong> {selectedAsset.modelo}</li>
                                <li><strong>Ubicación Actual:</strong> {selectedAsset.ubicacion}</li>
                              </ul>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </Col>
                  )}

                  {/* Período del Préstamo */}
                  <Col md={12}>
                    <hr />
                    <h5 className="mb-3 text-primary">Horario del Préstamo</h5>
                    <div className="alert alert-info mb-3">
                      <small>
                        <strong>📋 Información:</strong> Los préstamos pueden ser desde 1 hora hasta 7 días máximo. 
                        Seleccione la fecha y hora exactas de inicio y fin del préstamo.
                      </small>
                    </div>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha y Hora de Inicio *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="fecha_inicio_solicitada"
                        value={formData.fecha_inicio_solicitada}
                        onChange={handleInputChange}
                        min={getCurrentDateTime()}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar la fecha y hora de inicio del préstamo.
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        No puede ser anterior al momento actual.
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha y Hora de Fin *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="fecha_fin_solicitada"
                        value={formData.fecha_fin_solicitada}
                        onChange={handleInputChange}
                        min={formData.fecha_inicio_solicitada || getCurrentDateTime()}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar la fecha y hora de fin del préstamo.
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Debe ser posterior al inicio. Mínimo 1 hora, máximo 7 días.
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Mostrar duración del préstamo */}
                  {formData.fecha_inicio_solicitada && formData.fecha_fin_solicitada && (
                    <Col md={12}>
                      <div className="alert alert-light">
                        <strong>Duración del préstamo:</strong> {
                          (() => {
                            const duration = calculateDuration();
                            if (duration >= 24) {
                              const days = Math.floor(duration / 24);
                              const hours = Math.round((duration % 24) * 10) / 10;
                              return `${days} día${days !== 1 ? 's' : ''} ${hours > 0 ? `y ${hours} hora${hours !== 1 ? 's' : ''}` : ''}`;
                            } else {
                              return `${duration} hora${duration !== 1 ? 's' : ''}`;
                            }
                          })()
                        }
                        {calculateDuration() < 1 && calculateDuration() > 0 && (
                          <span className="text-danger ms-2">⚠️ Mínimo 1 hora</span>
                        )}
                        {calculateDuration() > 168 && (
                          <span className="text-danger ms-2">⚠️ Máximo 7 días (168 horas)</span>
                        )}
                      </div>
                    </Col>
                  )}

                  {/* Propósito */}
                  <Col md={12}>
                    <hr />
                    <h5 className="mb-3 text-primary">Propósito del Préstamo</h5>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Propósito/Justificación *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="proposito"
                        value={formData.proposito}
                        onChange={handleInputChange}
                        placeholder="Describa el propósito o justificación para el préstamo del activo (ej: Laboratorio de redes - 2 horas, Presentación de proyecto - 4 horas, Clase práctica - 1 día, etc.)"
                        required
                        minLength={10}
                        maxLength={500}
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe describir el propósito del préstamo (mínimo 10 caracteres).
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        {formData.proposito.length}/500 caracteres
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Botones */}
                  <Col md={12}>
                    <hr />
                    <div className="d-flex gap-2">
                      <Button 
                        variant="success" 
                        type="submit" 
                        disabled={isLoading || activosDisponibles.length === 0 || loadingEstados || !estadoSolicitado}
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Enviando Solicitud...
                          </>
                        ) : (
                          'Enviar Solicitud de Préstamo'
                        )}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        type="button" 
                        onClick={() => navigate('/listaprestamos')}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
