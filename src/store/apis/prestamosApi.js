import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const prestamosApi = createApi({
  reducerPath: 'prestamosApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE' }),
  tagTypes: ['Prestamo'],
  endpoints: (builder) => ({
    getPrestamos: builder.query({
      query: () => 'prestamos/fetchPrestamos',
      providesTags: ['Prestamo'],
    }),

    addPrestamo: builder.mutation({
      query: (newPrestamo) => ({
        url: 'prestamos/solicitudPrestamo',
        method: 'POST',
        body: newPrestamo,
      }),
      invalidatesTags: ['Prestamo'],
    }),

    getEstadoPrestamos: builder.query({
      query: () => 'prestamos/estado_Prestamo',
      providesTags: ['Prestamo'],
    }),

    deletePrestamo: builder.mutation({
        query: (id) => ({
            url: `prestamos/eliminarPrestamo/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Prestamo'],
    }),

    aprobarPrestamo: builder.mutation({
        query: ({ id_prestamo, accion, usuario_aprobador, observaciones }) => ({
            url: `prestamos/aprobarPrestamo/${id_prestamo}`,
            method: 'PUT',
            body: {
                accion,
                usuario_aprobador,
                observaciones
            },
        }),
        invalidatesTags: ['Prestamo'],
    }),

    entregarPrestamo: builder.mutation({
        query: ({ id_prestamo, usuario_entregador, observaciones }) => ({
            url: `prestamos/entregarPrestamo/${id_prestamo}`,
            method: 'PUT',
            body: {
                usuario_entregador,
                observaciones
            },
        }),
        invalidatesTags: ['Prestamo'],
    }),

    devolverPrestamo: builder.mutation({
        query: ({ id_prestamo, usuario_recibe, observaciones, calificacion }) => ({
            url: `prestamos/devolverPrestamo/${id_prestamo}`,
            method: 'PUT',
            body: {
                usuario_recibe,
                calificacion,
                observaciones
            },
        }),
        invalidatesTags: ['Prestamo'],
    }),

  }),
});

export const { useGetPrestamosQuery, useAddPrestamoMutation, useGetEstadoPrestamosQuery, useDeletePrestamoMutation, useAprobarPrestamoMutation, useEntregarPrestamoMutation, useDevolverPrestamoMutation } = prestamosApi;