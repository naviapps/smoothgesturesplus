import React from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, redirect } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import App from './app';
import AboutPage from './pages/about';
import GesturesPages from './pages/gestures';
import GesturesCustomsPage from './pages/gestures-customs';
import GesturesOthersPage from './pages/gestures-others';
import GesturesPagesPage from './pages/gestures-pages';
import GesturesTabsPage from './pages/gestures-tabs';
import GesturesUtilitiesPage from './pages/gestures-utilities';
import RightClickPage from './pages/right-click';
import SettingsPage from './pages/settings';

const router = createHashRouter([
  {
    Component: App,
    children: [
      {
        index: true,
        loader: () => redirect('about'),
      },
      {
        path: 'about',
        Component: AboutPage,
      },
      {
        path: 'gestures',
        children: [
          {
            index: true,
            Component: GesturesPages,
          },
          {
            path: 'pages',
            Component: GesturesPagesPage,
          },
          {
            path: 'tabs',
            Component: GesturesTabsPage,
          },
          {
            path: 'utilities',
            Component: GesturesUtilitiesPage,
          },
          {
            path: 'others',
            Component: GesturesOthersPage,
          },
          {
            path: 'customs',
            Component: GesturesCustomsPage,
          },
        ],
      },
      {
        path: 'settings',
        Component: SettingsPage,
      },
      {
        path: 'right-click',
        Component: RightClickPage,
      },
    ],
  },
]);

const root = document.querySelector('#root');
if (!root) throw new Error('No root element found');

createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
