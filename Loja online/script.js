// Remove o fundo das imagens do carrossel (.sem-fundo) usando canvas.
(function () {
  function apagarConectado(p, w, h, ehFundo) {
    var visto = new Uint8Array(w * h);
    var pilha = [];

    function tentar(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;

      var k = y * w + x;

      if (visto[k]) return;

      var i = k * 4;

      if (!ehFundo(p[i], p[i + 1], p[i + 2], p[i + 3])) return;

      visto[k] = 1;
      pilha.push(k);
    }

    var x, y;

    for (x = 0; x < w; x++) {
      tentar(x, 0);
      tentar(x, h - 1);
    }

    for (y = 0; y < h; y++) {
      tentar(0, y);
      tentar(w - 1, y);
    }

    while (pilha.length) {
      var k = pilha.pop();

      x = k % w;
      y = (k - x) / w;

      p[k * 4 + 3] = 0;

      tentar(x + 1, y);
      tentar(x - 1, y);
      tentar(x, y + 1);
      tentar(x, y - 1);
    }
  }

  document.querySelectorAll('#banners img.sem-fundo').forEach(function (el) {
    var original = el.dataset.original;

    if (!original) return;

    var modo = el.dataset.modo || 'claro';
    var tmp = new Image();

    tmp.crossOrigin = 'anonymous';

    tmp.onload = function () {
      if (el.src !== tmp.src) return;

      try {
        var w = tmp.naturalWidth;
        var h = tmp.naturalHeight;

        var c = document.createElement('canvas');

        c.width = w;
        c.height = h;

        var ctx = c.getContext('2d');

        ctx.drawImage(tmp, 0, 0);

        var d = ctx.getImageData(0, 0, w, h);
        var p = d.data;

        if (modo === 'escuro') {
          apagarConectado(p, w, h, function (r, g, b) {
            return Math.max(r, g, b) <= 60;
          });
        } else if (modo === 'borda') {
          var r0 = p[0];
          var g0 = p[1];
          var b0 = p[2];

          var cantoTransp = p[3] < 10;
          var tol = parseInt(el.dataset.tolerancia, 10);

          if (isNaN(tol)) tol = 4;

          apagarConectado(p, w, h, function (r, g, b, a) {
            if (a < 10) return true;

            if (cantoTransp) return false;

            return Math.abs(r - r0) <= tol &&
                   Math.abs(g - g0) <= tol &&
                   Math.abs(b - b0) <= tol;
          });
        } else {
          for (var i = 0; i < p.length; i += 4) {
            var min = Math.min(p[i], p[i + 1], p[i + 2]);

            if (min >= 238) {
              p[i + 3] = 0;
            } else if (min > 205) {
              p[i + 3] = Math.round(255 * (238 - min) / 33);
            }
          }
        }

        ctx.putImageData(d, 0, 0);

        el.src = c.toDataURL('image/png');
      } catch (e) {}
    };

    tmp.src = original;
  });
})();

// Copia a imagem do card clicado para dentro do modal do produto.
(function () {
  var modal = document.getElementById('produtoModal');

  if (!modal) return;

  modal.addEventListener('show.bs.modal', function (ev) {
    var card = ev.relatedTarget;

    if (!card) return;

    var imgCard = card.querySelector('img.produto-img');
    var imgModal = modal.querySelector('.modal-img');

    if (!imgCard || !imgModal) return;

    imgModal.referrerPolicy = 'no-referrer';
    imgModal.src = imgCard.currentSrc || imgCard.src;
    imgModal.alt = imgCard.alt || '';
  });
})();

// Formulário de newsletter.
(function () {
  var form = document.getElementById('form-newsletter');

  if (!form) return;

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    alert('Inscrição realizada!');
  });
})();
