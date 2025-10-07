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
    
  }),
});

export const { useGetUbicacionesQuery } = ubicacionesApi;