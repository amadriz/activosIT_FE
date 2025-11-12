import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const estadosApi = createApi({
  reducerPath: 'estadosApi',
  //baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.supersaloncr.com/activosituhispa/activosIT_BE/' }),
  tagTypes: ['Estado'],
  endpoints: (builder) => ({

    getEstados: builder.query({
      query: () => '/estados/fetchEstados',
      providesTags: ['Estado'],
    }),
    
  }),
});

export const { useGetEstadosQuery } = estadosApi;