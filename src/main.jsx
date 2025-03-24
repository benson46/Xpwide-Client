import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'; // Ensure Provider is imported
import { BrowserRouter } from 'react-router-dom';
import store from './store/store.js'; // Import the Redux store
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
document.title = import.meta.env.VITE_APP_TITLE;
createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId = {import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <Toaster />
          <App />
        </Provider>
      </BrowserRouter>
    </StrictMode>
  </GoogleOAuthProvider>
); 
