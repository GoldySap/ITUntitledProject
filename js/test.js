const palette = ['O','X'];
let sequence = [];
let dragSrcIndex = null;

const paletteList = document.getElementById('paletteList');
const palettePanel = document.querySelector('.palette .list');
const workspace = document.getElementById('workspace');
workspace.style.outline = '2px dashed rgba(255,255,255,0.04)';
const sequenceString = document.getElementById('sequenceString');
const compact = document.getElementById('compact');
const countsDiv = document.getElementById('counts');

function renderPalette(){
    paletteList.innerHTML='';
    palette.forEach((label, i)=>{
    const btn = document.createElement('div');
    btn.className='token token-item';
    btn.draggable=true;
    btn.dataset.label = label;
    btn.innerHTML = `<strong>${label}</strong> <button class="xbtn" title="Create one in workspace">＋</button>`;
    btn.querySelector('.xbtn').addEventListener('click', ()=>{
        pushToken(label);
    });
    btn.addEventListener('dragstart', e=>{
        e.dataTransfer.setData('text/plain', label);
        btn.classList.add('dragging');
    });
    btn.addEventListener('dragend', ()=>btn.classList.remove('dragging'));
    paletteList.appendChild(btn);
    })
}

function renderWorkspace(){
    workspace.innerHTML='';
    sequence.forEach((tok, idx)=>{
    const el = document.createElement('div');
    el.className='token';
    el.draggable = true;
    el.dataset.index = idx;
    el.textContent = tok;
    el.addEventListener('click', ()=>{ removeAtIndex(idx); });
    el.addEventListener('dragstart', e=>{
        e.dataTransfer.setData('from-workspace', idx);
        el.classList.add('dragging');
    });
    el.addEventListener('dragend', ()=>el.classList.remove('dragging'));
    workspace.appendChild(el);
    });
    sequenceString.textContent = sequence.length ? sequence.join(' - ') : '(empty)';
    updateCompactDisplay();
}

function getDragAfterElement(container, x, y) {
  const draggableElements = [...container.querySelectorAll('.token:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.token:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

workspace.addEventListener('dragstart', e => {
  const tokenEl = e.target.closest('.token');
  if (!tokenEl) return;
  dragSrcIndex = Number(tokenEl.dataset.index);
  tokenEl.classList.add('dragging');
});

workspace.addEventListener('dragend', e => {
  const dragging = e.target.closest('.token');
  if (dragging) dragging.classList.remove('dragging');
  const newOrder = [];
  workspace.querySelectorAll('.token').forEach(el => {
    newOrder.push(el.textContent);
  });
  sequence = newOrder;
  renderWorkspace();
});

workspace.addEventListener('dragover', e => {
  e.preventDefault();
  workspace.style.outline = '2px dashed var(--accent)';
  const dragging = document.querySelector('.dragging');
  if (!dragging) return;
  const afterElement = getDragAfterElement(workspace, e.clientX);
  if (afterElement == null) {
    workspace.appendChild(dragging);
  } else {
    workspace.insertBefore(dragging, afterElement);
  }
});

workspace.addEventListener('dragleave', e => {
  workspace.style.outline = '2px dashed rgba(255,255,255,0.04)';
});

workspace.addEventListener('drop', e=>{
    e.preventDefault();
    workspace.style.outline = '2px dashed rgba(255,255,255,0.04)';
    const label = e.dataTransfer.getData('text/plain');
    const fromIdx = e.dataTransfer.getData('from-workspace');
    if(fromIdx!=='' && fromIdx!=null){
    const i = Number(fromIdx);
    const tok = sequence.splice(i,1)[0];
    sequence.push(tok);
    } else if(label){
    sequence.push(label);
    }
    renderWorkspace();
    renderPalette();
});

palettePanel.addEventListener('dragover', e => {
  e.preventDefault();
  palettePanel.style.outline = '2px dashed var(--accent)';
});

palettePanel.addEventListener('dragleave', () => {
  palettePanel.style.outline = 'none';
});

palettePanel.addEventListener('drop', e => {
  e.preventDefault();
  workspace.style.outline = '2px dashed rgba(255,255,255,0.04)';
  const fromIdx = e.dataTransfer.getData('from-workspace');
  if (fromIdx !== '' && fromIdx != null) {
    const i = Number(fromIdx);
    const tok = sequence[i];
    if (!palette.includes(tok)) {
      palette.push(tok);
      renderPalette();
    }
  }
});

function pushToken(label){ 
    sequence.push(label); 
    renderWorkspace(); 
}
function removeAtIndex(i){ 
    sequence.splice(i,1); 
    renderWorkspace(); 
}

document.getElementById('addBtn').addEventListener('click', ()=>{
    const val = document.getElementById('newLabel').value.trim();
    if(!val) return;
    palette.push(val);
    document.getElementById('newLabel').value = '';
    renderPalette();
});

document.getElementById('clear').addEventListener('click', ()=>{ 
    sequence = []; 
    renderWorkspace(); 
});

document.getElementById('fuseOnce').addEventListener('click', ()=>{ 
    fuseOnce(); 
    renderWorkspace(); 
});

document.getElementById('autoFuse').addEventListener('click', ()=>{
    let changed=true; let rounds=0;
    while(changed && rounds < 100){
    changed = fuseOnce();
    rounds++;
    }
    renderWorkspace();
});

function isAtomic(tok){ return typeof tok === 'string' && tok.length === 1; }

function fuseOnce(){
    const out = [];
    let fused = false;
    for(let i=0;i<sequence.length;i++){
    const a = sequence[i];
    const b = sequence[i+1];
    if(b!==undefined && isAtomic(a) && isAtomic(b) && a !== b){
        out.push(a + b);
        i++;
        fused = true;
    } else {
        out.push(a);
    }
    }
    sequence = out;
    return fused;
}

function updateCompactDisplay(){
    if(sequence.length===0){ compact.textContent = 'Compact: —'; countsDiv.textContent=''; return; }
    const grouped = [];
    for(let i=0;i<sequence.length;i++){
    if(grouped.length && grouped[grouped.length-1].tok === sequence[i]){
        grouped[grouped.length-1].count++;
    } else {
        grouped.push({tok: sequence[i], count:1});
    }
    }
    const parts = grouped.map(g => (g.count>1? g.count : '') + g.tok);
    compact.textContent = 'Compact: ' + parts.join(' ');
    const totals = {};
    sequence.forEach(tok=>{
    for(const ch of tok.split('')){
        totals[ch] = (totals[ch]||0)+1;
    }
    });
    countsDiv.innerHTML = 'Totals: ' + Object.entries(totals).map(([k,v])=>v + k).join(' ');
}

renderPalette(); renderWorkspace();

document.body.addEventListener('dragover', e=>e.preventDefault());