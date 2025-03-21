document.addEventListener('DOMContentLoaded', function () {
  const easterEggBtn = document.querySelector('.easter-egg-btn');
  const easterEggModal = document.querySelector('.easter-egg-modal');
  const closeBtn = document.querySelector('.close-btn');

  easterEggBtn.addEventListener('click', function () {
    easterEggModal.classList.add('opacity-100');
    easterEggModal.classList.remove('pointer-events-none');
  });

  closeBtn.addEventListener('click', function () {
    easterEggModal.classList.remove('opacity-100');
    easterEggModal.classList.add('pointer-events-none');
  });

  easterEggModal.addEventListener('click', function (e) {
    if (e.target === easterEggModal) {
      easterEggModal.classList.remove('opacity-100');
      easterEggModal.classList.add('pointer-events-none');
    }
  });
});
