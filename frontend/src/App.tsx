import './App.css';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './routes/index';
import AuthInitializer from './components/auth/AuthInitializer';

const App = () => {
  return (
    <AuthInitializer>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px' },
        }}
      />
    </AuthInitializer>
  );
};

export default App;
