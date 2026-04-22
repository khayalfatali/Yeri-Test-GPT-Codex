const hero = document.querySelector('.hero-visual');
const phone = document.querySelector('.phone-shell');

if (hero && phone) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    const rotateY = -13 + x * 18;
    const rotateX = 9 - y * 16;

    phone.style.transform = `translate(-50%, -50%) rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg)`;
  });

  hero.addEventListener('pointerleave', () => {
    phone.style.transform = 'translate(-50%, -50%) rotateY(-13deg) rotateX(9deg)';
  });
}
