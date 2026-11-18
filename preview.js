const cards = [...document.querySelectorAll('.project-card')];
const frame = document.querySelector('#demo-frame');
const title = document.querySelector('#preview-title');
const external = document.querySelector('#open-demo');
const caseLink = document.querySelector('#read-case');
const compact = matchMedia('(max-width: 740px)');
let active = cards[0];

function select(card, focusPreview = false) {
  if (card !== active) {
    active = card;
    for (const item of cards) item.setAttribute('aria-pressed', String(item === card));
    const name = card.querySelector('strong').textContent;
    title.textContent = name + ' live demo';
    frame.title = name + ' live demo';
    frame.src = card.dataset.url;
    external.href = card.dataset.url;
    caseLink.href = '#' + card.dataset.project;
  }
  if (focusPreview) title.focus();
}

for (const card of cards) {
  card.addEventListener('click', () => select(card, compact.matches));
}
for (const button of document.querySelectorAll('.preview')) {
  const card = cards.find(item => item.dataset.project === button.closest('article').id);
  if (card) {
    button.hidden = false;
    button.addEventListener('click', () => select(card, true));
  }
}
