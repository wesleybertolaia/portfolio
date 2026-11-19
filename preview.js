// Keep bookmarks from the former embedded preview on the portfolio gallery.
const current = new URL(location.href);
if (current.searchParams.has('demo') || current.hash === '#demos') {
  current.searchParams.delete('demo');
  current.hash = '';
  history.replaceState(null, '', current);
} else if (['#work', '#carepath', '#dentaldesk', '#shiftledger'].includes(current.hash)) {
  current.hash = '#selected-work';
  history.replaceState(null, '', current);
}
