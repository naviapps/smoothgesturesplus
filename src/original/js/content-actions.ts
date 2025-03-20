const findPrevious = async () => {
  if (!message.selection) return call();
  globalThis.find(message.selection.replaceAll(/[\\"']/g, String.raw`\$&`), false, true, true, false, true, true);
};

const findNext = async () => {
  if (!message.selection) return call();
  globalThis.find(message.selection.replaceAll(/[\\"']/g, String.raw`\$&`), false, false, true, false, true, true);
};
