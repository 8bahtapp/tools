// 1. ระบบ Copy Link พร้อม Feedback
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-copy')) {
    const url = e.target.getAttribute('data-url');
    navigator.clipboard.writeText(url).then(() => {
      const originalText = e.target.innerText;
      e.target.innerText = 'Copied!';
      e.target.style.background = '#1d1d1f';
      e.target.style.color = '#fff';

      setTimeout(() => {
        e.target.innerText = originalText;
        e.target.style.background = '';
        e.target.style.color = '';
      }, 2000);
    });
  }
});

// 2. ระบบ Active State เมื่อเลื่อนหน้า (Scroll Spy)
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-item');
  let currentId = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 120) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentId}`) {
      link.classList.add('active');
    }
  });
});
