const gallery = document.querySelector('.work');
const projects = [...gallery.querySelectorAll('.work-project')];
const controls = document.createElement('div');
controls.className = 'stage-controls';
const stage = document.createElement('div');
stage.className = 'demo-stage';
const dog = document.createElement('div');
dog.className = 'stage-dog';
dog.setAttribute('aria-hidden', 'true');
dog.innerHTML = '<i></i><b></b>';
gallery.append(controls, stage);
stage.append(...projects, dog);

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

function select(index) {
  if (index === active) return;
  for (const animation of animations) animation.cancel();
  const previous = projects[active];
  const next = projects[index];
  active = index;
  const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  const tug = dog.animate([
    { transform: 'translateY(20px)', opacity: 0 },
    { transform: 'translate(36px, -24px)', opacity: 1, offset: .34 },
    { transform: 'translate(-30px, -22px)', opacity: 1, offset: .72 },
    { transform: 'translate(-30px, 18px)', opacity: 0 }
  ], { duration: 750, easing: 'ease-in-out' });

  animations = [outgoing, incoming, tug];
  incoming.onfinish = () => {
    previous.hidden = true;
    previous.classList.remove('screen-leaving');
    for (const animation of animations) animation.cancel();
    animations = [];
  };
}
