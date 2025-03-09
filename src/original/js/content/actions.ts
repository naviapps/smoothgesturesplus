// TODO
const findPrev = async () => {
  if (!message.selection) return call();
  O(
    id,
    `window.find('${message.selection.replace(
      /[\\"']/g,
      '\\$&',
    )}', false, true, true, false, true, true);`,
    call,
  );
};

// TODO
const findNext = async () => {
  if (!message.selection) return call();
  O(
    id,
    `window.find('${message.selection.replace(
      /[\\"']/g,
      '\\$&',
    )}', false, false, true, false, true, true);`,
    call,
  );
};
