import { useState } from 'react';
import { useAddActivoMutation, useGetActivosQuery } from '../../store/apis/activosApi';
import { useGetCategoriasQuery } from '../../store/apis/categoriasApi';
import { useGetUbicacionesQuery } from '../../store/apis/ubicacionesApi';
import { useGetMarcasQuery } from '../../store/apis/marcasApi';
import { useGetEstadosQuery } from '../../store/apis/estadosApi';
import { useGetProveedoresQuery } from '../../store/apis/proveedoresApi';
import { useGetUsuariosQuery } from '../../store/apis/authApi';

import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const initialState = {
  codigo_activo: '',
  nombre_activo: '',
  descripcion: '',
  id_categoria: '',
  id_marca: '',
  id_ubicacion: '',
  id_estado: '',
  id_proveedor: '',
  modelo: '',
  numero_serie: '',
  fecha_adquisicion: '',
  costo_adquisicion: '',
  fecha_garantia_inicio: '',
  fecha_garantia_fin: '',
  especificaciones_tecnicas: '',
  observaciones: '',
  usuario_registro: '',
};

export const AgregarActivos = () => {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // RTK Query hooks
  const [addActivo] = useAddActivoMutation();
  const { data: activosData } = useGetActivosQuery();
  const { data: categoriasData, isLoading: loadingCategorias } = useGetCategoriasQuery();
  const { data: ubicacionesData, isLoading: loadingUbicaciones } = useGetUbicacionesQuery();
  const { data: marcasData, isLoading: loadingMarcas } = useGetMarcasQuery();
  const { data: estadosData, isLoading: loadingEstados } = useGetEstadosQuery();
  const { data: proveedoresData, isLoading: loadingProveedores } = useGetProveedoresQuery();
  const { data: usuariosData } = useGetUsuariosQuery();

  // Extraer info de los apis, manejando posibles estructuras
  const activos = Array.isArray(activosData) ? activosData : (activosData?.data || []);
  const categorias = Array.isArray(categoriasData) ? categoriasData : (categoriasData?.data || []);
  const ubicaciones = Array.isArray(ubicacionesData) ? ubicacionesData : (ubicacionesData?.data || []);
  const marcas = Array.isArray(marcasData) ? marcasData : (marcasData?.data || []);
  const estados = Array.isArray(estadosData) ? estadosData : (estadosData?.data || []);
  const proveedores = Array.isArray(proveedoresData) ? proveedoresData : (proveedoresData?.data || []);
  const usuarios = Array.isArray(usuariosData) ? usuariosData : (usuariosData?.data || []);

  const [validated, setValidated] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate warranty dates
  const validateWarrantyDates = () => {
    if (formData.fecha_garantia_inicio && formData.fecha_garantia_fin) {
      return new Date(formData.fecha_garantia_inicio) <= new Date(formData.fecha_garantia_fin);
    }
    return true;
  };

  // Validate for duplicates using existing activos data
  const validateDuplicates = () => {
    const errors = [];

    // Check codigo_activo duplicate
    if (formData.codigo_activo && formData.codigo_activo.trim() !== '') {
      const codigoExists = activos.some(activo => 
        activo.codigo_activo && 
        activo.codigo_activo.toLowerCase() === formData.codigo_activo.trim().toLowerCase()
      );
      if (codigoExists) {
        errors.push(`El código "${formData.codigo_activo}" ya existe en el sistema`);
      }
    }

    // Check numero_serie duplicate (only if provided)
    if (formData.numero_serie && formData.numero_serie.trim() !== '') {
      const serieExists = activos.some(activo => 
        activo.numero_serie && 
        activo.numero_serie.toLowerCase() === formData.numero_serie.trim().toLowerCase()
      );
      if (serieExists) {
        errors.push(`El número de serie "${formData.numero_serie}" ya existe en el sistema`);
      }
    }

    return errors;
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
    if (!formData.codigo_activo || formData.codigo_activo.trim() === '') {
      toast.error('El código del activo es obligatorio y no puede estar vacío');
      setIsLoading(false);
      return;
    }

    if (!formData.nombre_activo || formData.nombre_activo.trim() === '') {
      toast.error('El nombre del activo es obligatorio y no puede estar vacío');
      setIsLoading(false);
      return;
    }

    // Validate warranty dates
    if (!validateWarrantyDates()) {
      toast.error('La fecha de fin de garantía debe ser posterior a la fecha de inicio');
      setIsLoading(false);
      return;
    }

    // Validate for duplicates
    const duplicateErrors = validateDuplicates();
    if (duplicateErrors.length > 0) {
      duplicateErrors.forEach(error => toast.error(error));
      setIsLoading(false);
      return;
    }

    try {
      const result = await addActivo(formData).unwrap();
      toast.success(`Activo "${formData.nombre_activo}" agregado exitosamente`);
      
      // Reset form and validation state
      setFormData(initialState); 
      setValidated(false);
      
      // Navigate after a brief delay to show the success message
      setTimeout(() => {
        navigate('/listaactivos');
      }, 1500);
    } catch (error) {
      console.error('Error adding activo:', error);
      
      // Handle specific database errors
      if (error.data?.message?.includes('Duplicate entry') && error.data?.message?.includes('uq_activos_codigo')) {
        toast.error(`El código "${formData.codigo_activo}" ya existe. Por favor, utilice un código único.`);
      } else if (error.data?.message?.includes('Integrity constraint violation')) {
        toast.error('Error de validación: Verifique que todos los campos requeridos estén completos y sean únicos.');
      } else {
        toast.error('Error al agregar el activo: ' + (error.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <Container className="mt-4 ">
      <Row>
        <Col md={12} className='mb-5'>
          <Card>
            <Card.Header>
              <h4>Agregar Nuevo Activo</h4>
            </Card.Header>
            <Card.Body >
              <Form 
                noValidate
                validated={validated}
                onSubmit={handleSubmit}>
                <Row>
                  {/* Información Básica */}
                  <Col md={12}>
                    <h5 className="mb-3 text-primary">Información Básica</h5>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Código del Activo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="codigo_activo"
                        value={formData.codigo_activo}
                        onChange={handleInputChange}
                        placeholder="Ingrese el código del activo (ej: ACT-001)"
                        required
                        minLength={3}
                        maxLength={50}
                      />
                      <Form.Control.Feedback type="invalid">
                        El código del activo es obligatorio (3-50 caracteres).
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Activo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre_activo"
                        value={formData.nombre_activo}
                        onChange={handleInputChange}
                        placeholder="Ingrese el nombre del activo"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe ingresar el nombre del Activo.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        placeholder="Descripción del activo"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoría *</Form.Label>
                      <Form.Select
                        name="id_categoria"
                        value={formData.id_categoria}
                        onChange={handleInputChange}
                        required
                        disabled={loadingCategorias}
                      >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id_categoria} value={categoria.id_categoria}>
                            {categoria.nombre_categoria}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar una Categoría.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Marca</Form.Label>
                      <Form.Select
                        name="id_marca"
                        required
                        value={formData.id_marca}
                        onChange={handleInputChange}
                        disabled={loadingMarcas}
                      >
                        <option value="">Seleccione una marca</option>
                        {marcas.map((marca) => (
                          <option key={marca.id_marca} value={marca.id_marca}>
                            {marca.nombre_marca}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar una Marca.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ubicación</Form.Label>
                      <Form.Select
                        name="id_ubicacion"
                        required
                        value={formData.id_ubicacion}
                        onChange={handleInputChange}
                        disabled={loadingUbicaciones}
                      >
                        <option value="">Seleccione una ubicación</option>
                        {ubicaciones.map((ubicacion) => (
                          <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                            {ubicacion.edificio} - {ubicacion.aula_oficina}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar una Ubicación.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado *</Form.Label>
                      <Form.Select
                        name="id_estado"
                        value={formData.id_estado}
                        onChange={handleInputChange}
                        required
                        disabled={loadingEstados}
                      >
                        <option value="">Seleccione un estado</option>
                        {estados.map((estado) => (
                          <option key={estado.id_estado} value={estado.id_estado}>
                            {estado.nombre_estado}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar un Estado.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Proveedor</Form.Label>
                      <Form.Select

                        name="id_proveedor"
                        value={formData.id_proveedor}
                        onChange={handleInputChange}
                        disabled={loadingProveedores}
                        required
                      >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((proveedor) => (
                          <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                            {proveedor.nombre_proveedor}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar un Proveedor.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Usuario Registro</Form.Label>
                      <Form.Select
                        required
                        name="usuario_registro"
                        value={formData.usuario_registro}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccionar usuario</option>
                        {usuarios.map((usuario) => (
                          <option key={usuario.id_usuario} value={usuario.id_usuario}>
                            {usuario.nombre} {usuario.apellido} - {usuario.rol}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Debe seleccionar un usuario.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Detalles Técnicos */}
                  <Col md={12}>
                    <hr />
                    <h5 className="mb-3 text-primary">Detalles Técnicos</h5>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Modelo</Form.Label>
                      <Form.Control
                        
                        type="text"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleInputChange}
                        placeholder="Modelo del activo"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe ingresar el modelo.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Serie</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="numero_serie"
                        value={formData.numero_serie}
                        onChange={handleInputChange}
                        placeholder="Número de serie"
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe ingresar el número de serie.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Especificaciones Técnicas</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="especificaciones_tecnicas"
                        value={formData.especificaciones_tecnicas}
                        onChange={handleInputChange}
                        placeholder="Especificaciones técnicas del activo"
                      />
                    </Form.Group>
                  </Col>

                  {/* Información Financiera */}
                  <Col md={12}>
                    <hr />
                    <h5 className="mb-3 text-primary">Información Financiera</h5>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Adquisición</Form.Label>
                      <Form.Control
                        required
                        type="date"
                        name="fecha_adquisicion"
                        value={formData.fecha_adquisicion}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe ingresar la fecha de adquisición.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Costo de Adquisición</Form.Label>
                      <Form.Control
                        required
                        type="number"
                        step="0.01"
                        name="costo_adquisicion"
                        value={formData.costo_adquisicion}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe ingresar el costo de adquisición.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Garantía */}
                  <Col md={12}>
                    <hr />
                    <h5 className="mb-3 text-primary">Información de Garantía</h5>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha Inicio Garantía</Form.Label>
                      <Form.Control
                        required
                        type="date"
                        name="fecha_garantia_inicio"
                        value={formData.fecha_garantia_inicio}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe ingresar la fecha de inicio de garantía.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha Fin Garantía</Form.Label>
                      <Form.Control
                        required
                        type="date"
                        name="fecha_garantia_fin"
                        value={formData.fecha_garantia_fin}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Debe ingresar la fecha de fin de garantía.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Observaciones */}
                  <Col md={12}>
                    <hr />
                    <h5 className="mb-3 text-primary">Observaciones</h5>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Observaciones</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        placeholder="Observaciones adicionales sobre el activo"
                      />
                    </Form.Group>
                  </Col>

                  {/* Botones */}
                  <Col md={12}>
                    <hr />
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={isLoading}
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Guardando...
                          </>
                        ) : (
                          'Guardar Activo'
                        )}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        type="button" 
                        onClick={() => navigate('/listaactivos')}
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
