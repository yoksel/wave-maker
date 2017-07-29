'use strict';

var doc = document;
var $ = tinyLib;
var isCmdPressed = false;

var svg = $.get('.svg');
var targetPath = $.get('.shape-arc');

var popup = $.get('.popup');
var popupOpenedClass = 'popup--opened';
var popupToggle = $.get('.popup__toggle');

var code = $.get('.code');
var codeOutput = $.get('.code__textarea');
var codeButton = $.get('.code__toggle');

var waveTypesItems = $.get('.wave-types__items');

var pathCoordsAttrs = $.get('.path-coords__attrs');
var attrsClass = 'attrs';
var itemClass = attrsClass + '__item';
var itemLineClass = itemClass + '--line';
var inputClass = attrsClass + '__input';
var inputErrorClass = inputClass + '--error';
var labelClass = attrsClass + '__label';
var labelLineClass = labelClass + '--line';
var labelHiddenClass = labelClass + '--hidden';
var errorClass = attrsClass + '__error';

var pathCoordsList = [{
    prop: 'startLetter'
  },
  {
    prop: 'startX',
    desc: 'start X'
  },
  {
    prop: 'startY',
    desc: 'start Y'
  },
  {
    prop: 'arcLetter'
  },
  {
    prop: 'rX',
    desc: 'rx',
    min: 0
  },
  {
    prop: 'rY',
    desc: 'ry',
    min: 0
  },
  {
    prop: 'xRot',
    desc: 'x-axis-rotation',
  },
  {
    prop: 'largeArc',
    desc: 'large-arc-flag',
    min: 0,
    max: 1
  },
  {
    prop: 'sweep',
    desc: 'sweep-flag',
    min: 0,
    max: 1
  },
  {
    prop: 'endX',
    desc: 'end X'
  },
  {
    prop: 'endY',
    desc: 'end Y'
  },
];

var pathParams = $.get('.path-params');
var pathParamsList = [{
    prop: 'repeat',
    desc: 'repeat',
    min: 0
  },
  {
    prop: 'strokeWidth',
    desc: 'stroke-width',
    min: 1
  }
];

var flags = $.get('.flags');
var flagsList = [
  {
    prop: 'rotateLargeArc',
    desc: 'larg-arc-flag',
    type: 'checkbox',
    disableCond: {
      prop: 'repeat',
      value: 0
    }
  },
  {
    prop: 'rotateSweep',
    desc: 'sweep-flag',
    type: 'checkbox',
    disableCond: {
      prop: 'repeat',
      value: 0
    }
  }
];

var inputsToDisable = [];

var wavesInputsList = {
  radiowave: {
    startX: 150,
    startY: 200,
    rX: 80,
    rY: 100,
    endY: 200,
    endX: 300,
    xRot: 0,
    largeArc: 0,
    sweep: 0,
    repeat: 4,
    rotateSweep: true,
    rotateLargeArc: false,
    strokeWidthBtn: 18
  },
  seawave: {
    startX: 150,
    startY: 200,
    rX: 80,
    rY: 100,
    endX: 300,
    endY: 200,
    xRot: 0,
    largeArc: 0,
    sweep: 0,
    repeat: 4,
    repeatBtn: 2,
    rotateSweep: false,
    rotateLargeArc: false,
    strokeWidthBtn: 11
  },
  lightbulbs: {
    startX: 150,
    startY: 200,
    rX: 80,
    rY: 80,
    endX: 250,
    endY: 200,
    xRot: 0,
    largeArc: 1,
    sweep: 1,
    repeat: 6,
    rotateSweep: true,
    rotateLargeArc: false,
    strokeWidthBtn: 21
  },
  cursive: {
    startX: 150,
    startY: 200,
    rX: 20,
    rY: 90,
    endX: 300,
    endY: 200,
    xRot: 60,
    largeArc: 1,
    sweep: 0,
    repeat: 4,
    rotateSweep: true,
    rotateLargeArc: false,
    strokeWidthBtn: 20
  },
  bubbles: {
    startX: 150,
    startY: 220,
    rX: 80,
    rY: 80,
    endX: 230,
    endY: 130,
    xRot: 0,
    largeArc: 0,
    sweep: 0,
    repeat: 7,
    rotateSweep: true,
    rotateLargeArc: true,
    strokeWidthBtn: 16
  },
  leaves: {
    startX: 150,
    startY: 220,
    rX: 160,
    rY: 200,
    endX: 230,
    endY: 50,
    xRot: 0,
    largeArc: 0,
    sweep: 1,
    repeat: 7,
    rotateSweep: false,
    rotateLargeArc: false,
    strokeWidthBtn: 15
  },
  circle: {
    hidden: true,
    startX: 200,
    startY: 50,
    rX: 100,
    rY: 100,
    endX: 200,
    endY: 300,
    xRot: 0,
    largeArc: 0,
    sweep: 0,
    repeat: 1,
    rotateSweep: false,
    rotateLargeArc: true
    }
};

