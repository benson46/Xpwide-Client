import axios from 'axios';
import { showErrorToast } from './toastUtils'
import { showCustomAlert } from './customAlert';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

//userblock interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const email = localStorage.getItem('email');

    if (email) {
      config.params = { ...config.params, emailInt: email, email: email }; 
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('error in interceptor')
    const { status, data } = error?.response;
    console.log('status code and data: ', [status, data, data?.message]);

    if (error.response && error.response.status == 403 && error.response?.data?.message == 'User is blocked.') {
      const { isBlocked, message } = error.response?.data;
      console.log('checking the error and redirecting...')

      if (window.location.pathname == '/login' && isBlocked) {
        showErrorToast('Login is restricted')
      } else {
        if (isBlocked) {
          showCustomAlert('You have been blocked. Redirecting to login...')
          localStorage.removeItem('email');
          localStorage.removeItem('userId')
          window.location.href = '/login';
        }
      }

    }
    return Promise.reject(error);
  }
)

//token jwt 
axiosInstance.interceptors.request.use((config) => {
  const accessToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('accessToken='))
    ?.split('=')[1];

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
})


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Interceptor jwt triggered...');

    if (error.response) {
      const { status, data } = error.response;

      // Handle CSRF token validation failure
      if (status === 403 && data.message === 'CSRF token validation failed') {
        showCustomAlert('Suspicious activity detected. Your session has been terminated for security reasons. Please log in again to continue.');
        return Promise.reject(error);
      }

      if (status === 403 && data.message === 'Invalid or revoked access token') {
        console.log('Invalid or revoked access token detected.');
        showCustomAlert('Your session has expired or is invalid. Please log in again.', true);
        return Promise.reject(error);
      }

      // Handle access token expiration
      if (status === 401 && data.message === 'Access token not provided') {
        try {
          console.log('Attempting to refresh access token...');
          const refreshResponse = await axiosInstance.post('/user/refreshToken', {}, { withCredentials: true });
          console.log('Token refreshed successfully:', refreshResponse.data?.message);

          const newAccessToken = refreshResponse.data.accessToken;

          const originalRequest = error.config;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.log('Error happened during token refresh:', refreshError.response?.data);

          // Handle specific cases for invalid or missing refresh token
          if (
            refreshError.response?.status === 403 &&
            ['Refresh token not found', 'Invalid refresh token'].includes(refreshError.response?.data?.message)
          ) {
            console.log('Invalid or missing refresh token. Logging out the user...');
            showCustomAlert('Your session has expired. Please log in again.');
          }
        }
      }
    }

    // Reject the promise with the error for other cases
    return Promise.reject(error);
  }
);


//csrf secure
axiosInstance.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrfToken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
})

export default axiosInstance;
