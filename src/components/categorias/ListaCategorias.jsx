import React, { useState } from 'react';
import { useGetCategoriasQuery, useEliminarCategoriaMutation } from "../../store/apis/categoriasApi";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Col, Container, Row, Spinner, Form, Button, Badge } from "react-bootstrap";
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

export const ListaCategorias = () => {
  const { data: categorias, error, isLoading, refetch } = useGetCategoriasQuery();
  const [eliminarCategoria] = useEliminarCategoriaMutation();
  const navigate = useNavigate();

  // Filter state
  const [filterText, setFilterText] = useState("");

  const categoriasData = categorias?.data || [];

  // Filter the data based on search text
  const filteredData = categoriasData.filter(item => {
    if (!filterText) return true;
    
    const searchText = filterText.toLowerCase();
    return (
      item.nombre_categoria?.toLowerCase().includes(searchText) ||
      item.id_categoria?.toString().includes(searchText) ||
      item.descripcion?.toLowerCase().includes(searchText)
    );
  });

  // Handle category deletion
  const handleDelete = (id, nombre) => {
    const confirmDelete = window.confirm(
      `¿Está seguro que desea eliminar la categoría "${nombre}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) {
      return;
    }

    eliminarCategoria(id)
      .unwrap()
      .then((response) => {
        toast.success("Categoría eliminada correctamente");
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
        
        toast.error(`Error al eliminar la categoría: ${errorMessage}`);
      });
  };

  // Table columns configuration
  const columns = [
    {
      name: "ID",
      selector: row => row.id_categoria,
      sortable: true,
      width: "80px"
    },
    {
      name: "Nombre Categoría",
      selector: row => row.nombre_categoria,
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
              navigate(`/actualizarcategoria/${row.id_categoria}`); 
            }}
            width="150px"
          >
            ✏️
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              handleDelete(row.id_categoria, row.nombre_categoria);
            }}
            title="Eliminar categoría"
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
            <span className="visually-hidden">Cargando categorías...</span>
          </Spinner>
          <p className="mt-2">Cargando categorías...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger" role="alert">
          <h5>Error al cargar categorías</h5>
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
              <h2 className="mb-1">Gestión de Categorías</h2>
              <p className="text-muted mb-0">
                Administra las categorías de activos del sistema
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate('/agregarcategoria')}
              className="d-flex align-items-center gap-2"
            >
              <span>➕</span>
              Nueva Categoría
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
                  <p className="mb-0">No se encontraron categorías</p>
                  <small className="text-muted">
                    {filterText ? 'Intenta con otros términos de búsqueda' : 'No hay categorías registradas'}
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
