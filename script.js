// Simple static store data and UI behaviors
const PRODUCTS_PER_PAGE = 8;

const sampleProducts = (() => {
  const categories = ['Costumes','Wigs','Props','Accessories'];
  const items = [];
  for(let i=1;i<=20;i++){
    const cat = categories[i % categories.length];
    items.push({
      id: 'p'+i,
      title: `${cat} Sample #${i}`,
      category: cat,
      price: Math.round(1200 + Math.random()*5500),
      img: `https://picsum.photos/seed/${encodeURIComponent(cat+i)}/600/400`,
      desc: `High-quality ${cat.toLowerCase()} ideal for characters and events. Customizable and comfortable for long wear.`
    });
  }
  return items;
})();

let state = {
  products: sampleProducts,
  page: 1,
  perPage: PRODUCTS_PER_PAGE,
  filter: '',
  sort: 'popular',
  cart: {}
};

// --- Helpers ---
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const formatPrice = p => `₹${p.toLocaleString('en-IN')}`;

// --- Render functions ---
function renderProducts(){
  const grid = $('#productsGrid');
  const start = (state.page-1)*state.perPage;
  let list = state.products.slice();
  // filter
  if(state.filter){
    const q = state.filter.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  // sort
  if(state.sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if(state.sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  // pagination
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total/state.perPage));
  if(state.page > pages) state.page = pages;
  const pageList = list.slice((state.page-1)*state.perPage, state.page*state.perPage);

  grid.innerHTML = pageList.map(p => `
    <div class="product-card" role="listitem" data-id="${p.id}">
      <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy"/>
      <div class="product-meta">
        <div>
          <div class="product-title">${escapeHtml(p.title)}</div>
          <div class="muted small">${escapeHtml(p.category)}</div>
        </div>
        <div class="price">${formatPrice(p.price)}</div>
      </div>
      <div style="display:flex;gap:.5rem;margin-top:.5rem">
        <button class="btn view-btn" data-id="${p.id}">Quick view</button>
        <button class="btn btn-ghost add-btn" data-id="${p.id}">Add</button>
      </div>
    </div>
  `).join('');

  $('#pageInfo').textContent = `Page ${state.page} / ${pages}`;
  $('#prevPage').disabled = state.page <= 1;
  $('#nextPage').disabled = state.page >= pages;

  // attach card listeners
  $$('.view-btn').forEach(btn => btn.addEventListener('click', e => openModal(e.target.dataset.id)));
  $$('.add-btn').forEach(btn => addProductToCart(btn.dataset.id, 1));
}

function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// --- Modal ---
const modal = $('#productModal');
function openModal(id){
  const p = state.products.find(x=>x.id===id);
  if(!p) return;
  $('#modalImage').src = p.img;
  $('#modalTitle').textContent = p.title;
  $('#modalCategory').textContent = p.category;
  $('#modalPrice').textContent = formatPrice(p.price);
  $('#modalDesc').textContent = p.desc;
  $('#modalQty').value = 1;
  modal.setAttribute('aria-hidden','false');
  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  // add handler for add button
  $('#addToCartBtn').onclick = () => {
    const qty = Math.max(1, parseInt($('#modalQty').value||1,10));
    addProductToCart(p.id, qty)();
    closeModal();
  };
}
function closeModal(){
  modal.setAttribute('aria-hidden','true');
  modal.style.opacity='0';
  setTimeout(()=>{ modal.style.visibility='hidden'; },220);
}
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

// --- Cart ---
function setCartAria(show){
  const cartEl = $('#cart');
  const cartToggle = $('#cartToggle');
  cartEl.setAttribute('aria-hidden', String(!show));
  cartToggle.setAttribute('aria-expanded', String(show));
  if(show) cartEl.style.transform = 'translateX(0)'; else cartEl.style.transform = 'translateX(110%)';
}

$('#cartToggle').addEventListener('click', ()=>{
  const visible = $('#cart').getAttribute('aria-hidden') === 'false';
  setCartAria(!visible);
});
$('#closeCart').addEventListener('click', ()=> setCartAria(false));
$('#checkoutBtn').addEventListener('click', ()=> alert('Checkout not implemented in this static demo.'));

function renderCart(){
  const root = $('#cartItems');
  const ids = Object.keys(state.cart);
  if(ids.length===0){
    root.innerHTML = `<div class="muted">Your cart is empty.</div>`;
    $('#cartTotal').textContent = formatPrice(0);
    $('#cartCount').textContent = 0;
    return;
  }
  let total = 0;
  root.innerHTML = ids.map(id=>{
    const item = state.cart[id];
    total += item.price * item.qty;
    return `<div class="cart-item" data-id="${id}">
      <img src="${item.img}" alt="${escapeHtml(item.title)}"/>
      <div class="meta">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${escapeHtml(item.title)}</strong><div class="muted small">${escapeHtml(item.category)}</div></div>
          <div>${formatPrice(item.price)}</div>
        </div>
        <div style="display:flex;gap:.6rem;margin-top:.4rem;align-items:center">
          <label>Qty
            <input type="number" min="1" value="${item.qty}" data-id="${id}" class="cart-qty" style="width:64px;padding:.2rem;border-radius:6px"/>
          </label>
          <button class="btn btn-ghost remove" data-id="${id}">Remove</button>
        </div>
      </div>
    </div>`;
  }).join('');
  $('#cartTotal').textContent = formatPrice(total);
  $('#cartCount').textContent = ids.length;
  // qty listeners
  $$('.cart-qty').forEach(el => el.addEventListener('change', e=>{
    const id = e.target.dataset.id;
    const qty = Math.max(1, parseInt(e.target.value||1,10));
    state.cart[id].qty = qty;
    renderCart();
  }));
  $$('.remove').forEach(btn => btn.addEventListener('click', e=>{
    const id = e.target.dataset.id;
    delete state.cart[id];
    renderCart();
  }));
}

function addProductToCart(id, qty=1){
  return (e) => {
    const p = state.products.find(x=>x.id===id);
    if(!p) return;
    if(state.cart[id]){
      state.cart[id].qty += qty;
    } else {
      state.cart[id] = { id:p.id, title:p.title, price:p.price, img:p.img, qty:qty, category:p.category };
    }
    renderCart();
    setCartAria(true);
  };
}

// Enable add buttons created in markup
function wireAddButtons(){
  document.addEventListener('click', (e)=>{
    const add = e.target.closest('.add-btn');
    if(add){
      const id = add.dataset.id;
      addProductToCart(id, 1)();
    }
  });
}

// --- Controls & events ---
$('#searchForm').addEventListener('submit', e => {
  e.preventDefault();
  state.filter = $('#searchInput').value.trim();
  state.page = 1;
  renderProducts();
});

$$('.category-card').forEach(btn => btn.addEventListener('click', e => {
  state.filter = e.currentTarget.dataset.category;
  $('#searchInput').value = state.filter;
  state.page = 1;
  renderProducts();
}));

$('#sortSelect').addEventListener('change', e => {
  state.sort = e.target.value;
  renderProducts();
});

$('#prevPage').addEventListener('click', ()=> { state.page = Math.max(1,state.page-1); renderProducts(); });
$('#nextPage').addEventListener('click', ()=> { state.page++; renderProducts(); });

$('#shopNowBtn').addEventListener('click', ()=> { document.getElementById('searchInput').focus(); });
$('#exploreBtn').addEventListener('click', ()=> window.scrollTo({top:document.querySelector('.categories').offsetTop,behavior:'smooth'}));

// page init
function init(){
  document.getElementById('year').textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
  wireAddButtons();
  // prewire quick view open for keyboard accessibility (delegate)
  $('#productsGrid').addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      const card = e.target.closest('.product-card');
      if(card) openModal(card.dataset.id);
    }
  });
}
init();
