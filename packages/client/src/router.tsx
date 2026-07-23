import { createBrowserRouter } from "react-router"
import { RootLayout } from "@/layouts/RootLayout"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: () => import("@/pages/Index"),
      },
      {
        path: "login",
        lazy: () => import("@/pages/Login"),
      },
      {
        path: "dashboard",
        lazy: () => import("@/pages/Dashboard"),
      },
    ],
  },
])
