import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoriasApi = createApi({
  reducerPath: 'categoriasApi',
  //baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.supersaloncr.com/activosituhispa/activosIT_BE/' }),
  tagTypes: ['Categoria'],
  endpoints: (builder) => ({

    getCategorias: builder.query({
      query: () => 'categorias/fetchCategorias',
      providesTags: ['Categoria'],
    }),

    agregarCategoria: builder.mutation({
      query: (newCategoria) => ({
        url: 'categorias/agregarCategoria',
        method: 'POST',
        body: newCategoria,
      }),
      invalidatesTags: ['Categoria'],
    }),

    actualizarCategoria: builder.mutation({
      query: ({ id, ...updatedCategoria }) => ({
        url: `categorias/actualizarCategoria/${id}`,
        method: 'PUT',
        body: updatedCategoria,
      }),
      invalidatesTags: ['Categoria'],
    }),

    eliminarCategoria: builder.mutation({
      query: (id) => ({
        url: `categorias/eliminarCategoria/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categoria'],
    }), 
    
  }),
});

export const { useGetCategoriasQuery, useAgregarCategoriaMutation, useActualizarCategoriaMutation, useEliminarCategoriaMutation } = categoriasApi;