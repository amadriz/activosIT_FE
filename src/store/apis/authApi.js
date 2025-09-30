import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export const authApi = createApi({
    reducerPath: 'authApi',
    //baseQuery: fetchBaseQuery({ baseUrl: 'https://pecosacr.com/agentesPecosa/agentespecosaBE/' }),
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost//' }),
    endpoints: (builder) => ({
        getUsuarios: builder.query({
            query: () => 'Usuario/getUsuarios',
        }),
        login: builder.mutation({
            query: (loginData) => ({
                url: 'Usuario/login',
                method: 'POST',
                body: loginData,
            }),
        }),
        register: builder.mutation({
            query: (registerData) => ({
                url: 'Usuario/registro',
                method: 'POST',
                body: registerData,
            }),
        }),
    }),
});

export const { 
    useGetUsuariosQuery, 
    useLoginMutation, 
    useRegisterMutation 
} = authApi;