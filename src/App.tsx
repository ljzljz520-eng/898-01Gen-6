import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.js';
import { useStore } from './store/useStore.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Schedules from './pages/Schedules.js';
import CreateSchedule from './pages/CreateSchedule.js';
import ScheduleDetail from './pages/ScheduleDetail.js';
import Shootings from './pages/Shootings.js';
import Works from './pages/Works.js';
import Profile from './pages/Profile.js';
import UserDetail from './pages/UserDetail.js';
import NotFound from './pages/NotFound.js';

function NavbarLayout() {
  return (
    <div className="min-h-screen bg-charcoal-800">
      <Navbar />
      <Outlet />
    </div>
  );
}

function RequireAuth() {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function App() {
  const { checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const router = createBrowserRouter([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      element: <NavbarLayout />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/schedules',
          element: <Schedules />,
        },
        {
          path: '/schedule/:id',
          element: <ScheduleDetail />,
        },
        {
          path: '/user/:id',
          element: <UserDetail />,
        },
        {
          element: <RequireAuth />,
          children: [
            {
              path: '/schedule/create',
              element: <CreateSchedule />,
            },
            {
              path: '/shootings',
              element: <Shootings />,
            },
            {
              path: '/works',
              element: <Works />,
            },
            {
              path: '/profile',
              element: <Profile />,
            },
          ],
        },
        {
          path: '*',
          element: <NotFound />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
