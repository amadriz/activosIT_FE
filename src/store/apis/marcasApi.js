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
    
  }),
});

export const { useGetMarcasQuery } = marcasApi;