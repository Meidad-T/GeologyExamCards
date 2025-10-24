// Load images.json and wire up card flip + navigation
const cardEl = document.getElementById('card');
const cardInner = document.getElementById('card-inner');
const imgEl = document.getElementById('card-image');
const backEl = document.getElementById('card-answer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const markBtn = document.getElementById('markBtn');
const completeBtn = document.getElementById('completeBtn');
const reviewBadge = document.getElementById('reviewBadge');
const positionEl = document.getElementById('position');

// Sidebar elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const closeSidebar = document.getElementById('closeSidebar');
const cardListEl = document.getElementById('cardList');
const sidebarHandle = document.getElementById('sidebarHandle');

let cards = [];
let index = 0;
let reviewSet = new Set(); // store file paths marked for review
let completeSet = new Set();

async function loadCards(){
  try{
    const res = await fetch('images.json');
    if(!res.ok) throw new Error('Failed to load images.json');
    cards = await res.json();
  }catch(err){
    console.error(err);
    cards = [];
  }
  if(!cards.length){
    imgEl.alt = '';
    backEl.textContent = 'No images found in minerals/';
    positionEl.textContent = '0 / 0';
    return;
  }
  // Preload images
  for(const c of cards){
    const i = new Image();
    i.src = c.file;
  }
  loadMarks();
  renderList();
  showCard(0);
}

function showCard(i){
  if(!cards.length) return;
  index = (i + cards.length) % cards.length;
  const current = cards[index];
  imgEl.src = current.file;
  imgEl.alt = current.name;
  backEl.textContent = current.name;
  positionEl.textContent = `${index+1} / ${cards.length}`;
  // ensure card shows front (not flipped) when changing
  cardInner.classList.remove('flipped');
  updateReviewUI(current.file);
  renderList();
}

function nextCard(){ showCard(index+1); }
function prevCard(){ showCard(index-1); }

// Flip on click
cardEl.addEventListener('click', (e)=>{
  // allow clicking anywhere on card to flip
  cardInner.classList.toggle('flipped');
});

prevBtn.addEventListener('click', (e)=>{ e.stopPropagation(); prevCard(); });
nextBtn.addEventListener('click', (e)=>{ e.stopPropagation(); nextCard(); });

// mark for review
markBtn.addEventListener('click', (e)=>{
  e.stopPropagation();
  toggleMarkForCurrent();
});
completeBtn.addEventListener('click', (e)=>{
  e.stopPropagation();
  toggleCompleteForCurrent();
});

// keyboard support
document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight') { nextCard(); }
  else if(e.key === 'ArrowLeft') { prevCard(); }
  else if(e.key === ' ' || e.key === 'Enter'){
    // if focus is on the card or body, flip
    const active = document.activeElement;
    if(active === cardEl || active === document.body) {
      e.preventDefault();
      cardInner.classList.toggle('flipped');
    }
  }
});

// Make card focusable for keyboard users
cardEl.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cardInner.classList.toggle('flipped'); }
});

// Review mark helpers
function loadMarks(){
  try{
    const raw = localStorage.getItem('reviewMarks');
    const arr = raw ? JSON.parse(raw) : [];
    reviewSet = new Set(arr);
  }catch(err){ reviewSet = new Set(); }
}

function saveMarks(){
  try{ localStorage.setItem('reviewMarks', JSON.stringify(Array.from(reviewSet))); }
  catch(err){ console.warn('Could not save marks', err); }
}

function updateReviewUI(file){
  const marked = reviewSet.has(file);
  if(marked){ reviewBadge.classList.add('visible'); markBtn.setAttribute('aria-pressed','true'); }
  else{ reviewBadge.classList.remove('visible'); markBtn.setAttribute('aria-pressed','false'); }
}

function toggleMarkForCurrent(){
  if(!cards.length) return;
  const file = cards[index].file;
  if(reviewSet.has(file)) reviewSet.delete(file);
  else reviewSet.add(file);
  saveMarks();
  updateReviewUI(file);
  renderList();
}

