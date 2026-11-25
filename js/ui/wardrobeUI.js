/* ============================================================
   CAPA DE UI: WARDROBE & SHOP CONTROLLER
   Lógica y controladores de la pantalla de vestidor y tienda
   4 Pestañas: Personajes, Patinetas, Mejoras y Colecciones
   ============================================================ */

function renderSS() {
  var curCoins = totalCoins + coins;

  // Actualizar contadores de recursos en la barra superior
  if ($('ssKeysVal')) $('ssKeysVal').textContent = totalKeys;
  if ($('ssCoinsVal')) $('ssCoinsVal').textContent = curCoins;
  if ($('ssBoardsVal')) $('ssBoardsVal').textContent = totalBoards;
  if ($('ssMultVal')) $('ssMultVal').textContent = 'x' + mult;

  // Actualizar botones de navegación inferior
  document.querySelectorAll('.ss-nav-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === activeSSTab);
  });

  // Mostrar pestaña activa
  ['characters', 'boards', 'upgrades', 'collections'].forEach(function (tab) {
    var el = $('tab-' + tab);
    if (el) el.hidden = (tab !== activeSSTab);
  });

  if (activeSSTab === 'characters') renderSSCharacters();
  else if (activeSSTab === 'boards') renderSSBoards();
  else if (activeSSTab === 'upgrades') renderSSUpgrades();
  else if (activeSSTab === 'collections') renderSSCollections();
}

function renderSSCharacters() {
  var cObj = CHARACTERS.find(function (c) { return c.id === selectedCharId; }) || CHARACTERS[0];
  var oObj = cObj.outfits.find(function (o) { return o.id === selectedOutfitId; }) || cObj.outfits[0];

  if ($('ssCharName')) $('ssCharName').textContent = cObj.name;
  if ($('ssOutfitName')) $('ssOutfitName').textContent = oObj.name;
  if ($('ssCharHeart')) $('ssCharHeart').textContent = cObj.fav ? '❤️' : '🤍';

  // 1. Columna lateral de Outfits
  var ofStack = $('ssOutfitSidebar');
  if (ofStack) {
    ofStack.innerHTML = '';
    cObj.outfits.forEach(function (outfit) {
      var thumb = document.createElement('div');
      var isCurrent = (outfit.id === selectedOutfitId);
      thumb.className = 'ss-outfit-thumb' + (isCurrent ? ' active' : '');
      thumb.style.background = 'linear-gradient(135deg,' + outfit.b + ' 40%,' + outfit.h + ' 100%)';
      thumb.title = outfit.name;
      thumb.textContent = outfit.star ? '⭐' : (outfit.headphones ? '🎧' : (outfit.visor ? '⚡' : '🧢'));
      thumb.addEventListener('click', function () {
        selectedOutfitId = outfit.id;
        renderSS();
      });
      ofStack.appendChild(thumb);
    });
  }

  // 2. Botón de acción (Selected / Select / Desbloquear)
  var actBtn = $('ssActionBtn');
  if (actBtn) {
    var isEquipped = (selectedCharId === activeCharId && selectedOutfitId === activeOutfitId);
    var isUnlocked = (unlockedChars.indexOf(selectedCharId) !== -1 && unlockedOutfits.indexOf(selectedOutfitId) !== -1);
    var curCoins = totalCoins + coins;

    if (isEquipped) {
      actBtn.textContent = 'Selected';
      actBtn.className = 'ss-big-btn selected';
      actBtn.disabled = true;
    } else if (isUnlocked) {
      actBtn.textContent = 'Select';
      actBtn.className = 'ss-big-btn select';
      actBtn.disabled = false;
      actBtn.onclick = function () {
        activeCharId = selectedCharId;
        activeOutfitId = selectedOutfitId;
        try {
          localStorage.setItem('subwaydev-char', activeCharId);
          localStorage.setItem('subwaydev-outfit', activeOutfitId);
        } catch (e) {}
        sfx('power');
        toast('¡' + oObj.name + ' seleccionado!', 2000);
        renderSS();
      };
    } else {
      var costText = oObj.coinsNeed > 0 ? (oObj.coinsNeed + ' 🪙') : (oObj.keysNeed + ' 🔑');
      actBtn.textContent = 'Desbloquear (' + costText + ')';
      actBtn.className = 'ss-big-btn buy';
      var canAfford = (oObj.coinsNeed > 0 ? curCoins >= oObj.coinsNeed : totalKeys >= oObj.keysNeed);
      actBtn.disabled = !canAfford;
      actBtn.onclick = function () {
        if (oObj.coinsNeed > 0 && curCoins >= oObj.coinsNeed) {
          totalCoins = Math.max(0, curCoins - oObj.coinsNeed);
          coins = 0;
          try { localStorage.setItem('subwaydev-totalcoins', String(totalCoins)); } catch (e) {}
        } else if (oObj.keysNeed > 0 && totalKeys >= oObj.keysNeed) {
          totalKeys = Math.max(0, totalKeys - oObj.keysNeed);
          try { localStorage.setItem('subwaydev-totalkeys', String(totalKeys)); } catch (e) {}
        } else return;

        if (unlockedChars.indexOf(selectedCharId) === -1) unlockedChars.push(selectedCharId);
        if (unlockedOutfits.indexOf(selectedOutfitId) === -1) unlockedOutfits.push(selectedOutfitId);
        try {
          localStorage.setItem('subwaydev-unlocked-chars', JSON.stringify(unlockedChars));
          localStorage.setItem('subwaydev-unlocked-outfits', JSON.stringify(unlockedOutfits));
        } catch (e) {}

        activeCharId = selectedCharId;
        activeOutfitId = selectedOutfitId;
        try {
          localStorage.setItem('subwaydev-char', activeCharId);
          localStorage.setItem('subwaydev-outfit', activeOutfitId);
        } catch (e) {}

        sfx('token');
        toast('¡' + oObj.name + ' desbloqueado!', 2500);
        renderSS();
      };
    }
  }

  // 3. Grid inferior de personajes
  var grid = $('ssCharGrid');
  if (grid) {
    grid.innerHTML = '';
    var query = ($('ssCharSearch') ? $('ssCharSearch').value : '').toLowerCase().trim();
    CHARACTERS.forEach(function (char) {
      if (query && char.name.toLowerCase().indexOf(query) === -1 && char.sub.toLowerCase().indexOf(query) === -1) return;
      var card = document.createElement('div');
      var isSelected = (char.id === selectedCharId);
      var isCharUnlocked = (unlockedChars.indexOf(char.id) !== -1);
      card.className = 'ss-char-card' + (isSelected ? ' active' : '') + (!isCharUnlocked ? ' locked' : '');

      card.innerHTML =
        '<span class="ss-char-card-badge">' + char.badge + '</span>' +
        '<div class="ss-char-card-avatar" style="background:linear-gradient(135deg,' + char.outfits[0].b + ' 40%,' + char.outfits[0].h + ' 100%)">' + char.icon + '</div>' +
        '<h5 class="ss-char-card-name">' + char.name + '</h5>' +
        '<span class="ss-char-card-check">' + (isCharUnlocked ? '✓' : '🔒') + '</span>';

      card.addEventListener('click', function () {
        selectedCharId = char.id;
        selectedOutfitId = char.outfits[0].id;
        renderSS();
      });
      grid.appendChild(card);
    });
  }
}

