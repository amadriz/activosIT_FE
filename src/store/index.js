import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './apis/authApi'

export const store = configureStore({
  reducer: {
    
    [authApi.reducerPath]: authApi.reducer,


  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(),
})