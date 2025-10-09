import { useGetActivosQuery, useDeleteActivoMutation } from "../../store/apis/activosApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

import './EstilosActivos.css';

import { Col, Container, Row, Spinner, Form, Button, Badge } from "react-bootstrap";
import { toast } from "react-toastify";


// Estilos mínimos personalizados
const customStyles = {
  headCells: {
    style: {
      backgroundColor: '#f8f9fa',
      fontWeight: 'bold',
    },
  },
};

export const ListaActivos = () => {
  const { data: activos, error, isLoading, refetch } = useGetActivosQuery();
  
  const activosData = activos?.data || [];

  const [eliminarActivo] = useDeleteActivoMutation();

  const navigate = useNavigate();

  //Filtros busqueda
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterText(value);
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
  };

  const handleCategoryFilterChange = (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
  };

  // Get unique values for dropdowns
  const uniqueStatuses = [...new Set(activosData.map(item => item.estado_activo).filter(Boolean))];
  const uniqueCategories = [...new Set(activosData.map(item => item.categoria).filter(Boolean))];

  // Filter the data based on search text, status, and category
  const filteredData = activosData.filter(item => {
    // Text filter
    const matchesText = !filterText || (() => {
      const searchText = filterText.toLowerCase();
      return (
        item.codigo_activo?.toLowerCase().includes(searchText) ||
        item.nombre_activo?.toLowerCase().includes(searchText) ||
        item.categoria?.toLowerCase().includes(searchText) ||
        item.marca?.toLowerCase().includes(searchText) ||
        item.modelo?.toLowerCase().includes(searchText) ||
        item.numero_serie?.toLowerCase().includes(searchText) ||
        item.estado_activo?.toLowerCase().includes(searchText) ||
        item.ubicacion?.toLowerCase().includes(searchText) ||
        item.id_activo?.toString().includes(searchText)
      );
    })();

    // Status filter
    const matchesStatus = !statusFilter || item.estado_activo === statusFilter;
    
    // Category filter
    const matchesCategory = !categoryFilter || item.categoria === categoryFilter;

    return matchesText && matchesStatus && matchesCategory;
  });

  // Function to handle asset deletion
  function deleteRow(id) {
      const confirmDelete = window.confirm(
        `¿Está seguro que desea eliminar el registro del Activo?.\n\nEsta acción no se puede deshacer.`
      );
      
      if (!confirmDelete) {
        return; // Exit if user cancels
      }
      eliminarActivo(id)
        .unwrap()
        .then(() => {
          toast.error("Registro eliminado correctamente");
          refetch();
        })
        .catch((error) => {
          toast.error(`Error al eliminar el registro: ${error.message}`);
        });
  
        
    }

  // Configuración de columnas para la tabla
  const columns = [
    {
      name: "Cod Activo",
      selector: row => row.codigo_activo,
      sortable: true,
      width: "100px"
    },
    {
      name: "Nombre",
      selector: row => row.nombre_activo,
      sortable: true,
      width: "180px",
      wrap: true
    },
    {
      name: "Categoría",
      selector: row => row.categoria,
      sortable: true,
      width: "120px"
    },
    {
      name: "Marca",
      selector: row => row.marca,
      sortable: true,
      width: "100px"
    },
    {
      name: "Modelo",
      selector: row => row.modelo,
      sortable: true,
      width: "200px"
    },
    //proveedor
    {
      name: "Proveedor",
      selector: row => row.proveedor,
      sortable: true,
      width: "200px"
    },
    {
      name: "# de Serie",
      selector: row => row.numero_serie,
      sortable: true,
      width: "120px",
      wrap: true
    },
    {
      name: "Estado",
      selector: row => row.estado_activo,
      sortable: true,
      width: "100px",
      cell: row => (
        <Badge 
          bg={row.estado_activo === 'Disponible' ? 'success' : 'warning'}
        >
          {row.estado_activo}
        </Badge>
      )
    },
    {
      name: "Costo Activo",
      selector: row => row.costo_adquisicion,
      sortable: true,
      width: "100px",
      cell: row => `$${parseFloat(row.costo_adquisicion || 0).toFixed(2)}`,
      wrap: true
    },
    {
      name: "Ubicación",
      selector: row => row.ubicacion,
      sortable: true,
      width: "250px"
    },
    {
      name: "Fecha Registro",
      selector: row => row.fecha_registro,
      sortable: true,
      width: "120px",
      cell: row => new Date(row.fecha_registro).toLocaleDateString('es-ES'),
      wrap: true
    },
    {
      name: "Fin Garantía",
      selector: row => row.fecha_garantia_fin,
      sortable: true,
      width: "120px",
      cell: row => new Date(row.fecha_garantia_fin).toLocaleDateString('es-ES'),
      wrap: true
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => { navigate(`/actualizaractivos/${row.id_activo}`); }}
            title="Editar"
          >
            ✏️
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => deleteRow(row.id_activo)}
            title="Eliminar"
          >
            🗑️
          </Button>
        </div>
      ),
      width: "120px",
      ignoreRowClick: true,
    },
  ];

  if (isLoading) return (
    <Container className="mt-5">
      <div className="text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando activos...</span>
        </Spinner>
        <p className="mt-2">Cargando activos...</p>
      </div>
    </Container>
  );
  
  if (error) return (
    <Container className="mt-5">
      <div className="alert alert-danger" role="alert">
        Error al cargar activos: {error.message}
      </div>
    </Container>
  );

  return (
    <Container fluid className="mt-5">
      <Row className="mb-4">
        <Col xs={12}>
          <div className="bg-light p-3 rounded shadow-sm">
            <Form>
              <Row className="g-3 align-items-end">
                <Col lg={4} md={6} sm={12}>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="bi bi-search me-2"></i>Búsqueda General
                  </Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Buscar por nombre, marca, modelo..."
                    aria-label="Search"
                    value={filterText}
                    onChange={handleFilterChange}
                    className="border-0 shadow-sm"
                  />
                </Col>
                <Col lg={2} md={3} sm={12}>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="bi bi-collection me-2"></i>Categoría
                  </Form.Label>
                  <Form.Select
                    aria-label="Filtrar por categoría"
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    className="border-0 shadow-sm"
                  >
                    <option value="">Todas</option>
                    {uniqueCategories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col lg={2} md={3} sm={12}>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="bi bi-funnel me-2"></i>Estado
                  </Form.Label>
                  <Form.Select
                    aria-label="Filtrar por estado"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="border-0 shadow-sm"
                  >
                    <option value="">Todos</option>
                    {uniqueStatuses.map((status, index) => (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col lg={2} md={6} sm={12}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setFilterText("");
                      setStatusFilter("");
                      setCategoryFilter("");
                    }}
                    className="w-100 d-flex align-items-center justify-content-center"
                    title="Limpiar todos los filtros"
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Limpiar
                  </Button>
                </Col>
                <Col lg={2} md={6} sm={12}>
                  <div className="text-end text-muted small">
                    <strong>
                      {filterText || statusFilter || categoryFilter ? 
                        `${filteredData.length} de ${activosData.length}` : 
                        `${activosData.length} activos`
                      }
                    </strong>
                  </div>
                </Col>
                
              </Row>
            </Form>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title mb-0 text-center">Lista de Activos IT</h2>
            </div>
            <div className="card-body">
              <DataTable
                columns={columns}
                data={filteredData}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                responsive
                highlightOnHover
                striped
                dense
                fixedHeader
                fixedHeaderScrollHeight="600px"
                noDataComponent="No hay activos disponibles"
                progressPending={isLoading}
                progressComponent={<div className="text-center">Cargando datos...</div>}
                wrap
              />
            </div>
          </div>
        </Col>
      </Row>
      
      <Row className="mt-3">
        <Col className="text-center">
          <Button
            variant="success"
            size="lg"
            onClick={() => navigate('/agregaractivo')}
            className="d-inline-flex align-items-center justify-content-center"
          >
            <i className="bi bi-plus-lg me-2"></i> Agregar Activo
          </Button>
        </Col>
      </Row>
    </Container>
  );
};
  