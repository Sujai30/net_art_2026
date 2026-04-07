// variable
let newText = "You clicked the button!";

// function
function changePage() {
  let textElement = document.querySelector("#titleText");

  // change text
  textElement.innerHTML = newText;

  // change style
  textElement.style.color = "blue";
}

// event listener
let button = document.querySelector("#changeBtn");

button.addEventListener("click", changePage);
