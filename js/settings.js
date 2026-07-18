/* ===============================
   settings.js
=============================== */

function resetApp(){

const answer =
confirm(
"Reset all Tasky data?"
);

if(!answer) return;

localStorage.clear();

location.reload();

}
