import type { FC } from 'react';
import { Link } from 'react-router';

const NotFoundPage: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#E8EAF0]">
      <h1 className="text-6xl font-bold text-brand-deep-navy">404</h1>
      <p className="mt-4 text-lg text-gray-600">Page not found</p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-brand-deep-navy px-6 py-3 text-sm font-medium text-white hover:bg-brand-navy"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