//---------------------------------------------

var Arc = function (params) {

  this.params = params;
  this.path = params.path || targetPath;
  this.hasControls = params.hasControls || false;
  this.startLetter = 'M';
  this.arcLetter = 'A';
  this.startX = params.startX || 150;
  this.startY = params.startY || 200;
  this.endX = params.endX || 400;
  this.endY = params.endY || 200;
  this.rX = params.rX || 130;
  this.rY = params.rY || 120;
  this.xRot = params.xRot || 0;
  this.largeArc = params.largeArc || 0;
  this.sweep = params.sweep || 0;
  this.repeat = params.repeat || 0;
  this.strokeWidth = params.strokeWidth || 5;
  this.pathCoordsInputs = [];

  this.rotateSweep = params.rotateSweep !== undefined ? params.rotateSweep : true;
  this.rotateLargeArc = params.rotateLargeArc !== undefined ? params.rotateLargeArc : false;

  if (this.hasControls) {
    this.addHelpers();
    this.addControls();

  }
  this.getPathCoords();
  this.setPathCoords();

  if (this.hasControls) {
    this.addPathParams({
      list: pathCoordsList,
      target: pathCoordsAttrs,
      itemIsLine: false,
      labelIsHidden: true,
    });
    this.addPathParams({
      list: pathParamsList,
      target: pathParams,
      itemIsLine: true,
      labelIsHidden: false,
    });
    this.addPathParams({
      list: flagsList,
      target: flags,
      itemIsLine: true,
      labelIsHidden: false,
    });

    this.addWaveInputs();
  }
};

//---------------------------------------------

Arc.prototype.getPathCoords = function () {
  this.pathCoordsSet = {
    startLetter: this.startLetter,
    startX: this.startX,
    startY: this.startY,
    arcLetter: this.arcLetter,
    rX: this.rX,
    rY: this.rY,
    xRot: this.xRot,
    largeArc: this.largeArc,
    sweep: this.sweep,
    endX: this.endX,
    endY: this.endY
  };

  for (var key in this.pathCoordsSet) {
    var item = this.pathCoordsSet[key];
    if (!isNaN(item)) {
      this.pathCoordsSet[key] = Math.round(item);
    }
  }

  var pathVals = Object.values(this.pathCoordsSet);
  this.pathCoords = pathVals.join(' ');
};

//---------------------------------------------

Arc.prototype.setPathCoords = function () {
  this.path.attr({
    'd': this.pathCoords,
    'stroke-width': this.strokeWidth
  });
  this.path.rect = this.path.elem.getBBox();

  this.addWaves();

  if(this.hasControls) {
    this.setAllHelperArcParams();
    this.setAllControlsParams();
    this.updateCode();
  }
};

//---------------------------------------------

Arc.prototype.addControls = function () {
  var that = this;
  this.controls = {
    start: {
      coordsFunc: this.getStartCoords,
      fill: 'greenyellow',
      targets: {
        'startX': getMouseX,
        'startY': getMouseY
      }
    },
    end: {
      coordsFunc: this.getEndCoords,
      fill: 'greenyellow',
      targets: {
        'endX': getMouseX,
        'endY': getMouseY
      }
    },
    // I dont't know how to place them on path
    // with rotation and if startY != endY
    // rx: {
    //   coordsFunc: this.getRxCoords,
    //   targets: {
    //     'rX': this.getRX
    //   }
    // },
    // ry: {
    //   coordsFunc: this.getRyCoords,
    //   targets: {
    //     'rY': this.getRY
    //   }
    // }
  };

  for (var key in this.controls) {
    var set = this.controls[key];
    set.elemSet = $.createNS('circle')
      .attr({
        id: key,
        r: 7
      })
      .addClass('point-control');

    svg.append(set.elemSet);

    set.elemSet.elem.addEventListener('mousedown', function (event) {
      that.currentControl = that.controls[this.id];
      doc.onmousemove = function (event) {
        that.drag(event);
      }
    });
  }
};

