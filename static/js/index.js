const easterEggBtn = document.querySelector('.easter-egg-btn')
const easterEggModal = document.querySelector('.easter-egg-modal')
const closeBtn = document.querySelector('.close-btn')

easterEggBtn.addEventListener('click', function () {
    easterEggModal.classList.add('active')
})

closeBtn.addEventListener('click', function () {
    easterEggModal.classList.remove('active')
})

// Cerrar modal al hacer clic fuera
easterEggModal.addEventListener('click', function (e) {
    if (e.target === easterEggModal) {
        easterEggModal.classList.remove('active')
    }
})
