const body = document.body;
const lamp = document.getElementById('lamp');
let isNight = false;

function setScene(nightMode) {
  isNight = nightMode;
  body.classList.toggle('night', isNight);
}

function toggleScene() {
  setScene(!isNight);
}

lamp.addEventListener('click', toggleScene);
lamp.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    toggleScene();
  }
});