//---------------------------------------------

Arc.prototype.getStartCoords = function () {
  return {
    cx: this.startX ? this.startX : 0,
    cy: this.startY ? this.startY : 0
  }
};

//---------------------------------------------

Arc.prototype.getEndCoords = function () {
  return {
    cx: this.endX ? this.endX : 0,
    cy: this.endY ? this.endY : 0
  }
};

//---------------------------------------------

Arc.prototype.getRxCoords = function () {
  return {
    cx: (this.arcHelpers.flipBoth.rect.x + this.arcHelpers.flipBoth.rect.width),
    cy: (this.arcHelpers.flipBoth.rect.y + this.rY)
  }
};

Arc.prototype.getRX = function (event) {
  var rect = this.arcHelpers.flipBoth.rect;
  var offset = event.offsetX - (rect.x + rect.width);
  var rX = this.rX + offset;
  return rX;
};

//---------------------------------------------

Arc.prototype.getRyCoords = function () {
  return {
    cx: (this.path.rect.x + this.path.rect.width / 2),
    cy: (this.path.rect.y + this.path.rect.height)
  }
};

Arc.prototype.getRY = function (event) {
  var rect = this.path.rect;
  var offset = event.offsetY - (rect.y + rect.height);
  var rY = this.rY + offset;
  return rY;
}

//---------------------------------------------

Arc.prototype.setAllControlsParams = function () {
  for (var key in this.controls) {
    var set = this.controls[key];
    var coords = set.coordsFunc.apply(this);

    set.elemSet.attr({
      cx: coords.cx,
      cy: coords.cy,
    });
  }
};

//---------------------------------------------

Arc.prototype.drag = function (event) {
  var x = event.offsetX;
  var y = event.offsetY;
  var targets = this.currentControl.targets;

  for (var target in targets) {
    this[target] = targets[target].call(this, event);
  }

  this.getPathCoords();
  this.setPathCoords();
  this.updateInputs();

  doc.onmouseup = function () {
    doc.onmousemove = null;
    this.currentControl = null;
  };
};

//---------------------------------------------

Arc.prototype.addHelpers = function () {
  this.arcHelpers = {};
  this.arcHelpers.flipBoth = this.addHelperArc({
    id: 'arcHelper-flipSweepAndArc',
    flipSweep: true,
    flipLargeArc: true,
    // stroke: 'seagreen'
  });
  this.arcHelpers.flipArc = this.addHelperArc({
    id: 'arcHelper-flipArc',
    flipSweep: false,
    flipLargeArc: true,
    // stroke: 'orangered'
  });
  this.arcHelpers.flipSweep = this.addHelperArc({
    id: 'arcHelper-flipSweep',
    flipSweep: true,
    flipLargeArc: false,
    // stroke: 'royalblue'
  });

  this.arcHelpers.list = [
    this.arcHelpers.flipBoth,
    this.arcHelpers.flipArc,
    this.arcHelpers.flipSweep
  ];
};

//---------------------------------------------

Arc.prototype.addHelperArc = function (params) {
  var arcHelper = {};
  arcHelper.params = params;
  arcHelper.elemSet = $.createNS('path')
    .attr({
      'id': params.id,
      'fill': 'none',
      'stroke': params.stroke || '#999'
    });

  svg.prepend(arcHelper.elemSet);
  return arcHelper;
};

//---------------------------------------------

