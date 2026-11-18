const dialog = document.querySelector('dialog');
const frame = dialog.querySelector('iframe');
const title = document.querySelector('#preview-title');
let trigger;

for (const button of document.querySelectorAll('.preview')) {
  button.hidden = false;
  button.addEventListener('click', () => {
    trigger = button;
    title.textContent = button.dataset.title;
    frame.title = button.dataset.title;
    frame.src = button.dataset.url;
    dialog.showModal();
  });
}

dialog.addEventListener('close', () => {
  frame.removeAttribute('src');
  trigger?.focus();
});