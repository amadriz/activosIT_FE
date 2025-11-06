import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export const authApi = createApi({
    reducerPath: 'authApi',
    //baseQuery: fetchBaseQuery({ baseUrl: 'https://pecosacr.com/agentesPecosa/agentespecosaBE/' }),
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/activosIT_BE/' }),
    endpoints: (builder) => ({
        getUsuarios: builder.query({
            query: () => 'Usuario/fetchUsers',
        }),
        getUsuarioById: builder.query({
            query: (userId) => `Usuario/fetchUser/${userId}`,
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
    useGetUsuarioByIdQuery,
    useLoginMutation, 
    useRegisterMutation 
} = authApi;