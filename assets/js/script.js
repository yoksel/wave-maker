'use strict';

var doc = document;
var $ = tinyLib;

var codeOutput = $.get('#code-attrs');
var svg = $.get('#svg');
var shapeArc = $.get('#shape-arc');
var inputClass = 'code-output__input';
var inputClassError = inputClass + '--error';
var outputList = [
  {
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

// d="M150,200 A5,5 0 0 0 250,200 z"
// M150,200 — start point

// A 5, 5 0 0 0
// a rx ry x-axis-rotation large-arc-flag sweep-flag
// A rx,ry – радиусы дуги элипса
// x-axis-rotation – угол поворота всей дуги элипса относительно оси абцисс
// large-arc-flag – определяет, должна ли дуга быть больше или меньше 180 градусов / 0/1
// sweep-flag – отвечает за направление отрисовки дуги из начальной точки в конечную точку. sweep-flag=1 — по часовой стрелке; sweep-flag=0 – против.

// 250,200 — end point

// Live arc editor https://codepen.io/lingtalfi/pen/yaLWJG

//---------------------------------------------

var Arc = function () {
  this.arc = $.get('#shape-arc');
  this.startX = 150;
  this.startY = 200;
  this.endX = 400;
  this.endY = 200;
  this.rX = 150;
  this.rY = 100;
  this.xRot = 0;
  this.largeArc = 0;
  this.sweep = 0;
  this.repeat = 5;

  this.addHelpers();
  this.addControls();

  this.getPathCoords();
  this.setPathCoords();

  this.addOutput();
};

//---------------------------------------------

Arc.prototype.getPathCoords = function () {
  this.pathCoordsSet = {
    startLetter: 'M',
    startX: this.startX,
    startY: this.startY,
    arcLetter: 'A',
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
  this.arc.attr('d', this.pathCoords);
  this.arc.rect = this.arc.elem.getBBox();

  this.setAllHelperArcParams();
  this.setAllControlsParams();

  this.addWaves();
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
    cx: (this.arc.rect.x + this.arc.rect.width / 2),
    cy: (this.arc.rect.y + this.arc.rect.height)
  }
};

Arc.prototype.getRY = function (event) {
  var rect = this.arc.rect;
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

  // this.addHelperLine();
};

//---------------------------------------------

Arc.prototype.addHelperArc = function (params) {
  var arcHelper = {};
  arcHelper.params = params;
  arcHelper.elemSet = $.createNS('path')
    .attr({
      'id': params.id,
      'fill': 'none',
      'stroke': params.stroke || '#AAA'
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

// Not used
Arc.prototype.addHelperLine = function () {
  var line = $.createNS('line').
  attr({
    x1: this.startX,
    y1: this.startY,
    x2: this.endX,
    y2: this.endY,
    'transform-origin': this.startX + ' ' + this.startX,
    // transform: 'scale(2,1)',
    stroke: 'red',
    'stroke-width': 2
  });

  svg.prepend(line);
};

//---------------------------------------------

Arc.prototype.addOutput = function () {
  this.outputElems = [];
  this.outputInputs = [];
  var that = this;

  outputList.forEach(function (item) {
    var prop = item.prop;
    var value = that.pathCoordsSet[prop];
    var input = $.create('input')
      .attr({
        type: 'input',
        inputmode: 'numeric',
        name: prop,
        id: prop,
        value: value
      })
      .addClass([
        inputClass,
        inputClass + '--' + prop,
        inputClass + '--' + typeof (value)
      ]);

    if (item.min !== undefined && item.min !== null) {
      input.attr({min: item.min});
    }
    if (item.max) {
      input.attr({max: item.max});
    }
    if (typeof (value) === 'string') {
      input.attr({
        'disabled': ''
      });
    }

    var desc = $.create('label')
      .attr({'for': prop})
      .addClass('code-output__desc')
      .html(item.desc);

    var error = $.create('span')
      .addClass('code-output__error');

    var item = $.create('span')
      .addClass([
        'code-output__item',
        'code-output__item--' + prop
      ])
      .append([input, desc, error]);

    that.outputElems.push(item);
    that.outputInputs.push(input);

    // Events
    input.elem.addEventListener('input', function () {
      setInputWidth.apply(this);
      if (!checkValue.apply(this, [error])) {
        return false;
      }
      that[this.name] = this.value;
      that.getPathCoords();
      that.setPathCoords();
    });

    input.elem.addEventListener('keydown', function (event) {
      setIsCmd.apply(this, event);
      that.changeValueByKeyboard(event, this, error);
    });

    input.elem.addEventListener('keyup', function (event) {
      unSetIsCmd.apply(this, event);
    });

  })

  codeOutput.append(this.outputElems);
};

//---------------------------------------------

Arc.prototype.changeValueByKeyboard = function (event, input, error) {
  if (!(event.keyCode == 38 || event.keyCode == 40)) {
    return;
  }

  var step = 1;

  if (event.shiftKey && (event.ctrlKey || input.isCmd)) {
    step = 1000;
  } else if (event.ctrlKey || input.isCmd) {
    step = 100;
  }
  else if (event.shiftKey) {
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

  this.outputInputs.forEach(function (item) {
    var name = item.elem.name;
    if (!that[name]) {
      return;
    }
    var value = +item.elem.value;
    var newValue = that.pathCoordsSet[name];

    item.elem.value = newValue;
    if (value !== newValue) {
      setInputWidth.apply(item.elem);
    }
  });
};

//---------------------------------------------

Arc.prototype.addWaves = function () {
  console.log('+waves');
  var wavesParamsSet = [this.pathCoords];

  for (var i = 0; i < this.repeat; i++) {
    wavesParamsSet.push(this.addWave(i));
  }

  var wavesParams = wavesParamsSet.join(' ');
  this.arc.attr({ 'd': wavesParams });
};

//---------------------------------------------

Arc.prototype.addWave = function (counter) {
  console.log(this.pathCoordsSet);
  var arcParamsSet = {};
  var waveWidth = this.pathCoordsSet.endX - this.pathCoordsSet.startX;

  for (var key in this.pathCoordsSet) {
    arcParamsSet[key] = this.pathCoordsSet[key];
  }

  arcParamsSet['startX'] = this.pathCoordsSet.endX + (waveWidth * counter);
  arcParamsSet['endX'] = this.pathCoordsSet.endX + (waveWidth * (counter + 1));
  if (counter % 2 === 0) {
    console.log((counter + 1) % 2);
    arcParamsSet['sweep'] = +!this.pathCoordsSet.sweep;
    arcParamsSet['startY'] = this.pathCoordsSet.endY;
    arcParamsSet['endY'] = this.pathCoordsSet.startY;
  }

  var arcParamsVals = Object.values(arcParamsSet);
  var arcParams = arcParamsVals.join(' ');
  return arcParams;
};

//---------------------------------------------

function setInputWidth() {
  this.style.minWidth = this.value.length * .65 + 'em';
}

//---------------------------------------------

function checkValue(errorElem) {
  errorElem.html('');
  this.classList.remove(inputClassError);

  if (isNaN(this.value)) {
    errorElem.html('not a number');
    this.classList.add(inputClassError);
    return false;
  }
  else if (this.min && this.value < this.min) {
    this.classList.add(inputClassError);
    errorElem.html('minimum: ' + this.min);
    return false;
  }
  else if (this.max && this.value > this.max) {
    this.classList.add(inputClassError);
    errorElem.html('maximum: ' + this.max);
    return false;
  }

  return true;
}

//---------------------------------------------

function setIsCmd() {
  if (event.keyCode == 91) {
    this.isCmd = true;
  }
}

function unSetIsCmd() {
  if (event.keyCode == 91) {
    this.isCmd = false;
  }
}

//---------------------------------------------

function getMouseX(event) {
  return event.offsetX;
}

function getMouseY(event) {
  return event.offsetY;
}

//---------------------------------------------



//---------------------------------------------

var arc = new Arc();