// Completed marks
function loadCompleted(){
  try{
    const raw = localStorage.getItem('completedMarks');
    const arr = raw ? JSON.parse(raw) : [];
    completeSet = new Set(arr);
  }catch(err){ completeSet = new Set(); }
}

function saveCompleted(){
  try{ localStorage.setItem('completedMarks', JSON.stringify(Array.from(completeSet))); }
  catch(err){ console.warn('Could not save completed marks', err); }
}

function updateCompleteUI(file){
  const done = completeSet.has(file);
  if(done){ completeBtn.setAttribute('aria-pressed','true'); completeBtn.textContent = 'Completed'; }
  else{ completeBtn.setAttribute('aria-pressed','false'); completeBtn.textContent = 'Mark Completed'; }
}

function toggleCompleteForCurrent(){
  if(!cards.length) return;
  const file = cards[index].file;
  if(completeSet.has(file)) completeSet.delete(file);
  else {
    // marking completed clears review for clarity
    reviewSet.delete(file);
    completeSet.add(file);
  }
  saveCompleted();
  saveMarks();
  updateCompleteUI(file);
  updateReviewUI(file);
  renderList();
}

// Sidebar handling and list rendering
function renderList(){
  if(!cardListEl) return;
  cardListEl.innerHTML = '';
  cards.forEach((c, idx) => {
    const li = document.createElement('li');
    li.className = 'card-row';
    if(idx === index) li.classList.add('active');
    li.tabIndex = 0;

    const label = document.createElement('div');
    label.className = 'label';
    // Only show name when completed to avoid giving away answers
    label.textContent = `Card ${idx+1}`;
    if(completeSet.has(c.file)){
      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      // use colon and space separator as requested
      nameSpan.textContent = `: ${c.name}`;
      label.appendChild(nameSpan);
    }

    const badge = document.createElement('div');
    if(completeSet.has(c.file)){
      badge.className = 'badge completed';
      badge.textContent = 'Completed';
    } else if(reviewSet.has(c.file)){
      badge.className = 'badge review';
      badge.textContent = 'Review';
    }

    li.appendChild(label);
    if(badge.textContent) li.appendChild(badge);
  li.addEventListener('click', (e) => { showCard(idx); sidebar.classList.remove('expanded'); sidebar.setAttribute('aria-hidden','true'); sidebarToggle.setAttribute('aria-expanded','false'); document.body.classList.remove('sidebar-open'); });
  li.addEventListener('keydown', (e) => { if(e.key==='Enter') { showCard(idx); sidebar.classList.remove('expanded'); sidebar.setAttribute('aria-hidden','true'); sidebarToggle.setAttribute('aria-expanded','false'); document.body.classList.remove('sidebar-open'); } });
    cardListEl.appendChild(li);
  });
}

// Sidebar toggle
sidebarToggle.addEventListener('click', ()=>{
  const expanded = sidebar.classList.toggle('expanded');
  sidebar.setAttribute('aria-hidden', expanded ? 'false' : 'true');
  sidebarToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  if(expanded) document.body.classList.add('sidebar-open'); else document.body.classList.remove('sidebar-open');
});
closeSidebar.addEventListener('click', ()=>{
  sidebar.classList.remove('expanded');
  sidebar.setAttribute('aria-hidden','true');
  sidebarToggle.setAttribute('aria-expanded','false');
  document.body.classList.remove('sidebar-open');
});

// Floating handle opens sidebar
if(sidebarHandle){
  sidebarHandle.addEventListener('click', ()=>{
    sidebar.classList.add('expanded');
    sidebar.setAttribute('aria-hidden','false');
    sidebarToggle.setAttribute('aria-expanded','true');
    document.body.classList.add('sidebar-open');
  });
}

// load both mark sets
function loadMarks(){
  try{
    const raw = localStorage.getItem('reviewMarks');
    const arr = raw ? JSON.parse(raw) : [];
    reviewSet = new Set(arr);
  }catch(err){ reviewSet = new Set(); }
  loadCompleted();
}

loadCards();
