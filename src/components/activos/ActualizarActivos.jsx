import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";

import { useUpdateActivoMutation, useGetActivosQuery } from "../../store/apis/activosApi";

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

  const { data: activos, error, isLoading } = useGetActivosQuery();
  const [updateActivo, { isLoading: isUpdating }] = useUpdateActivoMutation();

  useEffect(() => {
    if (activos) {
      const activo = activos.find((item) => item.id === id);
      if (activo) {
        setFormData(activo);
      }
    }
  }, [activos, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    if (formData) {
      try {
        await updateActivo({ id, ...formData }).unwrap();
        toast.success("Activo actualizado con éxito");
        navigate("/listaactivos");
      } catch (error) {
        toast.error("Error al actualizar activo");
      }
    }
  };

  if (isLoading) return <Spinner animation="border" />;
  if (error) return <div>Error al cargar activos</div>;

  return (
    <div>ActualizarActivos</div>
  )
}
