import GestureIcon from '@mui/icons-material/Gesture';
import HandymanIcon from '@mui/icons-material/Handyman';
import InfoIcon from '@mui/icons-material/Info';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MouseIcon from '@mui/icons-material/Mouse';
import SettingsIcon from '@mui/icons-material/Settings';
import TabIcon from '@mui/icons-material/Tab';
import TuneIcon from '@mui/icons-material/Tune';
import WebIcon from '@mui/icons-material/Web';
import { createTheme, LinkProps } from '@mui/material';
import { DashboardLayout, type Navigation, PageContainer } from '@toolpad/core';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import React from 'react';
import { Outlet, Link as RouterLink, LinkProps as RouterLinkProperties } from 'react-router';

const navigation: Navigation = [
  {
    segment: 'about',
    title: i18n.t('options_about'),
    icon: <InfoIcon />,
  },
  {
    segment: 'gestures',
    title: i18n.t('options_gestures'),
    icon: <GestureIcon />,
    children: [
      {
        segment: 'pages',
        title: i18n.t('options_gestures_pages'),
        icon: <WebIcon />,
      },
      {
        segment: 'tabs',
        title: i18n.t('options_gestures_tabs'),
        icon: <TabIcon />,
      },
      {
        segment: 'utilities',
        title: i18n.t('options_gestures_utilities'),
        icon: <HandymanIcon />,
      },
      {
        segment: 'others',
        title: i18n.t('options_gestures_others'),
        icon: <MoreHorizIcon />,
      },
      {
        segment: 'customs',
        title: i18n.t('options_gestures_customs'),
        icon: <TuneIcon />,
      },
    ],
  },
  {
    segment: 'settings',
    title: i18n.t('options_settings'),
    icon: <SettingsIcon />,
  },
];

if (globalThis.navigator.userAgent.includes('Mac')) {
  navigation.push({
    segment: 'right-click',
    title: i18n.t('options_rightClick'),
    icon: <MouseIcon />,
  });
}

const LinkBehavior = React.forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProperties, 'to'> & { href: RouterLinkProperties['to'] }
>((properties, reference) => {
  const { href, ...other } = properties;
  return <RouterLink ref={reference} to={href} {...other} />;
});
LinkBehavior.displayName = 'LinkBehavior';

const theme = createTheme({
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      } as LinkProps,
    },
  },
});

function App() {
  return (
    <>
      <ReactRouterAppProvider
        navigation={navigation}
        branding={{
          logo: <img src="/icon/48.png" alt="Silky Gestures" />,
          title: 'Silky Gestures',
        }}
        theme={theme}
      >
        <DashboardLayout>
          <PageContainer>
            <Outlet />
          </PageContainer>
        </DashboardLayout>
      </ReactRouterAppProvider>
    </>
  );
}

export default App;
