const langs = {
  am: 'Amharic',
  ar: 'Arabic',
  bg: 'Bulgarian',
  bn: 'Bengali',
  ca: 'Catalan',
  cs: 'Czech',
  da: 'Danish',
  de: 'German',
  el: 'Modern Greek',
  en: 'English',
  en_GB: 'English: British',
  es: 'Spanish',
  et: 'Estonian',
  fi: 'Finnish',
  fr: 'French',
  gu: 'Gujarati',
  he: 'Hebrew',
  hi: 'Hindi',
  hr: 'Croatian',
  hu: 'Hungarian',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  kn: 'Kannada',
  ko: 'Korean',
  lt: 'Lithuanian',
  lv: 'Latvian',
  ml: 'Malayalam',
  mr: 'Marathi',
  nb: 'Norwegian',
  nl: 'Dutch',
  or: 'Oriya',
  pl: 'Polish',
  pt: 'Portuguese',
  pt_BR: 'Portuguese: Brazil',
  ro: 'Romanian',
  ru: 'Russian',
  sk: 'Slovak',
  sl: 'Slovenian',
  sr: 'Serbian',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  vi: 'Vietnamese',
  zh: 'Chinese',
  zh_TW: 'Chinese: Traditional',
};
let accept = [];
chrome.i18n.getAcceptLanguages((ls) => {
  if (ls.indexOf(window.navigator.language.replace('-', '_')) !== -1) {
    ls.splice(ls.indexOf(window.navigator.language.replace('-', '_')), 1);
  }
  ls.unshift(window.navigator.language.replace('-', '_'));
  for (let i = 0; i < ls.length; i += 1) {
    if (!langs[ls[i]]) {
      ls.splice(i, 1);
      i -= 1;
    }
  }
  accept = ls;
  language = accept[0];

  $('body').append(
    $('<div>')
      .attr('id', 'instruct')
      .append(
        $('<p>').text(
          'Choose the language to translate to from the dropdown box. Type translations for some or all phrases, then click Submit.',
        ),
      )
      .append(
        $('<p>').text(
          'The gray words are a description of the phrase. The bold phrases are the English to be translated. Type the translation in the textbox.',
        ),
      )
      .append(
        $('<p>').text(
          'It is not neccessary to fill out all of the empty boxes, only the ones that need to be translated. You can edit any already existing translations to make changes.',
        ),
      ),
  );

  const acceptgroup = $('<optgroup>').attr('label', 'Detected Languages');
  const othergroup = $('<optgroup>').attr('label', 'Other Languages');
  for (let i = 0; i < accept.length; i += 1) {
    acceptgroup.append($('<option>').val(accept[i]).text(langs[accept[i]]));
  }
  for (l in langs) {
    if (accept.indexOf(l) === -1) {
      othergroup.append($('<option>').val(l).text(langs[l]));
    }
  }
  $('body').append(
    $('<div>')
      .attr('id', 'languages')
      .append(
        $('<div>')
          .text('Translate to: ')
          .append(
            $('<select>')
              .append(acceptgroup)
              .append(othergroup)
              .change(() => {
                language = $(this).val();
                loadpage();
              }),
          ),
      ),
  );

  $('body').append(
    $('<div>')
      .attr('id', 'generatediv')
      .append(
        $('<input>')
          .attr('type', 'button')
          .val('Submit >')
          .click(() => {
            const d = new Date();
            const update =
              d.getUTCFullYear().toString() +
              (d.getUTCMonth() + 1 < 10 ? '0' : '') +
              (d.getUTCMonth() + 1).toString() +
              (d.getUTCDate() < 10 ? '0' : '') +
              d.getUTCDate().toString();
            const messages = {};
            for (id in src) {
              const e = $(`#edit-${id}`).val();
              const r = res[id] ? res[id].message : null;
              if (!e || e === '' || e === r) {
                return;
              }
              const trans = JSON.parse(JSON.stringify(src[id]));
              trans.message = e;
              trans.update = update;
              messages[id] = trans;
            }
            if (JSON.stringify(messages) === '{}') {
              alert('No changes submitted.');
              return;
            }
            $('#generatediv input').val('Uploading...');
            $.ajax({
              url: 'http://fujan.name/smoothgestures/translate.php',
              type: 'post',
              data: {
                key: 'smooth',
                lang: language,
                tran: JSON.stringify(messages),
              },
              success: (data) => {
                $('#generatediv input').val('Submit >');
                if (data === 'success') {
                  setTimeout(() => {
                    alert(
                      'Translation Sent. Thanks!\n\nFeel free to email smoothgestures@fujan.name to notify the developer that you have submitted a translation.',
                    );
                  }, 0);
                } else {
                  setTimeout(() => {
                    alert('Error Sending Translation');
                  }, 0);
                }
              },
              error: () => {
                $('#generatediv input').val('Submit >');
                setTimeout(() => {
                  alert('Error Sending Translation');
                }, 0);
              },
            });
          }),
      ),
  );

  $.get(chrome.runtime.getURL('_locales/en/messages.json'), null, (data) => {
    src = JSON.parse(data);
    loadpage();
  });
});

