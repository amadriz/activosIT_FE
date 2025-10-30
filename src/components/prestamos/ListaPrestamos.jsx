import { useGetPrestamosQuery,useDeletePrestamoMutation } from '../../store/apis/prestamosApi';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useAuth } from '../hooks/useAuth';

import './EstilosPrestamo.css';

import { Col, Container, Row, Spinner, Form, Button, Badge } from "react-bootstrap";
import { toast } from "react-toastify";

// Estilos mínimos personalizados


export const ListaPrestamos = () => {
  const { data: prestamos, error, isLoading, refetch } = useGetPrestamosQuery();
  
  const prestamosData = prestamos?.data || [];

  const [eliminarPrestamo] = useDeletePrestamoMutation();

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

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

  // Filter the data based on search text, status
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

  function deleteRow(id) {
        const confirmDelete = window.confirm(
          `¿Está seguro que desea eliminar el registro del Préstamo?.\n\nEsta acción no se puede deshacer.`
        );
        
        if (!confirmDelete) {
          return; // Exit if user cancels
        }
        eliminarPrestamo(id)
          .unwrap()
          .then(() => {
            toast.error("Registro eliminado correctamente");
            refetch();
          })
          .catch((error) => {
            toast.error(`Error al eliminar el registro: ${error.message}`);
          });
    
          
      }

  // Function to get badge variant based on status
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'solicitado': return 'warning';
      case 'aprobado': return 'success';
      case 'entregado': return 'info';
      case 'devuelto': return 'secondary';
      case 'rechazado': return 'danger';
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
      name: "Fecha Solicitud",
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
      name: "Fecha Inicio",
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
      name: "Fecha Fin",
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
      selector: row => row.duracion_planificada_horas,
      sortable: true,
      width: "110px",
      cell: row => {
        const horas = parseFloat(row.duracion_planificada_horas || 0);
        
        return (
          <div className="text-center">
            <span className="badge bg-primary">
              {horas}h
            </span>
          </div>
        );
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
    // {
    //   name: "Tiempo",
    //   selector: row => row.tiempo_transcurrido,
    //   sortable: true,
    //   width: "90px",
    //   cell: row => {
    //     // Extraer solo el número de horas del tiempo transcurrido
    //     const tiempoTranscurrido = row.tiempo_transcurrido || '';
    //     const horasTranscurridas = tiempoTranscurrido.match(/(\d+(?:\.\d+)?)\s*h/)?.[1] || '0';
        
    //     return (
    //       <div className="text-center">
    //         <small className="text-muted">{horasTranscurridas ? `${horasTranscurridas}h` : '-'}</small>
    //       </div>
    //     );
    //   },
    //   wrap: true
    // },
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
      name: "Fecha Entrega",
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
      name: "Fecha Devolución",
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
        <div className="d-flex gap-1">
          {/* Botones solo para administradores */}
          {isAdmin && row.estado_prestamo === 'Solicitado' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => { navigate(`/aprobarprestamo/${row.id_prestamo}`); }}
              title="Aprobar/Rechazar"
            >
              <i className="fas fa-check-circle"></i>
            </Button>
          )}
          {isAdmin && row.estado_prestamo === 'Aprobado' && (
            <Button
              variant="info"
              size="sm"
              onClick={() => { navigate(`/entregarprestamo/${row.id_prestamo}`); }}
              title="Entregar Préstamo"
            >
              <i className="fas fa-handshake"></i>
            </Button>
          )}
          {isAdmin && row.estado_prestamo === 'Entregado' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { navigate(`/devolverprestamo/${row.id_prestamo}`); }}
              title="Devolver Préstamo"
            >
              <i className="fas fa-undo"></i>
            </Button>
          )}
          
          {/* Botones administrativos solo para admins */}
          {/* {isAdmin && (
            <>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => { navigate(`/actualizaractivos/${row.id_activo}`); }}
                title="Editar Activo"
              >
                ✏️
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => deleteRow(row.id_prestamo)}
                title="Eliminar Préstamo"
              >
                🗑️
              </Button>
            </>
          )} */}
          </div>
      ),
      width: "180px",
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
      {/* Banner informativo para usuarios no administradores */}
      {!isAdmin && (
        <Row className="mb-3">
          <Col xs={12}>
            <div className="alert alert-info d-flex align-items-center">
              <i className="fas fa-info-circle me-2"></i>
              <div>
                <strong>Modo Usuario:</strong> Puedes ver todos los préstamos y solicitar nuevos préstamos. 
                Las funciones administrativas (aprobar, entregar, editar) están disponibles solo para administradores.
              </div>
            </div>
          </Col>
        </Row>
      )}

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
          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="success"
              size="lg"
              onClick={() => { navigate('/solicitarprestamo'); }}
              className="d-inline-flex align-items-center justify-content-center"
            >
              <i className="bi bi-plus-lg me-2"></i> Nuevo Préstamo
            </Button>
            
            <Button
              variant={statusFilter === 'Solicitado' ? 'primary' : 'danger'}
              size="lg"
              onClick={() => {
                if (statusFilter === 'Solicitado') {
                  setStatusFilter('');
                } else {
                  setStatusFilter('Solicitado');
                }
              }}
              className="d-inline-flex align-items-center justify-content-center"
            >
              <i className="fas fa-clock me-2"></i>
              {statusFilter === 'Solicitado' ? 'Ver Todos' : 'Solicitudes Pendientes'}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
