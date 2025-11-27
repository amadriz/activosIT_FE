import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.supersaloncr.com/activosituhispa/activosIT_BE/' }),
  tagTypes: ['dashboard'],
  endpoints: (builder) => ({
    getActivosResumen: builder.query({
      query: () => 'dashboard/activosResumen',
      providesTags: ['dashboard'],
    }),

    getActivosTendencia: builder.query({
      query: () => 'dashboard/activosTendencia',
      providesTags: ['dashboard'],
    }),

    getPrestamosTasaAprobacion: builder.query({
      query: () => 'dashboard/prestamosTasaAprobacion',
      providesTags: ['dashboard'],
    }),

    getPrestamosResumen: builder.query({
      query: () => 'dashboard/prestamosResumen',
      providesTags: ['dashboard'],
    }),

    getActivosMasPrestados: builder.query({
      query: () => 'dashboard/activosMasPrestados',
      providesTags: ['dashboard'],
    }),
  }),
});

export const { useGetActivosResumenQuery, useGetActivosTendenciaQuery, useGetPrestamosTasaAprobacionQuery, useGetPrestamosResumenQuery, useGetActivosMasPrestadosQuery } = dashboardApi;