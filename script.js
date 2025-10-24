// Load images.json and wire up card flip + navigation
const cardEl = document.getElementById('card');
const cardInner = document.getElementById('card-inner');
const imgEl = document.getElementById('card-image');
const backEl = document.getElementById('card-answer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const markBtn = document.getElementById('markBtn');
const reviewBadge = document.getElementById('reviewBadge');
const positionEl = document.getElementById('position');

let cards = [];
let index = 0;
let reviewSet = new Set(); // store file paths marked for review

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
}

loadCards();
