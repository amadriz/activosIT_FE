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


  }),
});

export const { useGetPrestamosQuery, useAddPrestamoMutation, useGetEstadoPrestamosQuery } = prestamosApi;