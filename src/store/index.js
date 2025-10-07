import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './apis/authApi'
import { activosApi } from './apis/activosApi'
import { estadosApi } from './apis/estadosApi'
import { marcasApi } from './apis/marcasApi'
import { proveedoresApi } from './apis/proveedoresApi'
import { ubicacionesApi } from './apis/ubicacionesApi'
import { categoriasApi } from './apis/categoriasApi'

export const store = configureStore({
  reducer: {
    
    [authApi.reducerPath]: authApi.reducer,
    [activosApi.reducerPath]: activosApi.reducer,
    [estadosApi.reducerPath]: estadosApi.reducer,
    [marcasApi.reducerPath]: marcasApi.reducer,
    [proveedoresApi.reducerPath]: proveedoresApi.reducer,
    [ubicacionesApi.reducerPath]: ubicacionesApi.reducer,
    [categoriasApi.reducerPath]: categoriasApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      activosApi.middleware,
      estadosApi.middleware,
      marcasApi.middleware,
      proveedoresApi.middleware,
      ubicacionesApi.middleware,
      categoriasApi.middleware
    ),

})