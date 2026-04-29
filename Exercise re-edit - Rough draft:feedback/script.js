/*
 * Simple pill management for the net‑art hypertext.
 * Uses localStorage to persist the number of pills left across pages.
 * The story begins with seven pills. Each time a pill is taken, a memory page
 * is shown and the pill count decreases. When returning to the corridor,
 * the subsequent page will update its narrative depending on how many pills
 * have already been consumed.
 */

// Return the number of pills remaining. Initialise to 7 if unset.
function getPillsLeft() {
  const stored = localStorage.getItem('pills_left');
  if (stored === null) {
    localStorage.setItem('pills_left', '7');
    return 7;
  }
  return parseInt(stored, 10);
}

// Set the number of pills remaining.
function setPillsLeft(n) {
  localStorage.setItem('pills_left', String(n));
}

// Compute how many pills have been consumed so far.
function getPillsTaken() {
  return 7 - getPillsLeft();
}

// Update the on‑screen counter if present.
function updateCounter() {
  const counter = document.getElementById('counter');
  if (counter) {
    const left = getPillsLeft();
    counter.textContent = `${left} pill${left === 1 ? '' : 's'} left`;
  }
}

// Call this when a pill is consumed and the reader wishes to see a memory.
function takePill(memoryPage) {
  let left = getPillsLeft();
  if (left <= 0) {
    // If there are no pills left, direct to empty page
    window.location.href = 'empty.html';
    return;
  }
  left -= 1;
  setPillsLeft(left);
  updateCounter();
  window.location.href = memoryPage;
}

// Reset the story by restoring pills and redirecting to the beginning.
function resetStory() {
  setPillsLeft(7);
  window.location.href = 'index.html';
}

// Utility to return to a corridor page after reading a memory.
function returnToCorridor(page) {
  window.location.href = page;
}

// On page load update the counter.
window.addEventListener('DOMContentLoaded', updateCounter);