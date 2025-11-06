import React, { useState, useEffect } from 'react';
import { useActualizarCategoriaMutation, useGetCategoriasQuery } from "../../store/apis/categoriasApi";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export const ActualizarCategoria = () => {
  const { id } = useParams();
  const { data: categorias, isLoading: loadingCategorias } = useGetCategoriasQuery();
  const [actualizarCategoria, { isLoading: updating }] = useActualizarCategoriaMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_categoria: '',
    descripcion: '',
    estado: 'activo'
  });

  const [errors, setErrors] = useState({});
  const [categoryFound, setCategoryFound] = useState(false);

  // Load category data when categorias are fetched
  useEffect(() => {
    if (categorias?.data && id) {
      // Try both string and number comparison to handle different data types
      const categoria = categorias.data.find(cat => 
        cat.id_categoria === id || 
        cat.id_categoria === parseInt(id) ||
        cat.id_categoria.toString() === id
      );
      
      if (categoria) {
        setFormData({
          nombre_categoria: categoria.nombre_categoria || '',
          descripcion: categoria.descripcion || '',
          estado: categoria.estado || 'activo'
        });
        setCategoryFound(true);
      } else {
        setCategoryFound(false);
      }
    } else if (categorias && !categorias.data) {
      setCategoryFound(false);
    }
  }, [categorias, id]);

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
      // Send the ID as it comes from the URL parameter
      const idToSend = isNaN(id) ? id : parseInt(id);
      
      await actualizarCategoria({ id: idToSend, ...formData }).unwrap();
      toast.success('Categoría actualizada exitosamente');
      navigate('/listacategorias');
    } catch (error) {
      toast.error(`Error al actualizar categoría: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleCancel = () => {
    navigate('/listacategorias');
  };

  // Loading state
  if (loadingCategorias) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando categoría...</span>
          </Spinner>
          <p className="mt-2">Cargando datos de la categoría...</p>
        </div>
      </Container>
    );
  }

  // Category not found
  if (!loadingCategorias && !categoryFound) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h5>Categoría no encontrada</h5>
          <p>La categoría con ID {id} no existe o ha sido eliminada.</p>
          <Button variant="outline-danger" onClick={() => navigate('/listacategorias')}>
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
            <Card.Header className="bg-warning text-dark">
              <h4 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Actualizar Categoría
              </h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        ID de la Categoría
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
                        Actualizar Categoría
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