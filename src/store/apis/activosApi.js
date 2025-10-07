import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const activosApi = createApi({
  reducerPath: 'activosApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  tagTypes: ['Activo'],
  endpoints: (builder) => ({
    
    getActivos: builder.query({
      query: () => '/activos/fetchActivos',
      providesTags: ['Activo'],
        
       
  }),
}),

});

export const { useGetActivosQuery } = activosApi;