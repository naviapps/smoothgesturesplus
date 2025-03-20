function Sidebar() {
  return (
    <div id="sidebar">
      <div id="title">
        <div className="sglogo">
          <img src="/img/icon48.png" />
          <span className="sgtitle">
            Smooth
            <br />
            Gestures<span className="sgplus">plus</span>
          </span>
        </div>
      </div>
      <div nav="about" className="navbutton">
        About
      </div>
      <div id="navactions" className="navsection">
        {i18n.t('options_contents_actions')}
      </div>
      <div nav="settings" className="navbutton">
        {i18n.t('options_contents_settings')}
      </div>
      <div nav="extras" className="navbutton">
        Extras
      </div>
      <div nav="changelog" className="navbutton">
        Changelog
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div page="about" className="page">
      <div className="pagetitle">
        <div className="button gray addgesture" />
        About
      </div>
      <div className="content">
        <div id="note_updated" className="note green">
          <p />
          <p>
            <a href="options.html#changelog">View Changelog</a>
          </p>
          <div className="clear" />
        </div>
        <div id="trialperiod" className="section">
          <p>
            You must activate{' '}
            <span className="sgtitle">
              {i18n.t('name')}
              <span className="sgplus">plus</span>
            </span>{' '}
            to continue using it after the two-week trial period.
          </p>
          <ul className="sub">
            <li id="expirein" />
          </ul>
          <div className="upgradebutton" />
          <div className="clear" />
        </div>
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
  );
}

function ActionsPage() {
  return <div pagesection="actions" className="pagesection" />;
}

