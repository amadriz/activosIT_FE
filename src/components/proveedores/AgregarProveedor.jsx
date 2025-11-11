import React, { useState } from 'react';
import { useAgregarProveedorMutation } from "../../store/apis/proveedoresApi";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export const AgregarProveedor = () => {
  const [agregarProveedor, { isLoading }] = useAgregarProveedorMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_proveedor: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: ''
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

    if (!formData.nombre_proveedor.trim()) {
      newErrors.nombre_proveedor = 'El nombre del proveedor es obligatorio';
    } else if (formData.nombre_proveedor.length < 2) {
      newErrors.nombre_proveedor = 'El nombre del proveedor debe tener al menos 2 caracteres';
    }

    if (!formData.contacto.trim()) {
      newErrors.contacto = 'El nombre del contacto es obligatorio';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (formData.telefono.length < 8) {
      newErrors.telefono = 'El teléfono debe tener al menos 8 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
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
      await agregarProveedor(formData).unwrap();
      toast.success('Proveedor agregado exitosamente');
      navigate('/listaproveedores');
    } catch (error) {
      toast.error(`Error al agregar proveedor: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleCancel = () => {
    navigate('/listaproveedores');
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Nuevo Proveedor
              </h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Nombre del Proveedor *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre_proveedor"
                        value={formData.nombre_proveedor}
                        onChange={handleInputChange}
                        placeholder="Ej: TechDistribuidor S.A., CompuMundo, etc."
                        isInvalid={!!errors.nombre_proveedor}
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nombre_proveedor}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Nombre del Contacto *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="contacto"
                        value={formData.contacto}
                        onChange={handleInputChange}
                        placeholder="Ej: Juan Pérez, María García, etc."
                        isInvalid={!!errors.contacto}
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contacto}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Teléfono *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="Ej: +504 9999-9999"
                        isInvalid={!!errors.telefono}
                        maxLength={20}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.telefono}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Email *
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contacto@proveedor.com"
                        isInvalid={!!errors.email}
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Dirección *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Dirección completa del proveedor..."
                        isInvalid={!!errors.direccion}
                        maxLength={200}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.direccion}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        {formData.direccion.length}/200 caracteres
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
                        Guardar Proveedor
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
