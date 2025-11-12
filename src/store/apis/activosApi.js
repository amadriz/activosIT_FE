import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const activosApi = createApi({
  reducerPath: 'activosApi',
  //baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.supersaloncr.com/activosituhispa/activosIT_BE/'}),
  tagTypes: ['Activo'],
  endpoints: (builder) => ({
    
    getActivos: builder.query({
      query: () => 'activos/fetchActivos',
      providesTags: ['Activo'],
    }),

    addActivo: builder.mutation({
      query: (newActivo) => ({
        url: 'activos/agregarActivos',
        method: 'POST',
        body: newActivo,
      }),
      invalidatesTags: ['Activo'],
    }),

    updateActivo: builder.mutation({
        query: ({ id, ...updatedActivo }) => ({
            url: `activos/actualizarActivos/${id}`,
            method: 'PUT',
            body: updatedActivo,
        }),
        invalidatesTags: ['Activo'],
    }),
    
    deleteActivo: builder.mutation({
        query: (id) => ({
            url: `activos/eliminarActivos/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Activo'],
    }),
}),

});

export const { useGetActivosQuery, useAddActivoMutation, useUpdateActivoMutation, useDeleteActivoMutation } = activosApi;