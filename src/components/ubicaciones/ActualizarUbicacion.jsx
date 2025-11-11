import React, { useState, useEffect } from 'react';
import { useActualizarUbicacionMutation, useGetUbicacionesQuery } from "../../store/apis/ubicacionesApi";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export const ActualizarUbicacion = () => {
  const { id } = useParams();
  const { data: ubicaciones, isLoading: loadingUbicaciones } = useGetUbicacionesQuery();
  const [actualizarUbicacion, { isLoading: updating }] = useActualizarUbicacionMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    edificio: '',
    aula_oficina: '',
    piso: '',
    estado: 'activo'
  });

  const [errors, setErrors] = useState({});
  const [ubicacionFound, setUbicacionFound] = useState(false);

  // Load ubicacion data when ubicaciones are fetched
  useEffect(() => {
    if (ubicaciones?.data && id) {
      // Try both string and number comparison to handle different data types
      const ubicacion = ubicaciones.data.find(ub => 
        ub.id_ubicacion === id || 
        ub.id_ubicacion === parseInt(id) ||
        ub.id_ubicacion.toString() === id
      );
      
      if (ubicacion) {
        setFormData({
          edificio: ubicacion.edificio || '',
          aula_oficina: ubicacion.aula_oficina || '',
          piso: ubicacion.piso || '',
          estado: ubicacion.estado || 'activo'
        });
        setUbicacionFound(true);
      } else {
        setUbicacionFound(false);
      }
    } else if (ubicaciones && !ubicaciones.data) {
      setUbicacionFound(false);
    }
  }, [ubicaciones, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.edificio.trim()) {
      newErrors.edificio = 'El nombre del edificio es obligatorio';
    } else if (formData.edificio.length < 3) {
      newErrors.edificio = 'El nombre del edificio debe tener al menos 3 caracteres';
    }

    if (!formData.aula_oficina.trim()) {
      newErrors.aula_oficina = 'El aula/oficina es obligatoria';
    } else if (formData.aula_oficina.length < 2) {
      newErrors.aula_oficina = 'El aula/oficina debe tener al menos 2 caracteres';
    }

    if (!formData.piso.trim()) {
      newErrors.piso = 'El piso es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Send the ID as it comes from the URL parameter
      const idToSend = isNaN(id) ? id : parseInt(id);
      
      await actualizarUbicacion({ id: idToSend, ...formData }).unwrap();
      toast.success('Ubicación actualizada exitosamente');
      navigate('/listaubicaciones');
    } catch (error) {
      toast.error(`Error al actualizar ubicación: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleCancel = () => {
    navigate('/listaubicaciones');
  };

  // Loading state
  if (loadingUbicaciones) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando ubicación...</span>
          </Spinner>
          <p className="mt-2">Cargando datos de la ubicación...</p>
        </div>
      </Container>
    );
  }

  // Ubicacion not found
  if (!loadingUbicaciones && !ubicacionFound) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h5>Ubicación no encontrada</h5>
          <p>La ubicación con ID {id} no existe o ha sido eliminada.</p>
          <Button variant="outline-danger" onClick={() => navigate('/listaubicaciones')}>
            Volver a la lista
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="text-dark">
              <h4 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Actualizar Ubicación
              </h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        ID de la Ubicación
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={id}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Nombre del Edificio *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="edificio"
                        value={formData.edificio}
                        onChange={handleInputChange}
                        placeholder="Ej: Edificio Principal, Torre Norte, etc."
                        isInvalid={!!errors.edificio}
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.edificio}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Aula/Oficina *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="aula_oficina"
                        value={formData.aula_oficina}
                        onChange={handleInputChange}
                        placeholder="Ej: Aula 101, Oficina Admin, Laboratorio A, etc."
                        isInvalid={!!errors.aula_oficina}
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.aula_oficina}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Piso *
                      </Form.Label>
                      <Form.Select
                        name="piso"
                        value={formData.piso}
                        onChange={handleInputChange}
                        isInvalid={!!errors.piso}
                      >
                        <option value="">Selecciona un piso...</option>
                        <option value="Sótano">Sótano</option>
                        <option value="Planta Baja">Planta Baja</option>
                        <option value="1">Piso 1</option>
                        <option value="2">Piso 2</option>
                        <option value="3">Piso 3</option>
                        <option value="4">Piso 4</option>
                        <option value="5">Piso 5</option>
                        <option value="6">Piso 6</option>
                        <option value="7">Piso 7</option>
                        <option value="8">Piso 8</option>
                        <option value="9">Piso 9</option>
                        <option value="10">Piso 10</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.piso}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                {/* add description */}
                <Row>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                Descripción *
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                placeholder="Ej: Descripción de la ubicación"
                                isInvalid={!!errors.descripcion}
                                maxLength={200}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.descripcion}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Alert variant="info" className="mb-4">
                  <small>
                    <strong>Nota:</strong> Los campos marcados con (*) son obligatorios.
                  </small>
                </Alert>

                <div className="d-flex gap-3 justify-content-end">
                  <Button
                    variant="outline-secondary"
                    onClick={handleCancel}
                    disabled={updating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="warning"
                    disabled={updating}
                    className="d-flex align-items-center gap-2"
                  >
                    {updating ? (
                      <>
                        <Spinner size="sm" animation="border" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg"></i>
                        Actualizar Ubicación
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