function renderSSBoards() {
  var cont = $('ssBoardsContainer');
  if (!cont) return;
  cont.innerHTML = '<h3 style="font-family:var(--display);font-size:22px;margin:0 0 4px;color:#1e3a8a">HOVERBOARDS</h3><p style="margin:0 0 12px;font-size:14px;color:#64748b">Activa tu patineta con doble tap o tecla H para protegerte de choques.</p>';
  var curCoins = totalCoins + coins;

  BOARDS_DATA.forEach(function (b) {
    var row = document.createElement('div');
    var isEquipped = (b.id === activeBoardId);
    var isUnlocked = (unlockedBoards.indexOf(b.id) !== -1);
    row.className = 'ss-item-row' + (isEquipped ? ' active' : '');

    var leftHtml =
      '<div class="ss-item-icon" style="background:linear-gradient(135deg,' + b.col + ' 40%,' + b.col2 + ' 100%)">' + b.icon + '</div>' +
      '<div class="ss-item-info">' +
        '<h4>' + b.name + '</h4>' +
        '<p>' + b.desc + '</p>' +
      '</div>';

    var btnHtml = '';
    if (isEquipped) {
      btnHtml = '<button class="ss-big-btn selected" style="font-size:14px;padding:6px 18px" disabled>Equipada</button>';
    } else if (isUnlocked) {
      btnHtml = '<button class="ss-big-btn select" style="font-size:14px;padding:6px 18px">Equipar</button>';
    } else {
      btnHtml = '<button class="ss-big-btn buy" style="font-size:14px;padding:6px 18px"' + (curCoins < b.coinsNeed ? ' disabled' : '') + '>Comprar (' + b.coinsNeed + ' 🪙)</button>';
    }

    row.innerHTML = leftHtml + btnHtml;
    var btnEl = row.querySelector('button');
    if (btnEl && !isEquipped) {
      btnEl.addEventListener('click', function () {
        if (isUnlocked) {
          activeBoardId = b.id;
          try { localStorage.setItem('subwaydev-board', activeBoardId); } catch (e) {}
          sfx('boardon');
          toast('¡Patineta ' + b.name + ' equipada!', 2000);
        } else if (curCoins >= b.coinsNeed) {
          totalCoins = Math.max(0, curCoins - b.coinsNeed);
          coins = 0;
          try { localStorage.setItem('subwaydev-totalcoins', String(totalCoins)); } catch (e) {}
          unlockedBoards.push(b.id);
          try { localStorage.setItem('subwaydev-unlocked-boards', JSON.stringify(unlockedBoards)); } catch (e) {}
          activeBoardId = b.id;
          try { localStorage.setItem('subwaydev-board', activeBoardId); } catch (e) {}
          sfx('power');
          toast('¡Patineta ' + b.name + ' desbloqueada!', 2200);
        }
        renderSS();
      });
    }
    cont.appendChild(row);
  });
}

