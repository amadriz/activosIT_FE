import React, { useState } from 'react';
import { useGetMarcasQuery, useEliminarMarcaMutation } from "../../store/apis/marcasApi";
import { useGetActivosQuery } from "../../store/apis/activosApi";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Col, Container, Row, Spinner, Form, Button, Badge, Alert, Card } from "react-bootstrap";
import { toast } from "react-toastify";

// Custom styles for the data table
const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      fontSize: '14px',
    },
  },
  cells: {
    style: {
      fontSize: '13px',
    },
  },
};

export const ListaMarcas = () => {
  const { data: marcas, error, isLoading, refetch } = useGetMarcasQuery();
  const { data: activos } = useGetActivosQuery();
  const [eliminarMarca] = useEliminarMarcaMutation();
  const navigate = useNavigate();

  // Filter state
  const [filterText, setFilterText] = useState("");

  const marcasData = marcas?.data || [];

  // Filter the data based on search text
  const filteredData = marcasData.filter(item => {
    if (!filterText) return true;
    
    const searchText = filterText.toLowerCase();
    return (
      item.nombre_marca?.toLowerCase().includes(searchText) ||
      item.id_marca?.toString().includes(searchText) ||
      item.descripcion?.toLowerCase().includes(searchText)
    );
  });

  // Borrar marcas
  const handleDelete = (id, nombre) => {
    const confirmDelete = window.confirm(
      `¿Está seguro que desea eliminar la marca "${nombre}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) {
      return;
    }

    eliminarMarca(id)
      .unwrap()
      .then((response) => {
        toast.success("Marca eliminada correctamente");
        refetch();
      })
      .catch((error) => {
        // Extract the message from the backend response
        let errorMessage = 'Error desconocido';
        
        if (error?.data?.message) {
          // If the backend sends a structured response with message
          errorMessage = error.data.message;
        } else if (error?.message) {
          // If the error has a direct message property
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          // If the error is a string
          errorMessage = error;
        }
        
        // Check for specific database constraint violations
        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('referenced by')) {
          toast.error(`No se puede eliminar la marca "${nombre}" porque está siendo utilizada por uno o más activos. Primero debe eliminar o reasignar los activos que usan esta marca.`);
        } else {
          toast.error(`Error al eliminar la marca: ${errorMessage}`);
        }
      });
  };

  // Table columns configuration
  const columns = [
    {
      name: "ID",
      selector: row => row.id_marca,
      sortable: true,
      width: "80px"
    },
    {
      name: "Nombre Marca",
      selector: row => row.nombre_marca,
      sortable: true,
      width: "200px",
      wrap: true
    },
    {
      name: "Descripción",
      selector: row => row.descripcion,
      sortable: true,
      width: "300px",
      wrap: true,
      cell: row => (
        <div title={row.descripcion}>
          {row.descripcion}
        </div>
      )
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              navigate(`/actualizarmarca/${row.id_marca}`); 
            }}
            title="Editar marca"
          >
            ✏️
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              handleDelete(row.id_marca, row.nombre_marca);
            }}
            title="Eliminar marca"
          >
            🗑️
          </Button>
        </div>
      ),
      width: "130px",
      ignoreRowClick: true,
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando marcas...</span>
          </Spinner>
          <p className="mt-2">Cargando marcas...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger" role="alert">
          <h5>Error al cargar marcas</h5>
          <p>{error.message || 'Ha ocurrido un error inesperado'}</p>
          <Button variant="outline-danger" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Gestión de Marcas</h2>
              <p className="text-muted mb-0">
                Administra las marcas de activos del sistema
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate('/agregarmarca')}
              className="d-flex align-items-center gap-2"
            >
              <span>➕</span>
              Nueva Marca
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters Section */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="bg-light p-3 rounded shadow-sm">
            <Form>
              <Row className="g-3 align-items-end">
                <Col lg={6} md={8} sm={12}>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="bi bi-search me-2"></i>Búsqueda
                  </Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Buscar por cualquier texto"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="border-0 shadow-sm"
                  />
                </Col>
                <Col lg={3} md={4} sm={12}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setFilterText("")}
                    className="w-100"
                  >
                    Limpiar Filtros
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>

      {/* Data Table Section */}
      <Row>
        <Col xs={12}>
          <div className="bg-white rounded shadow-sm">
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
              responsive
              highlightOnHover
              pointerOnHover
              customStyles={customStyles}
              noDataComponent={
                <div className="text-center py-4">
                  <p className="mb-0">No se encontraron marcas</p>
                  <small className="text-muted">
                    {filterText ? 'Intenta con otros términos de búsqueda' : 'No hay marcas registradas'}
                  </small>
                </div>
              }
              paginationComponentOptions={{
                rowsPerPageText: 'Filas por página:',
                rangeSeparatorText: 'de',
              }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};
