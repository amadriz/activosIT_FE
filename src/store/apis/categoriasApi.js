import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoriasApi = createApi({
  reducerPath: 'categoriasApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  tagTypes: ['Categoria'],
  endpoints: (builder) => ({

    getCategorias: builder.query({
      query: () => '/categorias/fetchCategorias',
      providesTags: ['Categoria'],
    }),
    
  }),
});

export const { useGetCategoriasQuery } = categoriasApi;