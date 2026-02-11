// เมนูมือถือ
const mobileToggle = document.getElementById('mobile-toggle');
const mainNav = document.getElementById('main-nav');

if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });
}
