import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const marcasApi = createApi({
  reducerPath: 'marcasApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  tagTypes: ['Marca'],
  endpoints: (builder) => ({

    getMarcas: builder.query({
      query: () => '/marcas/fetchMarcas',
      providesTags: ['Marca'],
    }),

    agregarMarca: builder.mutation({
      query: (newMarca) => ({
        url: '/marcas/agregarMarca',
        method: 'POST',
        body: newMarca,
      }),
      invalidatesTags: ['Marca'],
    }),

    actualizarMarca: builder.mutation({
      query: ({ id, ...updatedMarca }) => ({
        url: `/marcas/actualizarMarca/${id}`,
        method: 'PUT',
        body: updatedMarca,
      }),
      invalidatesTags: ['Marca'],
    }),

    eliminarMarca: builder.mutation({
      query: (id) => ({
        url: `/marcas/eliminarMarca/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Marca'],
    }),   
  }),
});

export const { 
  useGetMarcasQuery, 
  useAgregarMarcaMutation, 
  useActualizarMarcaMutation, 
  useEliminarMarcaMutation,
  useVerificarMarcaEnUsoQuery
} = marcasApi;