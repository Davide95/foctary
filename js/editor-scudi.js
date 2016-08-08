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

// Elementi dello scudo
var bigFrame = new createjs.Shape();
var smallFrameFiller = new createjs.Shape();
var arrow = new createjs.Bitmap();
var background = {
  'shape': new createjs.Shape(),
  lastImg: new Image(),
  x: 0,
  y: 0,
  zoom: 1
};

var text = new createjs.Text('', DEFAULT_TEXT_SIZE + 'px Arial', DEFAULT_TEXT_COLOR);
text.y = PIECE_SIZE - DEFAULT_TEXT_POS_FROM_BOTTOM;

$(function() {
  // Inizializza createjs e gli elementi dello scudo
  var stage = new createjs.Stage('shield');
  stage.addChild(bigFrame);
  stage.addChild(smallFrameFiller);
  stage.addChild(background.shape);
  stage.addChild(arrow);
  stage.addChild(text);

  // Disegna uno scudo demo
  bigFrame.graphics.beginFill('#0000ff').drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2, 8, 0, 0);
  smallFrameFiller.graphics.beginFill('white').drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2 - FRAME_BORDER_SIZE, 8, 0, 0);
  stage.update();

  // Carico la freccia di default
  var defaultArrow = new Image();
  defaultArrow.src = DEFAULT_ARROW_SRC;
  $(":input").prop("disabled", true);
  defaultArrow.onload = function() {
    arrow.image = defaultArrow;
    arrow.x = PIECE_SIZE/2 - arrow.image.width/2;
    arrow.y = PIECE_SIZE - arrow.image.height;
    stage.update();
    $(":input").prop("disabled", false);
  };
  defaultArrow.onerror = function () {
    $(":input").prop("disabled", false);
    console.log('WARNING: freccia di default non caricata correttamente');
  };

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
    bigFrame.graphics.beginFill($(this).css('background-color')).drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2, 8, 0, 0);
    smallFrameFiller.graphics.clear();
    smallFrameFiller.graphics.beginFill('white').drawPolyStar(PIECE_SIZE/2, PIECE_SIZE/2, PIECE_SIZE/2 - FRAME_BORDER_SIZE, 8, 0, 0);
    stage.update();
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
        background.lastImg.src = fileReader.result;
        background.lastImg.onload = function() {
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
  $('#background-up').click(function() {
    background.y -= BACKGROUND_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-up').mousehold(function() {
    $(this).click();
  });

  $('#background-down').click(function() {
    background.y += BACKGROUND_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-down').mousehold(function() {
    $(this).click();
  });

  $('#background-left').click(function() {
    background.x -= BACKGROUND_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-left').mousehold(function() {
    $(this).click();
  });

  $('#background-right').click(function() {
    background.x += BACKGROUND_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-right').mousehold(function() {
    $(this).click();
  });

  $('#background-pos-reset').click(function() {
    resetBackgroundPos();
    updateBackgroundImg();
  });

  $('#background-more-zoom').click(function() {
    $('#background-less-zoom').removeClass('disabled');
    background.zoom += ZOOM_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-more-zoom').mousehold(function() {
    $(this).click();
  });

  $('#background-less-zoom').click(function() {
    if(background.zoom <= ZOOM_MOVE_SIZE)
      $(this).addClass('disabled');

    background.zoom -= ZOOM_MOVE_SIZE;
    updateBackgroundImg();
  });

  $('#background-less-zoom').mousehold(function() {
    $(this).click();
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

  // Muovo il testo
  $('#text-up').click(function() {
    text.y -= TEXT_MOVE_SIZE;
    stage.update();
  });

  $('#text-up').mousehold(function() {
    $(this).click();
  });

  $('#text-down').click(function() {
    text.y += TEXT_MOVE_SIZE;
    stage.update();
  });

  $('#text-down').mousehold(function() {
    $(this).click();
  });

  $('#text-left').click(function() {
    text.x -= TEXT_MOVE_SIZE;
    stage.update();
  });

  $('#text-left').mousehold(function() {
    $(this).click();
  });

  $('#text-right').click(function() {
    text.x += TEXT_MOVE_SIZE;
    stage.update();
  });

  $('#text-right').mousehold(function() {
    $(this).click();
  });

  $('#text-pos-reset').click(function() {
    text.x = 0;
    text.y = PIECE_SIZE - DEFAULT_TEXT_POS_FROM_BOTTOM;
    stage.update();
  });

  $('#text-more-zoom').click(function() {
    $('#text-less-zoom').removeClass('disabled');
    text.scaleX += ZOOM_MOVE_SIZE;
    text.scaleY += ZOOM_MOVE_SIZE;
    stage.update();
  });

  $('#text-more-zoom').mousehold(function() {
    $(this).click();
  });

  $('#text-less-zoom').click(function() {
    if(text.scaleX <= ZOOM_MOVE_SIZE)
      $(this).addClass('disabled');

    text.scaleX -= ZOOM_MOVE_SIZE;
    text.scaleY -= ZOOM_MOVE_SIZE;
    stage.update();
  });

  $('#text-less-zoom').mousehold(function() {
    $(this).click();
  });

  $('#text-align-center').click(function() {
    text.x = (PIECE_SIZE - text.getMeasuredWidth() * text.scaleX) / 2;
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
    background.x = (PIECE_SIZE - background.lastImg.width)/2;
    background.y = (PIECE_SIZE - background.lastImg.height)/2;
  }
});