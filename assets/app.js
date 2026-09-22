(function(){
const data=window.SEHBS_DATA||{};
const hero=document.querySelector('[data-featured]');
if(hero&&data.featured){
  const heroImg=hero.querySelector('[data-featured-image]');
  if(heroImg) heroImg.src=data.featured.image;
  hero.style.backgroundImage='none';
  hero.querySelector('[data-category]').textContent=data.featured.category;
  hero.querySelector('[data-title]').textContent=data.featured.title;
  hero.querySelector('[data-dek]').textContent=data.featured.dek;
  hero.querySelector('[data-source]').textContent=data.featured.source||'';
  hero.querySelector('[data-href]').href=data.featured.href;
}
const weekly=document.querySelector('[data-weekly]');
if(weekly&&data.weekly){weekly.querySelector('img').src=data.weekly.image;weekly.querySelector('[data-category]').textContent=data.weekly.category;weekly.querySelector('[data-title]').textContent=data.weekly.title;weekly.querySelector('[data-dek]').textContent=data.weekly.dek;weekly.querySelector('[data-href]').href=data.weekly.href}
const grid=document.querySelector('[data-news-grid]');
if(grid&&data.latest){grid.innerHTML=data.latest.map(item=>`<article class="card" data-searchable="${item.title.toLowerCase()} ${item.category.toLowerCase()}"><img src="${item.image}" alt="Imagen editorial de ${item.category}" loading="lazy"><div class="card-body"><span class="tag">${item.category}</span><h3><a href="${item.href}">${item.title}</a></h3><div class="date">${item.date}</div></div></article>`).join('')}
const menu=document.querySelector('.menu-btn'),navlinks=document.querySelector('.navlinks');if(menu&&navlinks)menu.addEventListener('click',()=>navlinks.classList.toggle('open'));
const search=document.querySelector('[data-search]');if(search)search.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('[data-searchable]').forEach(el=>el.style.display=!q||el.dataset.searchable.includes(q)?'':'none')});
function toast(msg){const t=document.querySelector('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();toast('Formulario de demostración: falta conectar un servicio de envío.');form.reset()}));
})();