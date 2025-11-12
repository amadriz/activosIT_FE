import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const proveedoresApi = createApi({
  reducerPath: 'proveedoresApi',
  //baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.supersaloncr.com/activosituhispa/activosIT_BE/' }),
  tagTypes: ['Proveedor'],
  endpoints: (builder) => ({

    getProveedores: builder.query({
      query: () => 'proveedores/fetchProveedores',
      providesTags: ['Proveedor'],
    }),

    agregarProveedor: builder.mutation({
      query: (newProveedor) => ({
        url: 'proveedores/agregarProveedor',
        method: 'POST',
        body: newProveedor,
      }),
      invalidatesTags: ['Proveedor'],
    }),

    actualizarProveedor: builder.mutation({
      query: ({ id, ...updatedProveedor }) => ({
        url: `proveedores/actualizarProveedor/${id}`,
        method: 'PUT',
        body: updatedProveedor,
      }),
      invalidatesTags: ['Proveedor'],
    }),

    eliminarProveedor: builder.mutation({
      query: (id) => ({
        url: `proveedores/eliminarProveedor/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Proveedor'],
    }),
    
  }),
});

export const { useGetProveedoresQuery, useAgregarProveedorMutation, useActualizarProveedorMutation, useEliminarProveedorMutation } = proveedoresApi;