import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ubicacionesApi = createApi({
  reducerPath: 'ubicacionesApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  tagTypes: ['Ubicacion'],
  endpoints: (builder) => ({

    getUbicaciones: builder.query({
      query: () => '/ubicaciones/fetchUbicaciones',
      providesTags: ['Ubicacion'],
    }),

    agregarUbicacion: builder.mutation({
      query: (newUbicacion) => ({
        url: '/ubicaciones/agregarUbicacion', 
        method: 'POST',
        body: newUbicacion,
      }),
      invalidatesTags: ['Ubicacion'],
    }),

    actualizarUbicacion: builder.mutation({
      query: ({ id, ...updatedUbicacion }) => ({
        url: `/ubicaciones/actualizarUbicacion/${id}`,
        method: 'PUT',
        body: updatedUbicacion,
      }),
      invalidatesTags: ['Ubicacion'],
    }),

    eliminarUbicacion: builder.mutation({
      query: (id) => ({
        url: `/ubicaciones/eliminarUbicacion/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ubicacion'],
    }),
    
  }),
});

export const { 
  useGetUbicacionesQuery, 
  useAgregarUbicacionMutation, 
  useActualizarUbicacionMutation, 
  useEliminarUbicacionMutation 
} = ubicacionesApi;