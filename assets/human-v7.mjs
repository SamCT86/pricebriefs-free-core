// Motion is enhancement only. No hidden content, no tracking, no network.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let observer;
function configure(){
 observer?.disconnect();
 if(reduced.matches||!('IntersectionObserver' in window))return;
 observer=new IntersectionObserver(entries=>{
   for(const e of entries)if(e.isIntersecting){
     e.target.classList.add('v7-revealed');
     observer.unobserve(e.target);
   }
 },{threshold:.18});
 for(const el of document.querySelectorAll('[data-v7-reveal]'))if(!el.classList.contains('v7-revealed'))observer.observe(el);
}
configure();reduced.addEventListener?.('change',configure);
