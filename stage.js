const gallery = document.querySelector('.work');
const projects = [...gallery.querySelectorAll('.work-project')];
const controls = document.createElement('div');
controls.className = 'stage-controls';
const stage = document.createElement('div');
stage.className = 'demo-stage';
const dog = document.createElement('button');
const holdingLabel = window.siteLocale.t('Hold to pull the next project');
dog.type = 'button';
dog.className = 'stage-dog';
dog.setAttribute('aria-label', holdingLabel);
dog.innerHTML = '<i aria-hidden="true"></i><b aria-hidden="true"></b>';
const hint = document.createElement('span');
hint.className = 'dog-hint';
hint.textContent = holdingLabel;
gallery.append(controls, stage);
stage.append(...projects, dog, hint);

let active = 0;
let animations = [];
const buttons = projects.map((project, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = project.querySelector('h3').textContent;
  button.setAttribute('aria-pressed', String(index === 0));
  button.addEventListener('click', () => select(index));
  controls.append(button);
  project.hidden = index !== 0;
  return button;
});

function select(index, animateScreen = true) {
  cancelPull();
  if (index === active) return;
  for (const animation of animations) animation.cancel();
  const previous = projects[active];
  const next = projects[index];
  active = index;
  const animate = animateScreen && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  buttons.forEach((button, position) => button.setAttribute('aria-pressed', String(index === position)));
  for (const project of projects) {
    project.hidden = project !== next && (!animate || project !== previous);
    project.inert = project !== next;
    project.classList.toggle('screen-leaving', animate && project === previous);
  }
  if (!animate) return;

  const outgoing = previous.animate([
    { transform: 'translateX(0)', offset: .34 },
    { transform: 'translateX(-110%) rotate(-5deg)', opacity: 0 }
  ], { duration: 720, easing: 'ease-in-out', fill: 'both' });
  const incoming = next.animate([
    { transform: 'translateX(23%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ], { duration: 470, delay: 280, easing: 'ease-out', fill: 'both' });
  animations = [outgoing, incoming];
  incoming.onfinish = () => {
    previous.hidden = true;
    previous.classList.remove('screen-leaving');
    for (const animation of animations) animation.cancel();
    animations = [];
  };
}

let pull;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function cancelPull() {
  if (!pull) return;
  clearTimeout(pull.timer);
  pull.screen?.cancel();
  pull.dog?.cancel();
  pull = undefined;
  stage.classList.remove('is-pulling');
}

function startPull() {
  if (pull) return;
  for (const animation of animations) animation.finish();
  stage.classList.add('is-pulling');
  const duration = 850;
  pull = {
    timer: setTimeout(() => select((active + 1) % projects.length, false), duration)
  };
  if (reducedMotion.matches) return;
  const options = { duration, easing: 'ease-in', fill: 'forwards' };
  pull.screen = projects[active].animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-110%) rotate(-4deg)' }
  ], options);
  pull.dog = dog.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-26px) rotate(-14deg)' }
  ], options);
}

dog.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  dog.setPointerCapture(event.pointerId);
  startPull();
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) {
  dog.addEventListener(event, cancelPull);
}
const isHoldKey = event => event.key === ' ' || event.key === 'Enter';
dog.addEventListener('keydown', event => {
  if (!isHoldKey(event)) return;
  event.preventDefault();
  if (!event.repeat) startPull();
});
dog.addEventListener('keyup', event => {
  if (!isHoldKey(event)) return;
  event.preventDefault();
  cancelPull();
});
dog.addEventListener('click', event => {
  if (event.detail === 0) select((active + 1) % projects.length);
});
