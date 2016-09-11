$(function() {
  // Costanti
  var FRAME_BORDER_SIZE = 10;                           // Spessore della cornice
  var PIECE_SIZE = 250;                                 // Larghezza e altezza dello scudo
  var DEFAULT_ARROW_DIR = 'img/arrows/';                // Cartella di default delle frecce
  var DEFAULT_ARROW_SRC = DEFAULT_ARROW_DIR + '1.png';  // URL freccia di default
  var BACKGROUND_MOVE_SIZE = 5;                         // Px di spostamento dell'immagine di sfondo ad ogni click
  var ZOOM_MOVE_SIZE = 0.05;                            // Percentuale di zoom dell'immagine di sfondo ad ogni click
  var DEFAULT_TEXT_SIZE = 30;                           // Grandezza in px iniziale del testo
  var DEFAULT_TEXT_COLOR = 'black';                     // Colore iniziale del testo
  var DEFAULT_TEXT_POS_FROM_BOTTOM = 100;               // Px di distanza del testo dal fondo
  var TEXT_MOVE_SIZE = BACKGROUND_MOVE_SIZE;            // Px di spostamento dell'immagine di sfondo ad ogni click
  var BORDER_FRAME = 2;                                 // Px del bordo nero della cornice

  // Elementi dello scudo
  var bigFrame = new createjs.Shape();
  var smallFrameFiller = new createjs.Shape();
  var arrow = new createjs.Bitmap();
  var background = {
    'shape': new createjs.Shape(),
    'lastImg': new Image(),
    'x': 0,
    'y': 0,
    'zoom': 1
  };

  // Testo dello scudo
  var text = new createjs.Text('', DEFAULT_TEXT_SIZE + 'px Arial', DEFAULT_TEXT_COLOR);
  text.textAlign = 'center';
  centerTextXPos();
  text.y = PIECE_SIZE - DEFAULT_TEXT_POS_FROM_BOTTOM;

  // Inizializza createjs
  var stage = new createjs.Stage('shield');

  // Disegno i bordi della cornice
  var borderFrame = new createjs.Shape();
  var smallBorderFrame = new createjs.Shape();

  stage.addChild(borderFrame);
  stage.addChild(bigFrame);
  stage.addChild(smallBorderFrame);
  stage.addChild(smallFrameFiller);
  stage.addChild(background.shape);
  stage.addChild(arrow);
  stage.addChild(text);

  // Disegna uno scudo demo
  borderFrame.graphics.beginFill('black').drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2, 8, 0, 0);
  bigFrame.graphics.beginFill('#0000ff').drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2 - BORDER_FRAME, 8, 0, 0);
  smallBorderFrame.graphics.beginFill('black').drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2 - FRAME_BORDER_SIZE + BORDER_FRAME, 8, 0, 0);
  smallFrameFiller.graphics.beginFill('white').drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2 - FRAME_BORDER_SIZE, 8, 0, 0);
  stage.update();

  // Nascondo tutti i pannelli tranne il primo
  $('#text-panel').hide();
  $('#background-panel').hide();
  $('#arrow-panel').hide();

  // Handler bottoni Avanti e Indietro
  $('#frame-next-button').click(function() {
    $('#frame-panel').hide();
    $('#arrow-panel').show();
  });

  $('#arrow-back-button').click(function() {
    $('#arrow-panel').hide();
    $('#frame-panel').show();
  });

  $('#arrow-next-button').click(function() {
    $('#arrow-panel').hide();
    $('#background-panel').show();
  });

  $('#background-back-button').click(function() {
    $('#background-panel').hide();
    $('#arrow-panel').show();
  });

  $('#background-next-button').click(function() {
    $('#background-panel').hide();
    $('#text-panel').show();
  });

  $('#text-back-button').click(function() {
    $('#text-panel').hide();
    $('#background-panel').show();
  });

  // Cambio colore cornice
  $('.frame-color').click(function() {
    bigFrame.graphics.clear();
    bigFrame.graphics.beginFill($(this).css('background-color')).drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2 - BORDER_FRAME, 8, 0, 0);
    smallFrameFiller.graphics.clear();
    smallFrameFiller.graphics.beginFill('white').drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2 - FRAME_BORDER_SIZE, 8, 0, 0);
    stage.update();
  });

  $('.frame-color').keypress(function(event) {
    if(event.which == 13)
      $(this).click();
  });

  // Cambio immagine freccia
  $('input[name="arrow-img"]').click(function () {
    var newArrow = new Image();
    newArrow.src = DEFAULT_ARROW_DIR + $(this).attr('value');
    $(":input").prop("disabled", true);
    newArrow.onload = function() {
      arrow.image = newArrow;
      arrow.x = PIECE_SIZE/2 - arrow.image.width/2;
      arrow.y = PIECE_SIZE - arrow.image.height;
      stage.update();
      $(":input").prop("disabled", false);
    };
    newArrow.onerror = function () {
      $(":input").prop("disabled", false);
      console.log('WARNING: freccia non caricata correttamente');
    };
  });

  // Carico l'immagine di sfondo da locale
  $('#background-upload').change(function (event) {
    var files = event.target.files;
    var file = files[0];
    if(files.length == 1 && file.type.match('image.*')) {
      var fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      $(":input").prop("disabled", true);
      fileReader.onload = function() {
        var tempImg = new Image();
        background.lastImg.src = fileReader.result;
        background.lastImg.onload = function() {
          background.lastImg.height = background.lastImg.naturalHeight;
          background.lastImg.width = background.lastImg.naturalWidth;
          resetBackgroundPos();
          updateBackgroundImg();
          $(":input").prop("disabled", false);
        };
        background.lastImg.onerror = function () {
          $(":input").prop("disabled", false);
          console.log('WARNING: immagine di sfondo non caricata correttamente');
        };
      };
    }
    else {
      $(":input").prop("disabled", false);
      alert('Errore: formato dell\'immagine non valido');
    }
  });

  // Muovo l'immagine di sfondo
  $('#background-up').mousehold(function() {
    background.y -= BACKGROUND_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-down').mousehold(function() {
    background.y += BACKGROUND_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-left').mousehold(function() {
    background.x -= BACKGROUND_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-right').mousehold(function() {
    background.x += BACKGROUND_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-pos-reset').click(function() {
    resetBackgroundPos();
    updateBackgroundImg();
  });

  $('#background-more-zoom').mousehold(function() {
    $('#background-less-zoom').removeClass('disabled');
    background.zoom += ZOOM_MOVE_SIZE;

    background.x -= background.lastImg.width * ZOOM_MOVE_SIZE / 2;
    background.y -= background.lastImg.height * ZOOM_MOVE_SIZE / 2;

    updateBackgroundImg();
  });

  $('#background-less-zoom').mousehold(function() {
    if(background.zoom <= ZOOM_MOVE_SIZE)
      $(this).addClass('disabled');

    background.zoom -= ZOOM_MOVE_SIZE;

    background.x += background.lastImg.width * ZOOM_MOVE_SIZE / 2;
    background.y += background.lastImg.height * ZOOM_MOVE_SIZE / 2;

    updateBackgroundImg();
  });

  $('#background-rotate').click(function() {
    var hiddenCanvas = document.createElement("canvas");
    hiddenCanvas.width = background.lastImg.naturalHeight;
    hiddenCanvas.height = background.lastImg.naturalWidth;
    var ctx = hiddenCanvas.getContext('2d');

    var halfWidth = hiddenCanvas.width / 2;
    var halfHeight = hiddenCanvas.height / 2;
    ctx.translate(halfWidth, halfHeight);
    ctx.rotate(Math.PI/2);
    ctx.drawImage(background.lastImg, -halfHeight, -halfWidth);

    var img = new Image();
    img.src = hiddenCanvas.toDataURL();
    img.width = background.lastImg.height;
    img.height = background.lastImg.width;
    img.onload = function(){
      background.lastImg = img;
      background.x += (background.lastImg.height - background.lastImg.width) / 2;
      background.y -= (background.lastImg.height - background.lastImg.width) / 2;
      updateBackgroundImg();
    };
  });

  // Cambio il testo
  $('#text-content').keyup(function() {
    text.text = $(this).val();
    stage.update();
  });

  // Cambio il colore del testo
  $('.text-color').click(function() {
    text.color = $(this).css('background-color');
    stage.update();
  });

  $('.text-color').keypress(function(event) {
    if(event.which == 13)
      $(this).click();
  });

  // Muovo il testo
  $('#text-up').mousehold(function() {
    text.y -= TEXT_MOVE_SIZE;
    stage.update();
  });

  $('#text-down').mousehold(function() {
    text.y += TEXT_MOVE_SIZE;
    stage.update();
  });

  $('#text-left').mousehold(function() {
    text.x -= TEXT_MOVE_SIZE;
    stage.update();
  });

  $('#text-right').mousehold(function() {
    text.x += TEXT_MOVE_SIZE;
    stage.update();
  });

  $('#text-pos-reset').click(function() {
    centerTextXPos();
    text.y = PIECE_SIZE - DEFAULT_TEXT_POS_FROM_BOTTOM;
    stage.update();
  });

  $('#text-more-zoom').mousehold(function() {
    $('#text-less-zoom').removeClass('disabled');
    text.scaleX += ZOOM_MOVE_SIZE;
    text.scaleY += ZOOM_MOVE_SIZE;
    stage.update();
  });

  $('#text-less-zoom').mousehold(function() {
    if(text.scaleX <= ZOOM_MOVE_SIZE)
      $(this).addClass('disabled');

    text.scaleX -= ZOOM_MOVE_SIZE;
    text.scaleY -= ZOOM_MOVE_SIZE;
    stage.update();
  });

  $('#text-align-center').click(function() {
    centerTextXPos();
    stage.update();
  });

  $('#download').click(function() {
    var canvas = $('#shield')[0];
    var hiddenCanvas = document.createElement("canvas");
    hiddenCanvas.height = canvas.height;
    hiddenCanvas.width = canvas.width;
    var ctx = hiddenCanvas.getContext('2d');

    // Ruoto di 22.5 gradi l'immagine
    ctx.translate(hiddenCanvas.width/2, hiddenCanvas.width/2);
    ctx.rotate(22.5*Math.PI/180);
    ctx.drawImage(canvas, -hiddenCanvas.width/2, -hiddenCanvas.width/2);
    ctx.translate(-hiddenCanvas.width/2, -hiddenCanvas.width/2);

    $(this).attr('href', hiddenCanvas.toDataURL().replace(/^data:image\/[^;]/, 'data:application/octet-stream'));
  });

  // Cambio l'immagine di sfondo
  function updateBackgroundImg() {
    var canvasToResize = document.createElement("canvas");
    var height = background.lastImg.height * background.zoom;
    var width = background.lastImg.width * background.zoom;

    canvasToResize.height = height + background.y;
    canvasToResize.width = width + background.x;

    var ctx = canvasToResize.getContext('2d');
    ctx.drawImage(background.lastImg, background.x, background.y, width, height);
    var imageResizedSrc = canvasToResize.toDataURL();
    var imageResized = new Image();
    imageResized.src = imageResizedSrc;
    imageResized.onload = function() {
      background.shape.graphics.clear();

      background.shape.graphics.beginBitmapFill(imageResized, 'no-repeat')
        .drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2 - FRAME_BORDER_SIZE, 8, 0, 0);

      stage.update();
    }
  }

  // Resetta i valori della posizione del background centrandolo
  function resetBackgroundPos() {
    background.zoom = 1;
    $('#background-less-zoom').removeClass('disabled');

    // Ridimensiono l'immagine
    if(background.lastImg.width > background.lastImg.height) {
      var scaleRatio = PIECE_SIZE / background.lastImg.width;
      background.lastImg.width = PIECE_SIZE;
      background.lastImg.height = scaleRatio * background.lastImg.height;
    } else {
      var scaleRatio = PIECE_SIZE / background.lastImg.height;
      background.lastImg.height = PIECE_SIZE;
      background.lastImg.width = scaleRatio * background.lastImg.width;
    }

    background.x = (PIECE_SIZE - background.lastImg.width)/2;
    background.y = (PIECE_SIZE - background.lastImg.height)/2;
  }

  // Centra il testo dello scudo in orizzontale
  function centerTextXPos() {
    text.x = PIECE_SIZE / 2;
  }
});
