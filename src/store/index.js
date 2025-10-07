import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './apis/authApi'
import { activosApi } from './apis/activosApi'

export const store = configureStore({
  reducer: {
    
    [authApi.reducerPath]: authApi.reducer,
    [activosApi.reducerPath]: activosApi.reducer,


  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, activosApi.middleware),

})