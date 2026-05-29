import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage/LandingPage';

export const router = createBrowserRouter([
    //Landing page
    {
        path: "/",
        element: <LandingPage />
    },
    {
        // path: "/admin",
        // element: <AdminLayout />,
        // children: [
        //   {
        //     index: true,
        //     element: <AdminDashboardPage />,
        //   },
        //   {
        //     path: "users",
        //     element: <UserManagement />,
        //   },
        // ],

    },
    {
        // path: "/login",
        // element: <LoginPage />
    },


]);