var src = null;
var res = null;
var language = 'zh';

let words = null;
let tree = null;

document.title = 'Smooth Gestures: Translate';
$('body').append(
  $('<h1 id="translatetitle"><img src="/img/icon48.png"/> Smooth Gestures: Translate</h1>'),
);

const loadpage = () => {
  $.get(chrome.runtime.getURL(`_locales/${language}/messages.json`), null, (data) => {
    if (data && data !== '') {
      res = JSON.parse(data);
    } else {
      res = {};
    }
    formpage();
  });
};

const formpage = () => {
  const r = JSON.parse(JSON.stringify(res));

  words = [];
  for (id in src) {
    if (id !== '_') {
      words.push({
        id,
        src: src[id],
        res: r[id] && r[id].update && r[id].update > src[id].update ? r[id] : undefined,
      });
    }
    delete r[id];
  }
  for (id in r) {
    words.push({ id, src: undefined, res: r[id] });
  }

  tree = { empty: [], complete: [], old: [] };
  for (let i = 0; i < words.length; i += 1) {
    if (!words[i].res) {
      tree.empty.push(words[i]);
    } else if (words[i].src) {
      tree.complete.push(words[i]);
    } else {
      tree.old.push(words[i]);
    }
  }

  for (s in tree) {
    const cat = {};
    for (let i = 0; i < tree[s].length; i += 1) {
      const c = tree[s][i].src ? tree[s][i].src.category : tree[s][i].res.category;
      if (!cat[c]) {
        cat[c] = [];
      }
      cat[c].push(tree[s][i]);
    }
    tree[s] = cat;
  }

  buildpage();
};

const buildpage = () => {
  const table = {};
  for (c in tree.empty) {
    table[c] = $('<div>')
      .attr('class', 'translatetable')
      .append($('<div>').attr('class', 'tabletitle').text(c));
    for (let i = 0; i < tree.empty[c].length; i += 1) {
      table[c].append(buildword(tree.empty[c][i]));
    }
  }
  for (c in tree.complete) {
    const t = $('<div>');
    for (i = 0; i < tree.complete[c].length; i += 1) {
      t.append(buildword(tree.complete[c][i]));
    }
    if (!table[c]) {
      table[c] = $('<div>')
        .attr('class', 'translatetable')
        .append($('<div>').attr('class', 'tabletitle').text(c));
    }
    table[c].append(completedwords(t));
  }
  $('#translateroot').remove();
  const root = $('<div>').attr('id', 'translateroot');
  const cats = [];
  for (c in table) {
    cats.push(c);
  }
  cats.sort();
  for (let i = 0; i < cats.length; i += 1) {
    root.append(table[cats[i]]);
  }
  $('body').append(root);
};

const completedwords = (rows) => {
  const label = Math.random().toString().substr(2);
  return $('<div>')
    .attr('class', 'rowgroup')
    .append(
      $('<div>')
        .attr('class', 'grouptitle')
        .text(`Phrases with translations (${$('.wordrow', rows).size()})`)
        .append(
          $('<a>')
            .attr('href', '#')
            .text('show')
            .click(() => {
              if ($(this).text() === 'hide') {
                $(this).text('show');
                $(`#${label}group`).animate({ height: 'hide', opacity: 0 }, 200);
              } else {
                $(this).text('hide');
                $(`#${label}group`).animate({ height: 'show', opacity: 1 }, 200);
              }
              return false;
            }),
        ),
    )
    .append(rows.attr('id', `${label}group`).attr('class', 'grouprows').css({ display: 'none' }));
};

const buildword = (word) => {
  if (!word.src) {
    return `<div>${word.id}`;
  }
  return $('<div>')
    .attr('class', 'wordrow')
    .append(
      $('<div>')
        .attr('class', 'descrip')
        .text(`${word.src.description} `)
        .append($('<span>').text(`[ ${word.id} ]`)),
    )
    .append($('<div>').attr('class', 'message').html(word.src.message.replace(/\n/g, '<br>\n')))
    .append(
      $('<textarea>')
        .attr('id', `edit-${word.id}`)
        .text(word.res ? word.res.message : res[word.id] ? res[word.id].message : ''),
    );
};
