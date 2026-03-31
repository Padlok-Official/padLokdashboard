import type { FC } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './router';
import Providers from './providers';

const App: FC = () => {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
};

export default App;
