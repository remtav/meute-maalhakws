// Google Analytics chargé seulement après consentement (Loi 25).
(function () {
  var script = document.currentScript;
  var gaId = script && script.dataset.gaId;
  if (!gaId) return;
  var CLE = 'consentement-analytics';

  function lire() {
    try { return localStorage.getItem(CLE); } catch (e) { return null; }
  }
  function ecrire(valeur) {
    try { localStorage.setItem(CLE, valeur); } catch (e) { /* stockage indisponible */ }
  }

  function chargerGA() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(s);
  }

  function afficherBandeau() {
    if (document.querySelector('.consentement')) return;
    var b = document.createElement('div');
    b.className = 'consentement';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Statistiques de visite');
    b.innerHTML =
      '<p>Nous utilisons Google Analytics pour mesurer les visites et repérer toute activité inhabituelle sur ce site privé. Acceptez-vous?</p>' +
      '<div class="actions"><button type="button" class="bouton" data-choix="oui">Accepter</button>' +
      '<button type="button" class="bouton secondaire" data-choix="non">Refuser</button></div>';
    b.addEventListener('click', function (ev) {
      var choix = ev.target && ev.target.getAttribute('data-choix');
      if (!choix) return;
      ecrire(choix);
      b.remove();
      if (choix === 'oui') chargerGA();
      else if (window.gtag) location.reload();
    });
    document.body.appendChild(b);
  }

  function demarrer() {
    var choix = lire();
    if (choix === 'oui') chargerGA();
    else if (choix !== 'non') afficherBandeau();
    document.querySelectorAll('[data-consentement-modifier]').forEach(function (el) {
      el.addEventListener('click', afficherBandeau);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
