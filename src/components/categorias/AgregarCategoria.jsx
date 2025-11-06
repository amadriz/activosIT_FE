import React, { useState } from 'react';
import { useAgregarCategoriaMutation } from "../../store/apis/categoriasApi";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export const AgregarCategoria = () => {
  const [agregarCategoria, { isLoading }] = useAgregarCategoriaMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_categoria: '',
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

    if (!formData.nombre_categoria.trim()) {
      newErrors.nombre_categoria = 'El nombre de la categoría es obligatorio';
    } else if (formData.nombre_categoria.length < 3) {
      newErrors.nombre_categoria = 'El nombre debe tener al menos 3 caracteres';
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
      await agregarCategoria(formData).unwrap();
      toast.success('Categoría agregada exitosamente');
      navigate('/listacategorias');
    } catch (error) {
      toast.error(`Error al agregar categoría: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleCancel = () => {
    navigate('/listacategorias');
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Nueva Categoría
              </h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Nombre de la Categoría *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre_categoria"
                        value={formData.nombre_categoria}
                        onChange={handleInputChange}
                        placeholder="Ej: Computadoras, Proyectores, etc."
                        isInvalid={!!errors.nombre_categoria}
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nombre_categoria}
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
                        placeholder="Describe el tipo de activos que pertenecen a esta categoría..."
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
                        Guardar Categoría
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