Arc.prototype.setHelperArcParams = function (arcHelper) {
  var arcParamsSet = Object.assign({}, this.pathCoordsSet);

  if (arcHelper.params) {
    if (arcHelper.params.flipLargeArc) {
      arcParamsSet.largeArc = +!arcParamsSet.largeArc;
    }
    if (arcHelper.params.flipSweep) {
      arcParamsSet.sweep = +!arcParamsSet.sweep;
    }
  }

  var arcParams = Object.values(arcParamsSet).join(' ');

  arcHelper.elemSet.attr({
    'd': arcParams
  });
  arcHelper.rect = arcHelper.elemSet.elem.getBBox();
};

//---------------------------------------------

Arc.prototype.setAllHelperArcParams = function () {
  var that = this;
  this.arcHelpers.list.map(function (item) {
    that.setHelperArcParams(item);
  });
};

//---------------------------------------------

Arc.prototype.changeValueByKeyboard = function (event, input, error) {
  if (!(event.keyCode == 38 || event.keyCode == 40)) {
    return;
  }

  var step = 1;

  if (event.shiftKey && (event.ctrlKey || isCmdPressed)) {
    step = 1000;
  } else if (event.ctrlKey || isCmdPressed) {
    step = 100;
  } else if (event.shiftKey) {
    step = 10;
  }

  if (event.keyCode === 38) {
    input.value = +input.value + step;
  } else {
    input.value = +input.value - step;
  }

  setInputWidth.apply(input);

  if (!checkValue.apply(input, [error])) {
    return false;
  }

  this[input.name] = input.value;
  this.getPathCoords();
  this.setPathCoords();
};

//---------------------------------------------

Arc.prototype.updateInputs = function () {
  var that = this;

  this.pathCoordsInputs.forEach(function (item) {
    var name = item.elem.name;
    if (that[name] == null) {
      return;
    }
    var value = +item.elem.value;
    var newValue = that.pathCoordsSet[name] || that[name];

    if (item.elem.type === 'checkbox') {
      item.elem.checked = !!that[name];
      return;
    }

    item.elem.value = newValue;

    if (value !== newValue) {
      setInputWidth.apply(item.elem);
    }

    disableInputs.call(item.elem);
  });
};

//---------------------------------------------

Arc.prototype.createInput = function (item) {
  var name = item.prop;
  var value = this[name];

  var input = $.create('input')
    .attr({
      type: item.type || 'text',
      name: name,
      id: name,
      value: value
    })
    .addClass([
      inputClass,
      inputClass + '--' + name,
      inputClass + '--' + typeof (value)
    ]);

  if (item.min !== undefined && item.min !== null) {
    input.attr({
      min: item.min
    });
  }
  if (item.max) {
    input.attr({
      max: item.max
    });
  }
  if (typeof (value) === 'string') {
    input.attr({
      'disabled': ''
    });
  }
  else if (typeof (value) === 'boolean' && value === true) {
    input.attr({
      checked: value
    });
  }


  if (item.disableCond) {
    var cond = item.disableCond;

    if (this[cond.prop] === cond.value) {
      input.elem.disabled = true;
    }

    inputsToDisable.push({
      input: input,
      disableCond: item.disableCond
    })
  }

  return input;
};

//---------------------------------------------

Arc.prototype.createLabel = function (item, params) {
  var name = item.prop;
  var value = this[name];

  var label = $.create('label')
    .attr({
      for: name
    })
    .addClass(labelClass);

  if (params.labelIsHidden) {
    label.addClass(labelHiddenClass);
  }
  if (params.itemIsLine) {
    label.addClass(labelLineClass);
  }
  label.html(item.desc);

  return label;
};

//---------------------------------------------

Arc.prototype.createError = function (item) {
  if (item.min === undefined && item.max === undefined) {
    return null;
  }
  var error = $.create('span')
    .addClass(errorClass);

  return error;
};

//---------------------------------------------