function renderSSUpgrades() {
  var cont = $('ssUpgradesContainer');
  if (!cont) return;
  cont.innerHTML = '<h3 style="font-family:var(--display);font-size:22px;margin:0 0 4px;color:#1e3a8a">MEJORAS DE POWER-UPS</h3><p style="margin:0 0 12px;font-size:14px;color:#64748b">Gasta tus monedas acumuladas para extender la duración de tus poderes en carrera.</p>';
  var curCoins = totalCoins + coins;

  UPGRADES_DATA.forEach(function (up) {
    var lvl = upgradeLevels[up.id] || 1;
    var cost = lvl * 100;
    var isMax = lvl >= up.max;
    var row = document.createElement('div');
    row.className = 'ss-item-row';

    var dotsHtml = '<div class="ss-level-bar">';
    for (var d = 1; d <= up.max; d++) {
      dotsHtml += '<span class="ss-level-dot' + (d <= lvl ? ' on' : '') + '"></span>';
    }
    dotsHtml += '</div>';

    var leftHtml =
      '<div class="ss-item-icon" style="background:#e0f2fe;color:#0284c7">' + up.icon + '</div>' +
      '<div class="ss-item-info">' +
        '<h4>' + up.name + ' (Nivel ' + lvl + '/' + up.max + ')</h4>' +
        '<p>' + up.desc + '</p>' +
        dotsHtml +
      '</div>';

    var btnHtml = isMax
      ? '<button class="ss-big-btn selected" style="font-size:14px;padding:6px 14px" disabled>MAX</button>'
      : '<button class="ss-big-btn buy" style="font-size:13px;padding:6px 14px"' + (curCoins < cost ? ' disabled' : '') + '>Subir (' + cost + ' 🪙)</button>';

    row.innerHTML = leftHtml + btnHtml;
    var btnEl = row.querySelector('button');
    if (btnEl && !isMax) {
      btnEl.addEventListener('click', function () {
        if (curCoins >= cost) {
          totalCoins = Math.max(0, curCoins - cost);
          coins = 0;
          upgradeLevels[up.id] = lvl + 1;
          try {
            localStorage.setItem('subwaydev-totalcoins', String(totalCoins));
            localStorage.setItem('subwaydev-upgrades', JSON.stringify(upgradeLevels));
          } catch (e) {}
          refreshPWDUR();
          sfx('power');
          toast('¡' + up.name + ' mejorado a Nivel ' + (lvl + 1) + '!', 2200);
          renderSS();
        }
      });
    }
    cont.appendChild(row);
  });
}

