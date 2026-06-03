import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import store from './store/store';
import { injectStore } from './api/api';
import './index.css'
import App from './App.jsx'

// Give the api interceptor access to Redux store
// so it reads the token from Redux (not just localStorage)
injectStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider> 
  </StrictMode>,
)
