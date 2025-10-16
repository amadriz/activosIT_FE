import { useGetPrestamosQuery } from '../../store/apis/prestamosApi';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

import './EstilosPrestamo.css';

import { Col, Container, Row, Spinner, Form, Button, Badge } from "react-bootstrap";
import { toast } from "react-toastify";

// Estilos mínimos personalizados


export const ListaPrestamos = () => {
  const { data: prestamos, error, isLoading, refetch } = useGetPrestamosQuery();
  
  const prestamosData = prestamos?.data || [];

  const navigate = useNavigate();

  //Filtros busqueda
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vencimientoFilter, setVencimientoFilter] = useState("");

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterText(value);
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
  };

  const handleVencimientoFilterChange = (e) => {
    const value = e.target.value;
    setVencimientoFilter(value);
  };

  // Get unique values for dropdowns
  const uniqueStatuses = [...new Set(prestamosData.map(item => item.estado_prestamo).filter(Boolean))];
  const uniqueVencimientos = [...new Set(prestamosData.map(item => item.estado_vencimiento).filter(Boolean))];

  // Filter the data based on search text, status, and vencimiento
  const filteredData = prestamosData.filter(item => {
    // Text filter
    const matchesText = !filterText || (() => {
      const searchText = filterText.toLowerCase();
      return (
        item.codigo_activo?.toLowerCase().includes(searchText) ||
        item.nombre_activo?.toLowerCase().includes(searchText) ||
        item.solicitante?.toLowerCase().includes(searchText) ||
        item.proposito?.toLowerCase().includes(searchText) ||
        item.categoria?.toLowerCase().includes(searchText) ||
        item.marca?.toLowerCase().includes(searchText) ||
        item.ubicacion?.toLowerCase().includes(searchText) ||
        item.usuario_aprobador?.toLowerCase().includes(searchText) ||
        item.id_prestamo?.toString().includes(searchText)
      );
    })();

    // Status filter
    const matchesStatus = !statusFilter || item.estado_prestamo === statusFilter;
    
    // Vencimiento filter
    const matchesVencimiento = !vencimientoFilter || item.estado_vencimiento === vencimientoFilter;

    return matchesText && matchesStatus && matchesVencimiento;
  });

  // Function to get badge variant based on status
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'aprobado': return 'success';
      case 'solicitado': return 'primary';
      case 'pendiente': return 'warning';
      case 'rechazado': return 'danger';
      case 'entregado': return 'info';
      case 'devuelto': return 'secondary';
      default: return 'light';
    }
  };

  // Function to get badge variant based on vencimiento
  const getVencimientoBadge = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'ok': return 'success';
      case 'vencido': return 'danger';
      case 'por vencer': return 'warning';
      default: return 'light';
    }
  };

  // Configuración de columnas para la tabla
  const columns = [
    {
      name: "ID",
      selector: row => row.id_prestamo,
      sortable: true,
      width: "70px"
    },
    {
      name: "Código Activo",
      selector: row => row.codigo_activo,
      sortable: true,
      width: "120px"
    },
    {
      name: "Activo",
      selector: row => row.nombre_activo,
      sortable: true,
      width: "130px",
      wrap: true
    },
    {
      name: "Solicitante",
      selector: row => row.solicitante,
      sortable: true,
      width: "120px",
      wrap: true
    },
    {
      name: "Propósito",
      selector: row => row.proposito,
      sortable: true,
      width: "130px",
      wrap: true
    },
    {
      name: "F. Solicitud",
      selector: row => row.fecha_solicitud,
      sortable: true,
      width: "140px",
      cell: row => {
        const fecha = new Date(row.fecha_solicitud);
        return (
          <div className="text-center">
            <div>{fecha.toLocaleDateString('es-ES')}</div>
            <small className="text-muted">{fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</small>
          </div>
        );
      },
      wrap: true
    },
    {
      name: "F. Inicio",
      selector: row => row.fecha_inicio_solicitada,
      sortable: true,
      width: "140px",
      cell: row => {
        const fecha = new Date(row.fecha_inicio_solicitada);
        return (
          <div className="text-center">
            <div>{fecha.toLocaleDateString('es-ES')}</div>
            <small className="text-muted">{fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</small>
          </div>
        );
      },
      wrap: true
    },
    {
      name: "F. Fin",
      selector: row => row.fecha_fin_solicitada,
      sortable: true,
      width: "140px",
      cell: row => {
        const fecha = new Date(row.fecha_fin_solicitada);
        return (
          <div className="text-center">
            <div>{fecha.toLocaleDateString('es-ES')}</div>
            <small className="text-muted">{fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</small>
          </div>
        );
      },
      wrap: true
    },
    {
      name: "Tiempo Total",
      selector: row => `${row.fecha_inicio_solicitada}-${row.fecha_fin_solicitada}`,
      sortable: true,
      width: "110px",
      cell: row => {
        const inicio = new Date(row.fecha_inicio_solicitada);
        const fin = new Date(row.fecha_fin_solicitada);
        const diffTime = fin - inicio;
        const diffHours = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10;
        
        if (diffHours >= 24) {
          const days = Math.floor(diffHours / 24);
          const hours = Math.round((diffHours % 24) * 10) / 10;
          return (
            <div className="text-center">
              <span className="badge bg-info">
                {days}d {hours > 0 ? `${hours}h` : ''}
              </span>
            </div>
          );
        } else {
          return (
            <div className="text-center">
              <span className="badge bg-primary">
                {diffHours}h
              </span>
            </div>
          );
        }
      },
      wrap: true
    },
    {
      name: "Estado",
      selector: row => row.estado_prestamo,
      sortable: true,
      width: "110px",
      cell: row => (
        <Badge bg={getStatusBadge(row.estado_prestamo)}>
          {row.estado_prestamo}
        </Badge>
      )
    },
    {
      name: "Vencimiento",
      selector: row => row.estado_vencimiento,
      sortable: true,
      width: "110px",
      cell: row => (
        <Badge bg={getVencimientoBadge(row.estado_vencimiento)}>
          {row.estado_vencimiento}
        </Badge>
      )
    },
    {
      name: "Días",
      selector: row => row.dias_transcurridos,
      sortable: true,
      width: "70px",
      cell: row => (
        <span className={row.dias_transcurridos > 0 ? 'text-danger fw-bold' : 'text-muted'}>
          {row.dias_transcurridos}
        </span>
      )
    },
    {
      name: "Aprobador",
      selector: row => row.usuario_aprobador,
      sortable: true,
      width: "120px",
      wrap: true
    },
    {
      name: "Categoría",
      selector: row => row.categoria,
      sortable: true,
      width: "120px"
    },
    {
      name: "F. Entrega",
      selector: row => row.fecha_entrega,
      sortable: true,
      width: "140px",
      cell: row => {
        if (!row.fecha_entrega) return '-';
        const fecha = new Date(row.fecha_entrega);
        return (
          <div className="text-center">
            <div>{fecha.toLocaleDateString('es-ES')}</div>
            <small className="text-muted">{fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</small>
          </div>
        );
      },
      wrap: true
    },
    {
      name: "F. Devolución",
      selector: row => row.fecha_devolucion,
      sortable: true,
      width: "140px",
      cell: row => {
        if (!row.fecha_devolucion) return '-';
        const fecha = new Date(row.fecha_devolucion);
        return (
          <div className="text-center">
            <div>{fecha.toLocaleDateString('es-ES')}</div>
            <small className="text-muted">{fecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</small>
          </div>
        );
      },
      wrap: true
    },
    {
        name: "Calificación",
        selector: row => row.calificacion_prestamo,
        sortable: true,
        width: "80px",
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
          <span className="visually-hidden">Cargando préstamos...</span>
        </Spinner>
        <p className="mt-2">Cargando préstamos...</p>
      </div>
    </Container>
  );
  
  if (error) return (
    <Container className="mt-5">
      <div className="alert alert-danger" role="alert">
        Error al cargar préstamos: {error.message}
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
                    placeholder="Buscar por activo, solicitante, propósito..."
                    aria-label="Search"
                    value={filterText}
                    onChange={handleFilterChange}
                    className="border-0 shadow-sm"
                  />
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
                <Col lg={2} md={3} sm={12}>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="bi bi-clock me-2"></i>Vencimiento
                  </Form.Label>
                  <Form.Select
                    aria-label="Filtrar por vencimiento"
                    value={vencimientoFilter}
                    onChange={handleVencimientoFilterChange}
                    className="border-0 shadow-sm"
                  >
                    <option value="">Todos</option>
                    {uniqueVencimientos.map((vencimiento, index) => (
                      <option key={index} value={vencimiento}>
                        {vencimiento}
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
                      setVencimientoFilter("");
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
                      {filterText || statusFilter || vencimientoFilter ? 
                        `${filteredData.length} de ${prestamosData.length}` : 
                        `${prestamosData.length} préstamos`
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
              <h2 className="card-title mb-0 text-center">Lista de Préstamos de Activos IT</h2>
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
                noDataComponent="No hay préstamos disponibles"
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
            onClick={() => { navigate('/solicitarprestamo'); }}
            className="d-inline-flex align-items-center justify-content-center"
          >
            <i className="bi bi-plus-lg me-2"></i> Nuevo Préstamo
          </Button>
        </Col>
      </Row>
    </Container>
  );
};
