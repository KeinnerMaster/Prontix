
// nav.js - hamburger toggle and close
document.addEventListener('DOMContentLoaded', function(){
  const btn = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  btn && btn.addEventListener('click', ()=> menu.classList.add('open'));
  closeBtn && closeBtn.addEventListener('click', ()=> menu.classList.remove('open'));
  // close when clicking a link
  menu && menu.addEventListener('click', (e)=> {
    if(e.target.tagName === 'A') menu.classList.remove('open');
  });
});
