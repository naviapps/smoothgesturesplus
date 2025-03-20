import { Stack, Typography } from '@mui/material';

import GesturesCustomsPage from './gestures-customs';
import GesturesOthersPage from './gestures-others';
import GesturesPagesPage from './gestures-pages';
import GesturesTabsPage from './gestures-tabs';
import GesturesUtilitiesPage from './gestures-utilities';

function GesturesPage() {
  const title = `${i18n.t('options_gestures')} - ${i18n.t('name')}`;

  return (
    <>
      <title>{title}</title>
      <Stack sx={{ my: 2 }} spacing={2}>
        <Typography variant="h4">{i18n.t('options_gestures_pages')}</Typography>
        <GesturesPagesPage />
      </Stack>
      <Stack sx={{ my: 2 }} spacing={2}>
        <Typography variant="h4">{i18n.t('options_gestures_tabs')}</Typography>
        <GesturesTabsPage />
      </Stack>
      <Stack sx={{ my: 2 }} spacing={2}>
        <Typography variant="h4">{i18n.t('options_gestures_utilities')}</Typography>
        <GesturesUtilitiesPage />
      </Stack>
      <Stack sx={{ my: 2 }} spacing={2}>
        <Typography variant="h4">{i18n.t('options_gestures_others')}</Typography>
        <GesturesOthersPage />
      </Stack>
      <Stack sx={{ my: 2 }} spacing={2}>
        <Typography variant="h4">{i18n.t('options_gestures_customs')}</Typography>
        <GesturesCustomsPage />
      </Stack>
    </>
  );
}

export default GesturesPage;
