const cards = [...document.querySelectorAll('.project-card')];
const frame = document.querySelector('#demo-frame');
const title = document.querySelector('#preview-title');
const external = document.querySelector('#open-demo');
const caseLink = document.querySelector('#read-case');
const task = document.querySelector('#demo-task');
const tasks = {
  carepath: 'Choose a question, then follow the guided path to the intake.',
  dentaldesk: 'Pick a visit and a sample time, then review the request.',
  shiftledger: 'Load example hours, check the net time, and verify the saved entry in Manager view.',
};
const compact = matchMedia('(max-width: 740px)');
let active = cards[0];
const fitOnDesktop = matchMedia('(min-width: 1050px) and (min-height: 700px)');
let contentObserver;
let observedBody;
let pendingFit;

function resizeDemo() {
  pendingFit = undefined;
  const body = observedBody;
  if (!body) return;

  const heightAt = (zoom) => {
    body.style.zoom = zoom;
    return Math.ceil(body.getBoundingClientRect().height) + 1;
  };

  let height = heightAt(1);
  if (fitOnDesktop.matches) {
    const top = frame.getBoundingClientRect().top + window.scrollY;
    const available = Math.floor(innerHeight - top - 12);
    if (height > available) {
      let low = .6;
      let high = 1;
      for (let i = 0; i < 8; i += 1) {
        const mid = (low + high) / 2;
        if (heightAt(mid) <= available) low = mid;
        else high = mid;
      }
      height = heightAt(low);
    }
  }
  if (height > 1) frame.style.height = height + 'px';
}

function scheduleFit() {
  if (pendingFit === undefined) pendingFit = requestAnimationFrame(resizeDemo);
}

function watchDemo() {
  contentObserver?.disconnect();
  const doc = frame.contentDocument;
  observedBody = doc?.body;
  if (!observedBody) return;
  contentObserver = new MutationObserver(scheduleFit);
  contentObserver.observe(doc.body, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ['hidden', 'class', 'open'],
  });
  doc.addEventListener('load', scheduleFit, true);
  if (doc.URL !== 'about:blank' && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    frame.animate([{opacity: .68}, {opacity: 1}], { duration: 230, easing: 'ease-out' });
  }
  scheduleFit();
}

window.addEventListener('resize', scheduleFit);
frame.addEventListener('load', watchDemo);
if (frame.contentDocument?.readyState === 'complete') watchDemo();

function select(card, focusPreview = false) {
  if (card !== active) {
    active = card;
    for (const item of cards) item.setAttribute('aria-pressed', String(item === card));
    const name = card.querySelector('strong').textContent;
    task.textContent = tasks[card.dataset.project];
    title.textContent = name + ' live demo';
    frame.title = name + ' live demo';
    contentObserver?.disconnect();
    observedBody = undefined;
    frame.src = card.dataset.url;
    external.href = card.dataset.url;
    caseLink.href = './case-studies.html#' + card.dataset.project;
  }
  if (focusPreview) title.focus();
}

for (const card of cards) {
  card.addEventListener('click', () => select(card, compact.matches));
}
const legacyHash = location.hash.slice(1);
if (legacyHash === 'work' || cards.some(card => card.dataset.project === legacyHash)) {
  location.replace('./case-studies.html' + (legacyHash === 'work' ? '' : '#' + legacyHash));
} else {
  const wanted = new URLSearchParams(location.search).get('demo');
  const requested = cards.find(card => card.dataset.project === wanted);
  if (requested) select(requested);
}
