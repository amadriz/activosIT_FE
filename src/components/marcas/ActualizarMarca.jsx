import React, { useState, useEffect } from 'react';
import { useActualizarMarcaMutation, useGetMarcasQuery } from "../../store/apis/marcasApi";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export const ActualizarMarca = () => {
  const { id } = useParams();
  const { data: marcas, isLoading: loadingMarcas } = useGetMarcasQuery();
  const [actualizarMarca, { isLoading: updating }] = useActualizarMarcaMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_marca: '',
    descripcion: '',
    estado: 'activo'
  });

  const [errors, setErrors] = useState({});
  const [marcaFound, setMarcaFound] = useState(false);

  // Load marca data when marcas are fetched
  useEffect(() => {
    if (marcas?.data && id) {
      // Try both string and number comparison to handle different data types
      const marca = marcas.data.find(m => 
        m.id_marca === id || 
        m.id_marca === parseInt(id) ||
        m.id_marca.toString() === id
      );
      
      if (marca) {
        setFormData({
          nombre_marca: marca.nombre_marca || '',
          descripcion: marca.descripcion || '',
          estado: marca.estado || 'activo'
        });
        setMarcaFound(true);
      } else {
        setMarcaFound(false);
      }
    } else if (marcas && !marcas.data) {
      setMarcaFound(false);
    }
  }, [marcas, id]);

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

    if (!formData.nombre_marca.trim()) {
      newErrors.nombre_marca = 'El nombre de la marca es obligatorio';
    } else if (formData.nombre_marca.length < 2) {
      newErrors.nombre_marca = 'El nombre de la marca debe tener al menos 2 caracteres';
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
      
      await actualizarMarca({ id: idToSend, ...formData }).unwrap();
      toast.success('Marca actualizada exitosamente');
      navigate('/listamarcas');
    } catch (error) {
      toast.error(`Error al actualizar marca: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleCancel = () => {
    navigate('/listamarcas');
  };

  // Loading state
  if (loadingMarcas) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando marca...</span>
          </Spinner>
          <p className="mt-2">Cargando datos de la marca...</p>
        </div>
      </Container>
    );
  }

  // Marca not found
  if (!loadingMarcas && !marcaFound) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h5>Marca no encontrada</h5>
          <p>La marca con ID {id} no existe o ha sido eliminada.</p>
          <Button variant="outline-danger" onClick={() => navigate('/listamarcas')}>
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
                Actualizar Marca
              </h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        ID de la Marca
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
                        Nombre de la Marca *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre_marca"
                        value={formData.nombre_marca}
                        onChange={handleInputChange}
                        placeholder="Ej: Dell, HP, Lenovo, Samsung, etc."
                        isInvalid={!!errors.nombre_marca}
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nombre_marca}
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
                        placeholder="Describe las características y productos de esta marca..."
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
                        Actualizar Marca
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
