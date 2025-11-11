import React, { useState } from 'react';
import { useAgregarUbicacionMutation } from "../../store/apis/ubicacionesApi";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export const AgregarUbicacion = () => {
  const [agregarUbicacion, { isLoading }] = useAgregarUbicacionMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    edificio: '',
    aula_oficina: '',
    piso: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
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
      await agregarUbicacion(formData).unwrap();
      toast.success('Ubicación agregada exitosamente');
      navigate('/listaubicaciones');
    } catch (error) {
      toast.error(`Error al agregar ubicación: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleCancel = () => {
    navigate('/listaubicaciones');
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Nueva Ubicación
              </h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
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

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Descripción *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        placeholder="Describe las características, equipos o uso específico de esta ubicación..."
                        isInvalid={!!errors.descripcion}
                        maxLength={500}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.descripcion}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        {formData.descripcion.length}/500 caracteres
                      </Form.Text>
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
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="d-flex align-items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" animation="border" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg"></i>
                        Guardar Ubicación
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
