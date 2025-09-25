import { createRoot } from 'react-dom/client'
import { store } from './store'
import { Provider } from 'react-redux'

import { AppRouter } from './routers/AppRouter'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AppRouter />
  </Provider>,
)