function renderSSCollections() {
  var cont = $('ssCollectionsContainer');
  if (!cont) return;
  cont.innerHTML = '<h3 style="font-family:var(--display);font-size:22px;margin:0 0 4px;color:#1e3a8a">COLECCIONES & RECOMPENSAS</h3><p style="margin:0 0 12px;font-size:14px;color:#64748b">Desbloquea las estaciones del portafolio en carrera para reclamar premios.</p>';

  COLLECTIONS_DATA.forEach(function (col, idx) {
    var isUnlocked = found[idx] || (unlocked() > idx);
    var isClaimed = (claimedCollections.indexOf(col.id) !== -1);
    var row = document.createElement('div');
    row.className = 'ss-item-row' + (isClaimed ? ' active' : '');

    var leftHtml =
      '<div class="ss-item-icon" style="background:#fef3c7;color:#d97706">🎫</div>' +
      '<div class="ss-item-info">' +
        '<h4>' + col.name + '</h4>' +
        '<p>' + col.desc + '</p>' +
        '<span style="font-size:12px;font-weight:700;color:#059669">+' + col.rCoins + ' 🪙  +' + col.rKeys + ' 🔑</span>' +
      '</div>';

    var btnHtml = '';
    if (isClaimed) {
      btnHtml = '<button class="ss-big-btn selected" style="font-size:13px;padding:6px 14px" disabled>Reclamado ✓</button>';
    } else if (isUnlocked) {
      btnHtml = '<button class="ss-big-btn select" style="font-size:13px;padding:6px 14px">¡Reclamar!</button>';
    } else {
      btnHtml = '<button class="ss-big-btn" style="font-size:13px;padding:6px 14px;background:#cbd5e1;color:#64748b" disabled>Bloqueado 🔒</button>';
    }

    row.innerHTML = leftHtml + btnHtml;
    var btnEl = row.querySelector('button');
    if (btnEl && isUnlocked && !isClaimed) {
      btnEl.addEventListener('click', function () {
        claimedCollections.push(col.id);
        totalCoins += col.rCoins;
        totalKeys += col.rKeys;
        try {
          localStorage.setItem('subwaydev-claimed-col', JSON.stringify(claimedCollections));
          localStorage.setItem('subwaydev-totalcoins', String(totalCoins));
          localStorage.setItem('subwaydev-totalkeys', String(totalKeys));
        } catch (e) {}
        sfx('token');
        toast('¡Recompensa reclamada: +' + col.rCoins + ' monedas y +' + col.rKeys + ' llaves!', 2500);
        renderSS();
      });
    }
    cont.appendChild(row);
  });
}

function openSkins() {
  if (state !== 'skins') prevState = state;
  state = 'skins';
  showFor('skins');
  renderSS();
  startShowcaseLoop();
  blurAll();
}

function closeSkins() {
  stopShowcaseLoop();
  state = prevState || 'start';
  showFor(state);
  if (state === 'start') refreshStart();
  blurAll();
}

function renderSkins() {
  renderSS();
}

// Inicialización de escuchadores de eventos para la pantalla de vestidor
function initWardrobeListeners() {
  document.querySelectorAll('.ss-nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeSSTab = btn.getAttribute('data-tab');
      sfx('tap');
      renderSS();
    });
  });

  if ($('ssCharHeart')) {
    $('ssCharHeart').addEventListener('click', function () {
      var cObj = CHARACTERS.find(function (c) { return c.id === selectedCharId; });
      if (cObj) {
        cObj.fav = !cObj.fav;
        sfx('token');
        renderSSCharacters();
      }
    });
  }

  if ($('ssCharSearch')) {
    $('ssCharSearch').addEventListener('input', function () {
      renderSSCharacters();
    });
  }

  if ($('ssAddKeysBtn')) {
    $('ssAddKeysBtn').addEventListener('click', function () {
      totalKeys += 5;
      try { localStorage.setItem('subwaydev-totalkeys', String(totalKeys)); } catch (e) {}
      sfx('token');
      toast('¡+5 Llaves añadidas a tu inventario!', 1800);
      renderSS();
    });
  }

  if ($('ssAddCoinsBtn')) {
    $('ssAddCoinsBtn').addEventListener('click', function () {
      totalCoins += 500;
      try { localStorage.setItem('subwaydev-totalcoins', String(totalCoins)); } catch (e) {}
      sfx('coin');
      toast('¡+500 Monedas doradas añadidas!', 1800);
      renderSS();
    });
  }

  if ($('ssAddBoardsBtn')) {
    $('ssAddBoardsBtn').addEventListener('click', function () {
      totalBoards += 10;
      try { localStorage.setItem('subwaydev-totalboards', String(totalBoards)); } catch (e) {}
      sfx('boardon');
      toast('¡+10 Hoverboards listas para surfear!', 1800);
      renderSS();
    });
  }

  if ($('ssSoundToggle')) {
    $('ssSoundToggle').addEventListener('click', function () {
      sfxOn = !sfxOn;
      musicOn = sfxOn;
      if (!musicOn) musicStop();
      else if (state === 'play') musicStart();
      toast(sfxOn ? 'Sonido del juego activado 🔊' : 'Sonido del juego silenciado 🔇', 1800);
    });
  }

  if ($('closeSkinsModal')) {
    $('closeSkinsModal').addEventListener('click', closeSkins);
  }
}
