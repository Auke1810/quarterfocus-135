import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