Arc.prototype.addPathParams = function (params) {
  var that = this;
  var list = params.list;
  var target = params.target;
  var items = [];

  list.forEach(function (item) {
    var name = item.prop;
    var value = that[name];

    var input = that.createInput(item);

    var label = that.createLabel(item, params);

    var error = that.createError(item);

    var item = $.create('span')
      .addClass([
        itemClass,
        itemClass + '--' + name
      ])
      .append([input, label, error]);

    if (params.itemIsLine) {
      item.addClass(itemLineClass);
    }

    that.pathCoordsInputs.push(input);
    items.push(item);

    // Events
    input.elem.addEventListener('input', function () {
      setInputWidth.apply(this);
      if (!checkValue.apply(this, [error])) {
        return false;
      }
      that[this.name] = this.value;
      that.getPathCoords();
      that.setPathCoords();
      disableInputs.call(this);
    });

    input.elem.addEventListener('keydown', function (event) {
      if (this.type !== 'text') {
        return;
      }
      setIsCmd(event);
      that.changeValueByKeyboard(event, this, error);
      disableInputs.call(this);
    });

    input.elem.addEventListener('keyup', function (event) {
      unSetIsCmd(event);
    });

    input.elem.addEventListener('click', function (event) {
      if (this.type != 'checkbox') {
        return;
      }
      that[this.name] = this.checked;

      that.getPathCoords();
      that.setPathCoords();
    });

  });

  target.append(items);
};

//---------------------------------------------

// context: input
function disableInputs () {
  var inputId = this.id;
  var inputValue = +this.value;

  inputsToDisable.forEach(function (item) {
    var input = item.input;
    var cond = item.disableCond;

    if (inputId === cond.prop) {
      if (inputValue === cond.value) {
        input.elem.disabled = true;
      }
      else {
        input.elem.disabled = false;
      }
    }
  });
};

//---------------------------------------------

Arc.prototype.addWaves = function () {
  var wavesParamsSet = [this.pathCoords];
  if (this.repeat === 0) {
    return;
  }

  for (var i = 0; i < this.repeat; i++) {
    wavesParamsSet.push(this.addWave(i));
  }

  var wavesParams = wavesParamsSet.join(' ');
  this.path.attr({
    'd': wavesParams
  });
};

//---------------------------------------------

Arc.prototype.addWave = function (counter) {
  var arcParamsSet = {};
  var waveWidth = this.pathCoordsSet.endX - this.pathCoordsSet.startX;

  for (var key in this.pathCoordsSet) {
    arcParamsSet[key] = this.pathCoordsSet[key];
  }

  delete arcParamsSet['startLetter'];
  delete arcParamsSet['startX'];
  delete arcParamsSet['startY'];

  arcParamsSet['endX'] = this.pathCoordsSet.endX + (waveWidth * (counter + 1));
  if (counter % 2 === 0) {
    if (this.rotateSweep) {
      arcParamsSet['sweep'] = +!this.pathCoordsSet.sweep;
    }
    if (this.rotateLargeArc) {
      arcParamsSet['largeArc'] = +!this.pathCoordsSet.largeArc;
    }

    arcParamsSet['endY'] = this.pathCoordsSet.startY;
  }

  var arcParamsVals = Object.values(arcParamsSet);
  var arcParams = arcParamsVals.join(' ');
  return arcParams;
};

//---------------------------------------------

Arc.prototype.cloneParams = function () {
  var params = Object.assign({}, this.pathCoordsSet);
  params.repeat = this.repeat;
  params.rotateLargeArc = this.rotateLargeArc;
  params.rotateSweep = this.rotateSweep;
  params.strokeWidth = this.strokeWidth;

  return params;
};

//---------------------------------------------

Arc.prototype.getCode = function (params) {
  var params = params;
  var newParams = Object.assign({}, params);
  newParams.path = this.path.clone()

  if (newParams.strokeWidthBtn) {
    newParams.strokeWidth = newParams.strokeWidthBtn;
  }
  if (newParams.repeatBtn) {
    newParams.repeat = newParams.repeatBtn;
  }

  var newArc = new Arc(newParams);
  var newPath = newArc.path;
  var newPathElem = newPath.elem;
  newPathElem.removeAttribute('class');

  var copyRect = newPathElem.getBBox();
  var strokeWidth = +newArc.strokeWidth;
  var strokeWidthHalf = strokeWidth / 2;

  newArc.startX -= copyRect.x - strokeWidthHalf;
  newArc.startY -= copyRect.y - strokeWidthHalf;
  newArc.endX -= copyRect.x - strokeWidthHalf;
  newArc.endY -= copyRect.y - strokeWidthHalf;

  newArc.getPathCoords();
  newArc.setPathCoords();

  var viewBox = [
    0,
    0,
    copyRect.width + strokeWidth,
    copyRect.height + strokeWidth
  ];

  viewBox = viewBox.map(function (item) {
    return Math.round(item);
  });
  viewBox = viewBox.join(' ');

  var result = '<svg viewBox="' + viewBox + '">';
  result += newPathElem.outerHTML + '</svg>'

  return result;
};

