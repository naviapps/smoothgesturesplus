import { Switch } from '@mui/material';

function RightClickPage() {
  const title = `${i18n.t('options_rightClick')} - ${i18n.t('name')}`;

  return (
    <>
      <title>{title}</title>
      <div className="page">
        <div className="pagetitle">Extras</div>
        <div className="content">
          <p>
            The Smooth Gestures Extras is additional software that you can install on your computer
            to add new features and improve right-click compatibility.
          </p>
          <p>&nbsp;</p>
          <div id="extras" className="setting">
            <Switch />
            <div className="headtitle">{i18n.t('settings_extras')}</div>
            <p className="sub">{i18n.t('settings_extras_description')}</p>
          </div>
          <div id="note_extras_installed" className="note green">
            <div className="title">Extras are installed</div>
            <div className="descrip">You have the latest version</div>
          </div>
          <div id="note_extras_update" className="note yellow">
            <div className="title">
              Extras are installed, but you have an older version. Restart Chrome after update.
            </div>
            <div className="descrip">
              <div id="updateplugin" className="button">
                Update the Extras
              </div>
            </div>
          </div>
          <div id="note_extras_notinstalled" className="note red">
            <div className="title">Extras are not installed</div>
            <div className="descrip">
              <div id="installplugin" className="button">
                Enable/Install the Extras
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RightClickPage;
