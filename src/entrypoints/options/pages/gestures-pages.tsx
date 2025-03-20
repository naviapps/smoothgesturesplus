import { Grid } from '@mui/material';

function GesturesPagesPage() {
  const title = `${i18n.t('options_gestures')} / ${i18n.t('options_gestures_pages')} - ${i18n.t('name')}`;

  return (
    <>
      <title>{title}</title>
      <Grid container spacing={2}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Grid key={index} size={6}>
            grid
          </Grid>
        ))}
      </Grid>
      その他の使用可能なアクション
      <Grid container spacing={2}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Grid key={index} size={6}>
            grid
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function Drawingcanvas() {
  return (
    <div id="drawingcanvas">
      <div className="close">&times;</div>
      <div id="canvastitle">__MSG_options_addgesture_title__</div>
      <div id="canvasdescrip">
        <div>{i18n.t('options_addgesture_instruct_1')}</div>
        <ul>
          <li>__MSG_options_addgesture_instruct_2__</li>
          <li>__MSG_options_addgesture_instruct_3__</li>
          <li>{i18n.t('options_addgesture_instruct_4')}</li>
          <li>{i18n.t('options_addgesture_instruct_5')}</li>
        </ul>
      </div>
      <div id="nowwhat">
        <div id="gestureoverwrite" />
        <div className="buttonbox">
          <div id="tryagain" className="button gray">
            {i18n.t('options_button_tryagain')}
          </div>
          <div id="doaddgesture" className="button gray">
            {i18n.t('options_button_addgesture')}
          </div>
          <select id="chooseaction">
            <option>{i18n.t('options_button_addgesture')}</option>
          </select>
        </div>
        <div id="gesturedisplay" />
      </div>
    </div>
  );
}

export default GesturesPagesPage;
