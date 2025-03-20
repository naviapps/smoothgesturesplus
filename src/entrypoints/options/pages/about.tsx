function AboutPage() {
  const title = `${i18n.t('options_about')} - ${i18n.t('name')}`;

  return (
    <>
      <title>{title}</title>
      <div className="page">
        <div className="pagetitle">
          <div className="button gray addgesture" />
          About
        </div>
        <div className="content">
          <div className="note_remindrate note green">
            <p>
              __MSG_options_note_remindrate
              {/* {<span class="sgtitle">__MSG_name__<span class="sgplus">plus</span></span>||<a href="https://chrome.google.com/webstore/detail/__MSG_@@extension_id__">__MSG_options_note_remindrate_link__</a>} */}
              __
            </p>
            <div className="clear" />
          </div>
          <div id="welcome" className="section">
            <p>
              __MSG_options_welcome_0
              {/* {<span class="sgtitle">__MSG_name__<span class="sgplus">plus</span></span>} */}__
            </p>
            <ul>
              <li>{i18n.t('options_welcome_1')}</li>
              <li>{i18n.t('options_welcome_3')}</li>
            </ul>
            <div className="clear" />
          </div>
          <div id="note_print" className="note green">
            <div className="close">&times;</div>
            <div className="button">{i18n.t('options_note_print_button')}</div>
            <p>{i18n.t('options_note_print')}</p>
            <div className="clear" />
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
