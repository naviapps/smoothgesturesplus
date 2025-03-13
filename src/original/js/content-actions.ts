const findPrev = async () => {
  if (!message.selection) return call();
  window.find(message.selection.replace(/[\\"']/g, '\\$&'), false, true, true, false, true, true);
};

const findNext = async () => {
  if (!message.selection) return call();
  window.find(message.selection.replace(/[\\"']/g, '\\$&'), false, false, true, false, true, true);
};
