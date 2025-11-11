import React, { useState, useEffect } from 'react';
import { useActualizarProveedorMutation, useGetProveedoresQuery } from "../../store/apis/proveedoresApi";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export const ActualizarProveedor = () => {
  const { id } = useParams();
  const { data: proveedores, isLoading: loadingProveedores } = useGetProveedoresQuery();
  const [actualizarProveedor, { isLoading: updating }] = useActualizarProveedorMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_proveedor: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const [errors, setErrors] = useState({});
  const [proveedorFound, setProveedorFound] = useState(false);

  // Load proveedor data when proveedores are fetched
  useEffect(() => {
    if (proveedores?.data && id) {
      // Try both string and number comparison to handle different data types
      const proveedor = proveedores.data.find(prov => 
        prov.id_proveedor === id || 
        prov.id_proveedor === parseInt(id) ||
        prov.id_proveedor.toString() === id
      );
      
      if (proveedor) {
        setFormData({
          nombre_proveedor: proveedor.nombre_proveedor || '',
          contacto: proveedor.contacto || '',
          telefono: proveedor.telefono || '',
          email: proveedor.email || '',
          direccion: proveedor.direccion || ''
        });
        setProveedorFound(true);
      } else {
        setProveedorFound(false);
      }
    } else if (proveedores && !proveedores.data) {
      setProveedorFound(false);
    }
  }, [proveedores, id]);

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
      // Send the ID as it comes from the URL parameter
      const idToSend = isNaN(id) ? id : parseInt(id);
      
      await actualizarProveedor({ id: idToSend, ...formData }).unwrap();
      toast.success('Proveedor actualizado exitosamente');
      navigate('/listaproveedores');
    } catch (error) {
      toast.error(`Error al actualizar proveedor: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleCancel = () => {
    navigate('/listaproveedores');
  };

  // Loading state
  if (loadingProveedores) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando proveedor...</span>
          </Spinner>
          <p className="mt-2">Cargando datos del proveedor...</p>
        </div>
      </Container>
    );
  }

  // Proveedor not found
  if (!loadingProveedores && !proveedorFound) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h5>Proveedor no encontrado</h5>
          <p>El proveedor con ID {id} no existe o ha sido eliminado.</p>
          <Button variant="outline-danger" onClick={() => navigate('/listaproveedores')}>
            Volver a la lista
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={8}>
          <Card className="shadow">
            <Card.Header className="text-dark">
              <h4 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Actualizar Proveedor
              </h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        ID del Proveedor
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
                        Actualizar Proveedor
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
