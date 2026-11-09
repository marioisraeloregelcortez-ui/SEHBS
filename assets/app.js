(function(){
const data=window.SEHBS_DATA||{};

const CATEGORY_CONFIG={
  "athletic-performance":{
    label:"Rendimiento Deportivo",
    matches:["athletic performance","rendimiento deportivo"]
  },
  "exercise-and-health":{
    label:"Ejercicio y Salud",
    matches:["exercise and health","excercise and health","ejercicio y salud"]
  },
  "biomedical-sciences":{
    label:"Ciencias Biomédicas",
    matches:["biomedical sciences","ciencias biomédicas","ciencias biomedicas"]
  },
  "literature-review":{
    label:"Revisión de Literatura",
    matches:["literature review","revisión de literatura","revision de literatura"]
  }
};

const normalize=value=>(value||"")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .trim();

const params=new URLSearchParams(window.location.search);
const categoryKey=params.get("category");
const categoryConfig=CATEGORY_CONFIG[categoryKey]||null;

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
if(weekly&&data.weekly){
  weekly.querySelector('img').src=data.weekly.image;
  weekly.querySelector('[data-category]').textContent=data.weekly.category;
  weekly.querySelector('[data-title]').textContent=data.weekly.title;
  weekly.querySelector('[data-dek]').textContent=data.weekly.dek;
  weekly.querySelector('[data-href]').href=data.weekly.href;
}

const grid=document.querySelector('[data-news-grid]');
if(grid&&data.latest){
  let items=data.latest;

  if(categoryConfig){
    const accepted=categoryConfig.matches.map(normalize);
    items=items.filter(item=>accepted.includes(normalize(item.category)));
  }

  grid.innerHTML=items.map(item=>`<article class="card" data-searchable="${[item.title,item.summary,item.journal,item.category].filter(Boolean).join(' ').toLowerCase()}"><div class="card-media"><img src="${item.image}" alt="Imagen editorial de ${item.category}" loading="lazy">${item.imageLabel?`<span class="card-image-label">${item.imageLabel}</span>`:""}</div><div class="card-body"><span class="tag">${item.category}</span><h3><a href="${item.href}">${item.title}</a></h3><p class="card-summary">${item.summary||''}</p><div class="card-journal">${item.journal||''}</div></div></article>`).join('');

  const categoryTitle=document.querySelector('[data-category-title]');
  const categoryIntro=document.querySelector('[data-category-intro]');
  const categoryReset=document.querySelector('[data-category-reset]');

  if(categoryConfig){
    if(categoryTitle) categoryTitle.textContent=categoryConfig.label;
    if(categoryIntro) categoryIntro.textContent=`Artículos publicados en SEHBS dentro de ${categoryConfig.label}.`;
    if(categoryReset) categoryReset.hidden=false;
  }else{
    if(categoryReset) categoryReset.hidden=true;
  }

  const empty=document.querySelector('[data-empty-state]');
  if(empty) empty.hidden=items.length!==0;
}

const menu=document.querySelector('.menu-btn'),navlinks=document.querySelector('.navlinks');
if(menu&&navlinks)menu.addEventListener('click',()=>navlinks.classList.toggle('open'));

const search=document.querySelector('[data-search]');
const searchQuery=params.get("q")||"";

function filterSearchResults(value){
  const q=normalize(value);
  document.querySelectorAll('[data-searchable]').forEach(el=>{
    const haystack=normalize(el.dataset.searchable);
    el.style.display=!q||haystack.includes(q)?'':'none';
  });

  const empty=document.querySelector('[data-empty-state]');
  if(empty){
    const visible=[...document.querySelectorAll('[data-searchable]')].some(el=>el.style.display!=='none');
    empty.hidden=visible;
  }
}

if(search){
  if(searchQuery) search.value=searchQuery;

  search.addEventListener('input',e=>filterSearchResults(e.target.value));

  search.addEventListener('keydown',e=>{
    if(e.key!=="Enter") return;
    e.preventDefault();
    const q=e.target.value.trim();
    if(!q) return;

    const onNewsPage=window.location.pathname.endsWith('/noticias.html')||window.location.pathname.endsWith('noticias.html');
    if(onNewsPage){
      const url=new URL(window.location.href);
      url.searchParams.delete("category");
      url.searchParams.set("q",q);
      window.history.replaceState({},"",url);
      filterSearchResults(q);

      const title=document.querySelector('[data-category-title]');
      const intro=document.querySelector('[data-category-intro]');
      const reset=document.querySelector('[data-category-reset]');
      if(title) title.textContent=`Resultados de búsqueda: “${q}”`;
      if(intro) intro.textContent="Resultados encontrados dentro de las noticias publicadas en SEHBS.";
      if(reset) reset.hidden=false;
    }else{
      window.location.href=`noticias.html?q=${encodeURIComponent(q)}`;
    }
  });
}

if(searchQuery){
  filterSearchResults(searchQuery);

  const title=document.querySelector('[data-category-title]');
  const intro=document.querySelector('[data-category-intro]');
  const reset=document.querySelector('[data-category-reset]');
  if(title) title.textContent=`Resultados de búsqueda: “${searchQuery}”`;
  if(intro) intro.textContent="Resultados encontrados dentro de las noticias publicadas en SEHBS.";
  if(reset) reset.hidden=false;
}


const localCarousel=document.querySelector('[data-local-carousel]');
if(localCarousel&&Array.isArray(data.localLatest)&&data.localLatest.length){
  const track=localCarousel.querySelector('[data-local-carousel-track]');
  const dotsWrap=localCarousel.querySelector('[data-local-dots]');
  const prev=localCarousel.querySelector('[data-local-prev]');
  const next=localCarousel.querySelector('[data-local-next]');
  const progress=localCarousel.querySelector('[data-local-progress]');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intervalMs=8000;
  let index=0;
  let timer=null;
  let pointerStartX=null;

  const safe=value=>String(value||'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');

  track.innerHTML=data.localLatest.map((item,i)=>`
    <article class="local-carousel-slide" aria-hidden="${i===0?'false':'true'}">
      <div class="local-carousel-media">
        <img src="${safe(item.image)}" alt="Imagen editorial de ${safe(item.title)}" loading="${i===0?'eager':'lazy'}">
        <span class="local-carousel-count">${String(i+1).padStart(2,'0')} / ${String(data.localLatest.length).padStart(2,'0')}</span>
      </div>
      <div class="local-carousel-copy">
        <span class="badge">${safe(item.category)}</span>
        <h3>${safe(item.title)}</h3>
        <p>${safe(item.summary)}</p>
        <div class="local-feature-meta">${safe(item.journal)} · ${safe(item.date)}</div>
        <a class="btn green" href="${safe(item.href)}">Leer artículo original →</a>
      </div>
    </article>`).join('');

  dotsWrap.innerHTML=data.localLatest.map((item,i)=>`
    <button type="button" class="local-carousel-dot${i===0?' active':''}" data-local-dot="${i}" aria-label="Ver publicación ${i+1}: ${safe(item.title)}" aria-current="${i===0?'true':'false'}"></button>`).join('');

  const slides=[...track.querySelectorAll('.local-carousel-slide')];
  const dots=[...dotsWrap.querySelectorAll('[data-local-dot]')];

  function resetProgress(){
    if(!progress||reduceMotion) return;
    progress.style.animation='none';
    void progress.offsetWidth;
    progress.style.animation=`localCarouselProgress ${intervalMs}ms linear forwards`;
  }

  function stop(){
    if(timer){
      window.clearTimeout(timer);
      timer=null;
    }
    if(progress) progress.style.animationPlayState='paused';
  }

  function schedule(){
    if(reduceMotion||document.hidden||timer||localCarousel.matches(':hover')||localCarousel.matches(':focus-within')) return;
    resetProgress();
    timer=window.setTimeout(()=>{
      timer=null;
      show(index+1,{scheduleNext:false});
      schedule();
    },intervalMs);
  }

  function show(nextIndex,{scheduleNext=true}={}){
    index=(nextIndex+slides.length)%slides.length;
    track.style.transform=`translateX(-${index*100}%)`;
    slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',i===index?'false':'true'));
    dots.forEach((dot,i)=>{
      dot.classList.toggle('active',i===index);
      dot.setAttribute('aria-current',i===index?'true':'false');
    });
    if(scheduleNext){
      stop();
      schedule();
    }
  }

  prev?.addEventListener('click',()=>show(index-1));
  next?.addEventListener('click',()=>show(index+1));
  dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.localDot))));

  localCarousel.addEventListener('mouseenter',stop);
  localCarousel.addEventListener('mouseleave',schedule);
  localCarousel.addEventListener('focusin',stop);
  localCarousel.addEventListener('focusout',e=>{
    if(!localCarousel.contains(e.relatedTarget)) schedule();
  });

  localCarousel.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse') return;
    pointerStartX=e.clientX;
  });
  localCarousel.addEventListener('pointerup',e=>{
    if(pointerStartX===null) return;
    const delta=e.clientX-pointerStartX;
    pointerStartX=null;
    if(Math.abs(delta)<45) return;
    show(delta<0?index+1:index-1);
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) stop();
    else schedule();
  });

  schedule();
}

function toast(msg){
  const t=document.querySelector('.toast');
  if(!t)return;
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2600);
}

})();