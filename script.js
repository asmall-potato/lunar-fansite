document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  if (toggle) toggle.addEventListener("click", toggleMenu);

  // Typing effect for the intro heading
  const target = document.querySelector(".intro-text h1");
  const fullText = "Hi ! I’m LUNAR.";
  const highlightedText = "LUNAR.";
  const typingSpeed = 200;

  if (target) {
    target.innerHTML = "";
    let i = 0;

    function type() {
      if (i < fullText.length) {
        const char = fullText.charAt(i);
        if (fullText.slice(i).startsWith(highlightedText)) {
          target.innerHTML += `<span class='highlight'>${highlightedText}</span>`;
          i += highlightedText.length;
        } else {
          target.innerHTML += char;
          i++;
        }
        setTimeout(type, typingSpeed);
      }
    }
    type();
  }

  // Typing effect for journey-text
  const journeyEl = document.querySelector(".journey-text h1");
  const journeyText = "LUNAR's JOURNEY";
  const journeySpeed = 200;
  let j = 0;

  if (journeyEl) {
    journeyEl.innerHTML = "";
    function typeJourney() {
      if (j < journeyText.length) {
        journeyEl.innerHTML += journeyText.charAt(j);
        j++;
        setTimeout(typeJourney, journeySpeed);
      }
    }
    setTimeout(typeJourney, 1000); // Start slightly after intro finishes
  }
});