//---------------------------------------------

Arc.prototype.updateCode = function () {
  var output = this.getCode(this.cloneParams());
  codeOutput.val(output);

  changeContentHeight.call(codeButton.elem);
};

//---------------------------------------------

Arc.prototype.addWaveInputs = function () {
  var that = this;
  var prefix = 'wave-types';
  var items = [];

  for (var key in wavesInputsList) {
    var params = wavesInputsList[key];

    if (params.hidden) {
      continue;
    }
    var demoPath = this.getCode(params);

    var button = $.create('button')
      .attr({
        type: 'button',
        name: prefix,
        id: key
      })
      .html(demoPath)
      .addClass(prefix + '__button');

    var item = $.create('div')
      .addClass(prefix + '__item')
      .append([button]);

    items.push(item);

    button.elem.addEventListener('click', function () {
      var params = wavesInputsList[this.id];

      for (var key in params) {
        that[key] = params[key];
      }

      that.getPathCoords();
      that.setPathCoords();
      that.updateInputs();
    });
  }

  waveTypesItems.append(items);
};

//---------------------------------------------

function setInputWidth() {
  if (this.type !== 'text') {
    return;
  }

  this.style.minWidth = this.value.length * .65 + 'em';
}

//---------------------------------------------

function checkValue(errorElem) {
  if (!errorElem) {
    return true;
  }

  errorElem.html('');
  this.classList.remove(inputErrorClass);

  if (isNaN(this.value)) {
    errorElem.html('not a number');
    this.classList.add(inputErrorClass);
    return false;
  } else if (this.min && this.value < this.min) {
    this.classList.add(inputErrorClass);
    errorElem.html('minimum: ' + this.min);
    return false;
  } else if (this.max && this.value > this.max) {
    this.classList.add(inputErrorClass);
    errorElem.html('maximum: ' + this.max);
    return false;
  }

  return true;
}

//---------------------------------------------

function setIsCmd(event) {
  // Chrome || FF
  if (event.keyCode == 91 || (event.key === 'Meta' && event.keyCode === 224)) {
    isCmdPressed = true;
  }
}

function unSetIsCmd(event) {
  // Chrome || FF
  if (event.keyCode == 91 || (event.key === 'Meta' && event.keyCode === 224)) {
    isCmdPressed = false;
  }
}
doc.addEventListener('keyup', function (event) {
  unSetIsCmd(event);
});


//---------------------------------------------

function getMouseX(event) {
  return event.offsetX;
}

function getMouseY(event) {
  return event.offsetY;
}

//---------------------------------------------

// Popup events
popup.forEach(function (item) {
  item.elem.addEventListener('click', function (event) {
    event.stopPropagation();
  });
});

popupToggle.forEach(function (item) {

  item.elem.addEventListener('click', function (event) {
    var parent = this.parentNode;

    if (parent.classList.contains(popupOpenedClass)) {
      parent.classList.remove(popupOpenedClass);
    }
    else {
      closeOpened();
      changeContentHeight.call(this);

      parent.classList.toggle(popupOpenedClass);
    }
  });
 });


doc.addEventListener('click', function () {
  closeOpened();
});

function closeOpened() {
  var popupPanel = $.get('.' + popupOpenedClass);

  if (popupPanel.elem) {
    popupPanel.removeClass(popupOpenedClass);
  }

}

function changeContentHeight() {
  var parent = this.parentNode;
  var container = parent.querySelector('.popup__container');
  var content = parent.querySelector('.popup__content');

  // trick to get real scrollHeight
  content.style.maxHeight = '0';
  container.style.maxHeight = (content.scrollHeight + 10) + 'px';
  content.style.maxHeight = null;
}

//---------------------------------------------

var arc = new Arc({
  path: targetPath,
  hasControls: true
});