function SettingsPage() {
  return (
    <div page="settings" className="page">
      <div className="pagetitle">{i18n.t('options_contents_settings')}</div>
      <div className="content">
        <div id="newtab_url" className="setting">
          <select>
            <option value="chrome://newtab/">New Tab page</option>
            <option value="homepage">Home page</option>
            <option value="custom">Custom</option>
          </select>
          <div className="button gray">{i18n.t('setting_button_update')}</div>
          <input type="text" />
          <div className="headtitle">{i18n.t('setting_newtab_url')}</div>
          <p className="sub">{i18n.t('setting_newtab_url_descrip')}</p>
        </div>
        <div id="newtab_right" className="setting">
          <select>
            <option value="1">{i18n.t('setting_button_on')}</option>
            <option value="0">{i18n.t('setting_button_off')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_newtab_right')}</div>
          <p className="sub">{i18n.t('setting_newtab_right_descrip')}</p>
        </div>
        <div id="newtab_linkright" className="setting">
          <select>
            <option value="1">{i18n.t('setting_button_on')}</option>
            <option value="0">{i18n.t('setting_button_off')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_newtab_linkright')}</div>
          <p className="sub">{i18n.t('setting_newtab_linkright_descrip')}</p>
        </div>
        <div id="trail_draw" className="setting">
          <select>
            <option value="1">{i18n.t('setting_button_on')}</option>
            <option value="0">{i18n.t('setting_button_off')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_trail_draw')}</div>
          <p className="sub">{i18n.t('setting_trail_draw_descrip')}</p>
        </div>
        <div id="trail_properties" className="setting">
          <div className="headtitle">Trail Properties</div>
          <div id="trail_sliders">
            <div id="trail_color_r">
              <input type="range" min="0" max="255" />
            </div>
            <div id="trail_color_g">
              <input type="range" min="0" max="255" />
            </div>
            <div id="trail_color_b">
              <input type="range" min="0" max="255" />
            </div>
            <div id="trail_color_a">
              <input type="range" min="0" max="1" step=".01" />
            </div>
            <div id="trail_width">
              <input type="range" min=".2" max="4" step=".2" />
            </div>
          </div>
          <div id="trail_example" />
          <p className="sub">Adjust the color and width of the line drawn</p>
          <div id="trail_example" />
          <div className="clear" />
        </div>
        <div id="trail_style" className="setting">
          <select>
            <option value="default">Default</option>
            <option value="legacy">Legacy</option>
          </select>
          <div className="headtitle">Trail Style</div>
          <p className="sub">Draw the trailing line with the new or the legacy style.</p>
        </div>
        <div id="force_context" className="setting">
          <select>
            <option value="1">{i18n.t('setting_button_on')}</option>
            <option value="0">{i18n.t('setting_button_off')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_force_context')}</div>
          <p className="sub">{i18n.t('setting_force_context_descrip')}</p>
        </div>
        <div id="closelastblock" className="setting">
          <select>
            <option value="1">{i18n.t('setting_button_on')}</option>
            <option value="0">{i18n.t('setting_button_off')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_closelastblock')}</div>
          <p className="sub">{i18n.t('setting_closelastblock_descrip')}</p>
        </div>
        <div id="selecttolink" className="setting">
          <select>
            <option value="1">{i18n.t('setting_button_on')}</option>
            <option value="0">{i18n.t('setting_button_off')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_selecttolink')}</div>
          <p className="sub">{i18n.t('setting_selecttolink_descrip')}</p>
        </div>
        <div id="blacklist" className="setting">
          <div className="button gray">{i18n.t('setting_button_update')}</div>
          <div className="headtitle">{i18n.t('setting_blacklist')}</div>
          <textarea />
          <p className="sub">{i18n.t('setting_blacklist_descrip')}</p>
          <div className="clear" />
        </div>
        <div id="hidepageaction" className="setting">
          <select>
            <option value="1">{i18n.t('setting_button_on')}</option>
            <option value="0">{i18n.t('setting_button_off')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_hidepageaction')}</div>
          <p className="sub">{i18n.t('setting_hidepageaction_descrip')}</p>
        </div>
        <div id="hold_button" className="setting">
          <select>
            <option value="-1">{i18n.t('setting_disabled')}</option>
            <option value="0">{i18n.t('setting_button_left')}</option>
            <option value="1">{i18n.t('setting_button_middle')}</option>
            <option value="2">{i18n.t('setting_button_right')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_hold_button')}</div>
          <p className="sub">{i18n.t('setting_hold_button_descrip')}</p>
        </div>
        <div id="reset" className="setting">
          <div className="button gray">{i18n.t('setting_button_reset')}</div>
          <div className="headtitle">{i18n.t('setting_reset')}</div>
          <p className="sub">{i18n.t('setting_reset_descrip')}</p>
        </div>
        <div id="import" className="setting">
          <div id="importbutton" className="button gray filespoof">
            <input type="file" />
            {i18n.t('setting_button_import')}
          </div>
          <div id="exportbutton" className="button gray">
            {i18n.t('setting_button_export')}
          </div>
          <div className="headtitle">{i18n.t('setting_import')}</div>
          <p className="sub">{i18n.t('setting_import_descrip')}</p>
        </div>
      </div>
    </div>
  );
}

function ExtrasPage() {
  return (
    <div page="extras" className="page">
      <div className="pagetitle">Extras</div>
      <div className="content">
        <p>
          The Smooth Gestures Extras is additional software that you can install on your computer to add new features
          and improve right-click compatibility.
        </p>
        <p>&nbsp;</p>
        <div id="extras" className="setting">
          <select>
            <option value="1">{i18n.t('setting_button_on')}</option>
            <option value="0">{i18n.t('setting_button_off')}</option>
          </select>
          <div className="headtitle">{i18n.t('setting_extras')}</div>
          <p className="sub">{i18n.t('setting_extras_descrip')}</p>
        </div>
        <div id="note_extras_installed" className="note green">
          <div className="title">Extras are installed</div>
          <div className="descrip">You have the latest version</div>
        </div>
        <div id="note_extras_update" className="note yellow">
          <div className="title">Extras are installed, but you have an older version. Restart Chrome after update.</div>
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

function ChangelogPage() {
  return (
    <div page="changelog" className="page">
      <div className="pagetitle">Changelog</div>
      <div className="content">
        <div className="note_remindrate note green">
          <p>
            __MSG_options_note_remindrate
            {/* {<span class="sgtitle">__MSG_name__<span class="sgplus">plus</span></span>||<a href="https://chrome.google.com/webstore/detail/__MSG_@@extension_id__">__MSG_options_note_remindrate_link__</a>} */}
            __
          </p>
          <div className="clear" />
        </div>
        <div id="currentversion" />
        <div className="changeentry">
          <ul className="descrip">
            <li>Fixed scrolling</li>
          </ul>
        </div>
        <div id="noplus">
          <div className="upgradebutton" />
        </div>
        <div className="changeentry">
          <div className="version">2.6</div>
          <ul className="descrip">
            <li>Fixed blacklist</li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">2.5</div>
          <ul className="descrip">
            <li>Fixed some context menu bugs</li>
            <li>Improve page action handling</li>
            <li>Updated the Extras for Mac</li>
            <li>Mac and Linux users: use the new Extras section on the page to view the Extras status</li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">2.1</div>
          <ul className="descrip">
            <li>Added an action to copy a link</li>
            <li>Added actions to find selected text on the page (try setting it to scroll up/down!)</li>
            <li>Fixed a zoom w/ context menu bug</li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">2.0</div>
          <ul className="descrip">
            <li>Fixed a variety of bugs: Key shortcuts, Context menu, Wheel gestures</li>
            <li>Improved stability</li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">1.2</div>
          <ul className="descrip">
            <li>Free licenses extended to 2 weeks (renewable)</li>
            <li>Fixed: "Close Other Tabs" with pinned tabs</li>
            <li>Setting for old trailing line style</li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">1.1</div>
          <ul className="descrip">
            <li>Run on blank pages and frames</li>
            <li>Fixed: a pointer shifting bug</li>
            <li>Improved ChromeOS support</li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">1.0</div>
          <ul className="descrip">
            <li>bugfixes</li>
            <li>
              <strong>Stable release!</strong>
            </li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">0.12</div>
          <ul className="descrip">
            <li>New Look, updated trail design</li>
            <li>Custom Actions</li>
            <li>Fullscreen/Maximize compatibility</li>
            <li>bugfixes</li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">0.11</div>
          <ul className="descrip">
            <li>
              New action: <em>Save Image</em>
            </li>
            <li>
              New actions: <em>Tab Screenshot</em> and <em>Full Tab Screenshot</em>
            </li>
            <li>
              New actions: <em>Fullscreen</em>, <em>Maximize</em>, and <em>Minimize Window</em>
            </li>
            <li>Improved: Duplicate Tab</li>
            <li>Fixed: Undo Closed Tab and Zoom on Page</li>
            <li>Improved Extras support</li>
          </ul>
        </div>
        <div className="changeentry">
          <div className="version">0.9</div>
          <ul className="descrip">
            <li>Future-proofed Extras support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
