import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { PageLoader } from '@/components/common/PageLoader'
import { RouteError } from '@/components/common/RouteError'
import { AppLayout } from '@/components/layout/AppLayout'
import { loadComparePage, loadExplorePage } from '@/app/routeModules'
import AboutPage from '@/pages/AboutPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

// Loads a page chunk only when its route is visited (the 3D pages will be heavy).
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        // Pathless route: page errors render inside the layout, so navigation stays usable.
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'explore', lazy: lazyPage(loadExplorePage) },
          { path: 'compare', lazy: lazyPage(loadComparePage) },
          { path: 'about', element: <AboutPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
