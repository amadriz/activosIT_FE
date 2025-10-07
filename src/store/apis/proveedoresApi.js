import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const proveedoresApi = createApi({
  reducerPath: 'proveedoresApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  tagTypes: ['Proveedor'],
  endpoints: (builder) => ({

    getProveedores: builder.query({
      query: () => '/proveedores/fetchProveedores',
      providesTags: ['Proveedor'],
    }),
    
  }),
});

export const { useGetProveedoresQuery } = proveedoresApi;