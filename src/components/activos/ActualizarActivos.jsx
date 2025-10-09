import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";

import { useUpdateActivoMutation, useGetActivosQuery } from "../../store/apis/activosApi";
import { useGetCategoriasQuery } from "../../store/apis/categoriasApi";
import { useGetMarcasQuery } from "../../store/apis/marcasApi";
import { useGetUbicacionesQuery } from "../../store/apis/ubicacionesApi";
import { useGetEstadosQuery } from "../../store/apis/estadosApi";
import { useGetProveedoresQuery } from "../../store/apis/proveedoresApi";
import { useGetUsuariosQuery } from '../../store/apis/authApi';


import { Col, Container, Row, Spinner, Form, Button } from "react-bootstrap";

import { toast } from "react-toastify";

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


export const ActualizarActivos = () => {

  const { id } = useParams();

  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);

  const { data: activosData, error, isLoading } = useGetActivosQuery();
  const { data: categoriasData } = useGetCategoriasQuery();
  const { data: marcasData } = useGetMarcasQuery();
  const { data: ubicacionesData } = useGetUbicacionesQuery();
  const { data: estadosData } = useGetEstadosQuery();
  const { data: proveedoresData } = useGetProveedoresQuery();
  const [updateActivo, { isLoading: isUpdating }] = useUpdateActivoMutation();
    const { data: usuariosData } = useGetUsuariosQuery();

  // Extract data from API responses, handling possible structures
  const activos = Array.isArray(activosData) ? activosData : (activosData?.data || []);
  const categorias = Array.isArray(categoriasData) ? categoriasData : (categoriasData?.data || []);
  const marcas = Array.isArray(marcasData) ? marcasData : (marcasData?.data || []);
  const ubicaciones = Array.isArray(ubicacionesData) ? ubicacionesData : (ubicacionesData?.data || []);
  const estados = Array.isArray(estadosData) ? estadosData : (estadosData?.data || []);
  const proveedores = Array.isArray(proveedoresData) ? proveedoresData : (proveedoresData?.data || []);
  const usuarios = Array.isArray(usuariosData) ? usuariosData : (usuariosData?.data || []);

  useEffect(() => {
    if (activos && Array.isArray(activos) && categorias.length && marcas.length && ubicaciones.length && estados.length && proveedores.length && usuarios.length) {
      const activo = activos.find((item) => item.id_activo == id);
      if (activo) {
        // Find the IDs by matching names
        const categoriaId = categorias.find(cat => cat.nombre_categoria === activo.categoria)?.id_categoria || '';
        const marcaId = marcas.find(marca => marca.nombre_marca === activo.marca)?.id_marca || '';
        // For ubicacion, try flexible matching
        const ubicacionId = ubicaciones.find(ub => {
          const ubicacionFormat = `${ub.edificio} - ${ub.aula_oficina}`;
          // Try exact match first
          if (ubicacionFormat === activo.ubicacion) return true;
          
          // Try flexible matching by checking if the activo ubicacion contains the key parts
          const edificio = ub.edificio;
          const aulaOficina = ub.aula_oficina;
          
          return activo.ubicacion.includes(edificio) && activo.ubicacion.includes(aulaOficina);
        })?.id_ubicacion || '';
        const estadoId = estados.find(est => est.nombre_estado === activo.estado_activo)?.id_estado || '';
        const proveedorId = proveedores.find(prov => prov.nombre_proveedor === activo.proveedor)?.id_proveedor || '';
        
        // Find usuario ID by matching the usuario_registro field (could be name, full name, or ID)
        const usuarioId = usuarios.find(user => {
          // Try different matching strategies
          const fullName = `${user.nombre} ${user.apellido}`;
          const nameWithRole = `${user.nombre} ${user.apellido} - ${user.rol}`;
          
          return user.id_usuario == activo.usuario_registro || 
                 user.nombre === activo.usuario_registro ||
                 fullName === activo.usuario_registro ||
                 nameWithRole === activo.usuario_registro;
        })?.id_usuario || '';

        
        // Map the activo data to match form field names and dropdown values
        const mappedFormData = {
          codigo_activo: activo.codigo_activo || '',
          nombre_activo: activo.nombre_activo || '',
          descripcion: activo.descripcion || '',
          id_categoria: categoriaId,
          id_marca: marcaId,
          id_ubicacion: ubicacionId,
          id_estado: estadoId,
          id_proveedor: proveedorId,
          modelo: activo.modelo || '',
          numero_serie: activo.numero_serie || '',
          fecha_adquisicion: activo.fecha_adquisicion || activo.fecha_registro || '', 
          costo_adquisicion: activo.costo_adquisicion || '',
          fecha_garantia_inicio: activo.fecha_garantia_inicio || '', 
          fecha_garantia_fin: activo.fecha_garantia_fin || '',
          especificaciones_tecnicas: activo.especificaciones_tecnicas || '',
          observaciones: activo.observaciones || '',
          usuario_registro: usuarioId,
        };
        setFormData(mappedFormData);
      }
    }
  }, [activos, id, categorias, marcas, ubicaciones, estados, proveedores, usuarios]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    try {
      await updateActivo({ id, ...formData }).unwrap();
      toast.success("Activo actualizado con éxito");
      navigate("/listaactivos");
    } catch (error) {
      toast.error("Error al actualizar activo");
      console.error("Error:", error);
    }
  };

  if (isLoading) return (
    <Container className="d-flex justify-content-center mt-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    </Container>
  );
  
  if (error) return (
    <Container className="mt-5">
      <div className="alert alert-danger">Error al cargar activos</div>
    </Container>
  );

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8} className='mb-5'>
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">Actualizar Activo</h3>
            </div>
            <div className="card-body">
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  {/* Código del Activo */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Código del Activo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="codigo_activo"
                        value={formData.codigo_activo}
                        onChange={handleChange}
                        required
                        placeholder="Ingrese el código del activo"
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingrese el código del activo.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Nombre del Activo */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Activo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre_activo"
                        value={formData.nombre_activo}
                        onChange={handleChange}
                        required
                        placeholder="Ingrese el nombre del activo"
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingrese el nombre del activo.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Descripción */}
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Ingrese la descripción del activo"
                  />
                </Form.Group>

                <Row>
                  {/* Categoría */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoría *</Form.Label>
                      <Form.Select
                        name="id_categoria"
                        value={formData.id_categoria}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione una categoría</option>
                        {(() => {
                          const categoriasArray = Array.isArray(categorias) 
                            ? categorias 
                            : categorias?.data || [];
                          return categoriasArray.map((categoria) => (
                            <option key={categoria.id_categoria} value={categoria.id_categoria}>
                              {categoria.nombre_categoria}
                            </option>
                          ));
                        })()}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Por favor seleccione una categoría.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Marca */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Marca *</Form.Label>
                      <Form.Select
                        name="id_marca"
                        value={formData.id_marca}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione una marca</option>
                        {(() => {
                          const marcasArray = Array.isArray(marcas) 
                            ? marcas 
                            : marcas?.data || [];
                          return marcasArray.map((marca) => (
                            <option key={marca.id_marca} value={marca.id_marca}>
                              {marca.nombre_marca}
                            </option>
                          ));
                        })()}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Por favor seleccione una marca.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  {/* Ubicación */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ubicación *</Form.Label>
                      <Form.Select
                        name="id_ubicacion"
                        value={formData.id_ubicacion}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione una ubicación</option>
                        {(() => {
                          const ubicacionesArray = Array.isArray(ubicaciones) 
                            ? ubicaciones 
                            : ubicaciones?.data || [];
                          return ubicacionesArray.map((ubicacion) => (
                            <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                              {ubicacion.edificio} - {ubicacion.aula_oficina}
                            </option>
                          ));
                        })()}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Por favor seleccione una ubicación.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Estado */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado *</Form.Label>
                      <Form.Select
                        name="id_estado"
                        value={formData.id_estado}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione un estado</option>
                        {(() => {
                          const estadosArray = Array.isArray(estados) 
                            ? estados 
                            : estados?.data || [];
                          return estadosArray.map((estado) => (
                            <option key={estado.id_estado} value={estado.id_estado}>
                              {estado.nombre_estado}
                            </option>
                          ));
                        })()}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Por favor seleccione un estado.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  {/* Proveedor */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Proveedor</Form.Label>
                      <Form.Select
                        name="id_proveedor"
                        value={formData.id_proveedor}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione un proveedor</option>
                        {(() => {
                          const proveedoresArray = Array.isArray(proveedores) 
                            ? proveedores 
                            : proveedores?.data || [];
                          return proveedoresArray.map((proveedor) => (
                            <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                              {proveedor.nombre_proveedor}
                            </option>
                          ));
                        })()}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Modelo */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Modelo</Form.Label>
                      <Form.Control
                        type="text"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                        placeholder="Ingrese el modelo"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  {/* Número de Serie */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Serie</Form.Label>
                      <Form.Control
                        type="text"
                        name="numero_serie"
                        value={formData.numero_serie}
                        onChange={handleChange}
                        placeholder="Ingrese el número de serie"
                      />
                    </Form.Group>
                  </Col>

                  {/* Fecha de Adquisición */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Adquisición</Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha_adquisicion"
                        value={formData.fecha_adquisicion ? formData.fecha_adquisicion.split('T')[0] : ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  {/* Costo de Adquisición */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Costo de Adquisición</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="costo_adquisicion"
                        value={formData.costo_adquisicion}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>

                  {/* Usuario de Registro */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Usuario Registro</Form.Label>
                      <Form.Select
                        required
                        name="usuario_registro"
                        value={formData.usuario_registro}
                        onChange={handleChange}
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
                </Row>

                <Row>
                  {/* Fecha Inicio Garantía */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha Inicio Garantía</Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha_garantia_inicio"
                        value={formData.fecha_garantia_inicio ? formData.fecha_garantia_inicio.split('T')[0] : ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  {/* Fecha Fin Garantía */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha Fin Garantía</Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha_garantia_fin"
                        value={formData.fecha_garantia_fin ? formData.fecha_garantia_fin.split('T')[0] : ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Especificaciones Técnicas */}
                <Form.Group className="mb-3">
                  <Form.Label>Especificaciones Técnicas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="especificaciones_tecnicas"
                    value={formData.especificaciones_tecnicas}
                    onChange={handleChange}
                    placeholder="Ingrese las especificaciones técnicas"
                  />
                </Form.Group>

                {/* Observaciones */}
                <Form.Group className="mb-4">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Ingrese observaciones adicionales"
                  />
                </Form.Group>

                {/* Botones */}
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate("/listaactivos")}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Activo'
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
