(function(){
const data=window.SEHBS_DATA||{};
const hero=document.querySelector('[data-featured]');
if(hero&&data.featured){
  hero.style.backgroundImage=`url('${data.featured.image}')`;
  hero.querySelector('[data-category]').textContent=data.featured.category;
  hero.querySelector('[data-title]').textContent=data.featured.title;
  hero.querySelector('[data-dek]').textContent=data.featured.dek;
  hero.querySelector('[data-source]').textContent=data.featured.source||'';
  hero.querySelector('[data-href]').href=data.featured.href;

  // Load the 1600×900 WebP hero in five lightweight text chunks.
  // The existing JPG remains as an immediate fallback while the HQ image loads.
  Promise.all([0,1,2,3,4].map(i=>
    fetch(`assets/hero-hq-${i}.b64?v=2`).then(r=>{
      if(!r.ok) throw new Error('Hero HQ chunk '+i);
      return r.text();
    })
  )).then(parts=>{
    const base64=parts.join('').replace(/\s+/g,'');
    const binary=atob(base64);
    const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
    const blob=new Blob([bytes],{type:'image/webp'});
    const hqUrl=URL.createObjectURL(blob);
    hero.style.backgroundImage=`url("${hqUrl}")`;
  }).catch(()=>{/* keep the fallback hero */});
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