import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  ButtonGroup,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useDialogs, useNotifications } from '@toolpad/core';
import { matchIsValidColor, MuiColorInput } from 'mui-color-input';
import React, { useState } from 'react';

import { Gesture } from '@/components/gesture';
import { VisuallyHiddenInput } from '@/components/visually-hidden-input';
import { useSettings } from '@/stores/settings-store';

function SettingsPage() {
  const title = `${i18n.t('options_settings')} - ${i18n.t('name')}`;
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const {
    newTabUrl,
    newTabRight,
    newTabLinkRight,
    stroke,
    strokeWidth,
    contextOnLink,
    closeLastBlock,
    selectToLink,
    blacklists,
    holdButton,
    gestures,
    customActions,
    setNewTabUrl,
    setNewTabRight,
    setNewTabLinkRight,
    setStroke,
    setStrokeWidth,
    setContextOnLink,
    setCloseLastBlock,
    setSelectToLink,
    addBlacklist,
    removeBlacklist,
    setHoldButton,
    restore,
    reset,
  } = useSettings();
  const [newTabUrlRadio, setNewTabUrlRadio] = useState(
    ['chrome://newtab/', 'homepage'].includes(newTabUrl) ? newTabUrl : 'custom',
  );
  const [newTabUrlCustom, setNewTabUrlCustom] = useState(
    ['chrome://newtab/', 'homepage'].includes(newTabUrl) ? '' : newTabUrl,
  );

  const handleNewTabUrlRadioChange = (value: string): void => {
    setNewTabUrlRadio(value);
    if (value === 'custom') {
      setNewTabUrl(newTabUrlCustom);
    } else {
      setNewTabUrl(value);
    }
  };
  const handleNewTabUrlCustomChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setNewTabUrlCustom(value);
    setNewTabUrl(value);
  };
  const handleExportClick = (): void => {
    // TODO
    const data = {
      version: chrome.runtime.getManifest().version,
      settings: {
        newTabUrl,
        newTabRight,
        newTabLinkRight,
        stroke,
        strokeWidth,
        contextOnLink,
        closeLastBlock,
        selectToLink,
        blacklists,
        holdButton,
        gestures,
        customActions,
      },
    };

    const json = JSON.stringify(data);
    const base64 = btoa(json);
    const blob = new Blob([base64], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Silky Gestures Settings.txt';
    anchor.style.display = 'none';
    document.body.append(anchor);

    try {
      anchor.click();
    } finally {
      anchor.remove();
      URL.revokeObjectURL(url);
    }
  };
  const handleImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const decoded = atob(text);
      const parsed = JSON.parse(decoded);

      // TODO
      console.log(parsed);
      restore(parsed.settings);

      notifications.show('Import Successful', {
        severity: 'success',
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error('Import Failed', error);
      notifications.show('Import Failed', {
        severity: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      <title>{title}</title>
      <List sx={{ width: '100%' }}>
        <ListItem>
          <ListItemText
            primary={i18n.t('settings_newTabUrl')}
            secondary={i18n.t('settings_newTabUrl_description')}
          />
        </ListItem>
        <ListItem sx={{ pl: 7 }}>
          <RadioGroup
            value={newTabUrlRadio}
            onChange={(_, value) => handleNewTabUrlRadioChange(value)}
          >
            <FormControlLabel value="chrome://newtab/" control={<Radio />} label="New Tab page" />
            <FormControlLabel value="homepage" control={<Radio />} label="Home page" />
            <FormControlLabel
              value="custom"
              control={<Radio />}
              label={
                <TextField
                  variant="standard"
                  value={newTabUrlCustom}
                  onClick={() => {
                    if (newTabUrlRadio !== 'custom') {
                      handleNewTabUrlRadioChange('custom');
                    }
                  }}
                  onChange={handleNewTabUrlCustomChange}
                  placeholder="Custom"
                  sx={{ width: 300 }}
                />
              }
            />
          </RadioGroup>
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText
            primary={i18n.t('settings_newTabRight')}
            secondary={i18n.t('settings_newTabRight_description')}
          />
          <Switch edge="end" checked={newTabRight} onChange={() => setNewTabRight(!newTabRight)} />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText
            primary={i18n.t('settings_newTabLinkRight')}
            secondary={i18n.t('settings_newTabLinkRight_description')}
          />
          <Switch
            edge="end"
            checked={newTabLinkRight}
            onChange={() => setNewTabLinkRight(!newTabLinkRight)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText
            primary="Trail Properties"
            secondary="Adjust the color and width of the line drawn"
          />
        </ListItem>
        <ListItem disablePadding sx={{ pl: 2 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
            <Gesture gesture="URU" width={100} height={100} lineWidth={strokeWidth} />
            <List disablePadding sx={{ flex: '1 1 auto' }}>
              <ListItem>
                <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
                  <ListItemText
                    primary={i18n.t('settings_stroke')}
                    secondary={i18n.t('settings_stroke_description')}
                  />
                  <MuiColorInput
                    value={stroke}
                    onChange={(color) => {
                      if (matchIsValidColor(color)) {
                        setStroke(color);
                      }
                    }}
                  />
                </Stack>
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
                  <ListItemText
                    primary={i18n.t('settings_strokeWidth')}
                    secondary={i18n.t('settings_strokeWidth_description')}
                  />
                  <Slider
                    value={strokeWidth}
                    valueLabelDisplay="auto"
                    min={1}
                    max={4}
                    sx={{ width: 300 }}
                    onChange={(_, value: number | number[]) =>
                      setStrokeWidth(Array.isArray(value) ? value[0] : value)
                    }
                  />
                </Stack>
              </ListItem>
            </List>
          </Stack>
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText
            primary={i18n.t('settings_contextOnLink')}
            secondary={i18n.t('settings_contextOnLink_description')}
          />
          <Switch
            edge="end"
            checked={contextOnLink}
            onChange={() => setContextOnLink(!contextOnLink)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText
            primary={i18n.t('settings_closeLastBlock')}
            secondary={i18n.t('settings_closeLastBlock_description')}
          />
          <Switch
            edge="end"
            checked={closeLastBlock}
            onChange={() => setCloseLastBlock(!closeLastBlock)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText
            primary={i18n.t('settings_selectToLink')}
            secondary={i18n.t('settings_selectToLink_description')}
          />
          <Switch
            edge="end"
            checked={selectToLink}
            onChange={() => setSelectToLink(!selectToLink)}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
            <ListItemText
              primary={i18n.t('settings_blacklist')}
              secondary={i18n.t('settings_blacklist_description')}
            />
            <Button
              variant="outlined"
              onClick={async () => {
                /* TODO */
                const blacklist = await dialogs.prompt(i18n.t('settings_blacklist'), {
                  okText: i18n.t('settings_button_add'),
                  cancelText: i18n.t('settings_button_cancel'),
                });
                if (blacklist) {
                  addBlacklist(blacklist);
                }
              }}
            >
              {i18n.t('settings_button_add')}
            </Button>
          </Stack>
        </ListItem>
        {blacklists.length > 0 && (
          <ListItem disablePadding sx={{ pl: 7 }}>
            <List disablePadding sx={{ width: '100%' }}>
              {blacklists.map((blacklist, index) => (
                <React.Fragment key={blacklist}>
                  {0 < index && <Divider component="li" />}
                  <ListItem>
                    <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
                      <ListItemText primary={blacklist} />
                      <IconButton onClick={() => removeBlacklist(blacklist)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </ListItem>
        )}
        <Divider component="li" />
        <ListItem>
          <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
            <ListItemText
              primary={i18n.t('settings_holdButton')}
              secondary={i18n.t('settings_holdButton_description')}
            />
            <Select
              value={holdButton}
              onChange={(event) => setHoldButton(Number(event.target.value))}
            >
              <MenuItem value={0}>{i18n.t('settings_button_left')}</MenuItem>
              <MenuItem value={1}>{i18n.t('settings_button_middle')}</MenuItem>
              <MenuItem value={2}>{i18n.t('settings_button_right')}</MenuItem>
            </Select>
          </Stack>
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
            <ListItemText
              primary={i18n.t('settings_reset')}
              secondary={i18n.t('settings_reset_description')}
            />
            <Button
              variant="outlined"
              onClick={async () => {
                const confirmed = await dialogs.confirm(i18n.t('settings_warning_reset'), {
                  okText: i18n.t('settings_button_reset'),
                  cancelText: i18n.t('settings_button_cancel'),
                });
                if (confirmed) {
                  reset();
                }
              }}
            >
              {i18n.t('settings_button_reset')}
            </Button>
          </Stack>
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
            <ListItemText
              primary={i18n.t('settings_import')}
              secondary={i18n.t('settings_import_description')}
            />
            <ButtonGroup sx={{ whiteSpace: 'nowrap' }}>
              <Button onClick={handleExportClick}>{i18n.t('settings_button_export')}</Button>
              <Button component="label">
                {i18n.t('settings_button_import')}
                <VisuallyHiddenInput type="file" onChange={handleImportChange} />
              </Button>
            </ButtonGroup>
          </Stack>
        </ListItem>
      </List>
    </>
  );
}

export default SettingsPage;
