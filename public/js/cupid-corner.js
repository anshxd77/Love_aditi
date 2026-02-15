/**
 * Cupid's Corner: on click, lift curtain (parda) then navigate to ai.html
 */
(function () {
  var link = document.getElementById('cupidCornerLink');
  var curtain = document.getElementById('cupidCurtain');
  if (!link || !curtain) return;

  link.addEventListener('click', function (e) {
    e.preventDefault();
    var href = link.getAttribute('href');
    if (!href) return;

    curtain.setAttribute('aria-hidden', 'false');
    curtain.classList.add('cupid-curtain-lift');

    var panel = curtain.querySelector('.cupid-curtain-panel');
    var duration = 1600; // match CSS transition

    panel.addEventListener('transitionend', function go() {
      panel.removeEventListener('transitionend', go);
      window.location.href = href;
    });

    // fallback if transitionend doesn't fire
    setTimeout(function () {
      window.location.href = href;
    }, duration + 200);
  });
})();
