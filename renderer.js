const { ipcRenderer } = require("electron");
const data = {};
const user = "";
window.addEventListener("load", () => {
  let x = ipcRenderer.sendSync("loaded");
  console.log(document.querySelector("#intro"));
  document.getElementById(
    "intro"
  ).innerHTML = `${x} is logged in . You can change`;
});
document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();

  event.target
    .querySelectorAll("input")
    .forEach((item) => (data[item.name] = item.value));
  document.getElementById(
    "intro"
  ).innerHTML = `${data.username} is logged in . You can change`;
  ipcRenderer.send("userDetails", data);
});
document.querySelector(".override").addEventListener("click", () => {
  ipcRenderer.send("override", true);
});
