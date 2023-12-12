//#ef NOTES
/*
Upload coad from pc
finish line and import to javascript
measure beats
put in beat lines
1200x800
*/
//#endef NOTES



//#ef GLOBAL VARIABLES


//#ef General Variables
let NUM_PLAYERS = 1;
const TEMPO_COLORS = [clr_brightOrange, clr_brightGreen, clr_brightBlue, clr_lavander, clr_darkRed2];
//#endef General Variables

//##ef Timing
const FRAMERATE = 60;
const FRAMES_PER_MS = FRAMERATE / 1000;
let FRAMECOUNT = 0;
const PX_PER_SEC = 18; //scrolling speed
const PX_PER_MS = PX_PER_SEC / 1000;
const MS_PER_PX = 1000 / PX_PER_SEC;
const PX_PER_FRAME = PX_PER_SEC / FRAMERATE;
const MS_PER_FRAME = 1000.0 / FRAMERATE;

//##endef Timing

//#ef Animation Engine Variables
let cumulativeChangeBtwnFrames_MS = 0;
let epochTimeOfLastFrame_MS;
let animationEngineCanRun = true;
//#endef END Animation Engine Variables

//#ef TIMESYNC
const TS = timesync.create({
  server: '/timesync',
  interval: 1000
});
//#endef TIMESYNC

//#ef World Panel Variables
let worldPanel;
const DEVICE_SCREEN_W = window.screen.width;
const DEVICE_SCREEN_H = window.screen.height;
const MAX_W = 1200; //16:10 aspect ratio; 0.625
const MAX_H = 800;
const WORLD_MARGIN = 10;
// const WORLD_W = Math.min(DEVICE_SCREEN_W, MAX_W) - (WORLD_MARGIN * 2);
// const WORLD_H = Math.min(DEVICE_SCREEN_H, MAX_H) - 45;
const WORLD_W = 950;
const WORLD_H = 450;
const WORLD_CENTER = WORLD_W / 2;
const GAP = 6;
//#endef World Panel Variables

//#ef Canvas Variables
const NOTATIONCANVAS_TOP = 0;
const NOTATIONCANVAS_H = WORLD_H;
const NOTATIONCANVAS_W = WORLD_W;
//#endef Canvas Variables

//#ef Staff Variables
const NUMSTAVES = 1;
const STAFFGAP = 4;
// const STAFF_H = (NOTATIONCANVAS_H - (STAFFGAP * (NUMSTAVES - 1))) / NUMSTAVES;
const STAFF_H = 700;
const STAFF_W = NOTATIONCANVAS_W;
const LEFT_MARGIN = 3;
let staves = [];
let beatLines = [];
//#endef Staff Variables


//#endef GLOBAL VARIABLES



//#ef INIT
function init() {

  makeWorldPanel();
  makeStaves();
  drawNotation();

  let ts_Date = new Date(TS.now()); //Date stamp object from TimeSync library
  let tsNowEpochTime_MS = ts_Date.getTime();
  epochTimeOfLastFrame_MS = tsNowEpochTime_MS;
  requestAnimationFrame(animationEngine); //kick off animation

} // function init() END
//#endef INIT



//#ef BUILD WORLD


//#ef Make World Panel - floating window made in jspanel
function makeWorldPanel() {
  worldPanel = mkPanel({
    w: WORLD_W,
    h: WORLD_H,
    title: 'SoundFlow #5',
    onwindowresize: true,
    clr: 'none',
    ipos: 'center-top',
  });

  worldPanel.content.addEventListener('click', function() {
    document.documentElement.webkitRequestFullScreen({
      navigationUI: 'hide'
    });
  });

} // function makeWorldPanel() END
//#endef Make World Panel

//#ef Make Staves - SVG rectangle for each individual staff (draw notation on top)
function makeStaves() {

  for (var i = 0; i < NUMSTAVES; i++) {
    let tStaffObj = {}; //{div:,svg:,rect:}
    let ty = i * (STAFF_H + STAFFGAP);

    let tDiv = mkDiv({
      canvas: worldPanel.content,
      w: STAFF_W,
      h: STAFF_H,
      top: ty,
      left: 0,
      bgClr: 'white'
    });

    tStaffObj['div'] = tDiv;

    let tSvg = mkSVGcontainer({
      canvas: tDiv,
      w: STAFF_W,
      h: STAFF_H,
      x: 0,
      y: 0,
      clr: 'white'
    });

    tStaffObj['svg'] = tSvg;

    staves.push(tStaffObj);

  } // for (var i = 0; i < NUMSTAVES; i++) END

} // function makeStaves() END
//#endef Make Staves

//#ef Draw Notation SVG
function drawNotation() {
  let tSvgImage = document.createElementNS(SVG_NS, "image");
  tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/interactiveLoopingLine20231129/notationSVGs/ill20231129.svg');
  tSvgImage.setAttributeNS(null, "y", 0);
  tSvgImage.setAttributeNS(null, "x", 0);
  tSvgImage.setAttributeNS(null, "visibility", 'visible');
  tSvgImage.setAttributeNS(null, "display", 'yes');
  staves[0].svg.appendChild(tSvgImage);

  let tSvgImage2 = document.createElementNS(SVG_NS, "image");
  tSvgImage2.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/interactiveLoopingLine20231129/notationSVGs/ill20231129.svg');
  tSvgImage2.setAttributeNS(null, "y", 130);
  tSvgImage2.setAttributeNS(null, "x", -943);
  tSvgImage2.setAttributeNS(null, "visibility", 'visible');
  tSvgImage2.setAttributeNS(null, "display", 'yes');
  staves[0].svg.appendChild(tSvgImage2);

  let tSvgImage3 = document.createElementNS(SVG_NS, "image");
  tSvgImage3.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/interactiveLoopingLine20231129/notationSVGs/ill20231129.svg');
  tSvgImage3.setAttributeNS(null, "y", 280);
  tSvgImage3.setAttributeNS(null, "x", -1886);
  tSvgImage3.setAttributeNS(null, "visibility", 'visible');
  tSvgImage3.setAttributeNS(null, "display", 'yes');
  staves[0].svg.appendChild(tSvgImage3);


  //mask
  let line1Mask = mkSvgRect({
    svgContainer: staves[0].svg,
    x: 880,
    y: 0,
    w: 75,
    h: 75,
    fill: 'white',
    stroke: 'none',
    strokeW: 0,
    roundR: 0
  });

  let line2Mask = mkSvgRect({
    svgContainer: staves[0].svg,
    x: 945,
    y: 160,
    w: 75,
    h: 75,
    fill: 'white',
    stroke: 'none',
    strokeW: 0,
    roundR: 0
  });

  //Beat lines 1
  for (var i = 0; i < 9; i++) {

    // let tx = i<20 ? 4+(i*34) : 7+(i*34);
    let tx = LEFT_MARGIN + (i * 105)


    let tBl = mkSvgLine({
      svgContainer: staves[0].svg,
      x1: tx,
      y1: 0,
      x2: tx,
      y2: 130,
      stroke: 'magenta',
      strokeW: 0.5
    });
    beatLines.push(tBl);


    let tBl2 = mkSvgLine({
      svgContainer: staves[0].svg,
      x1: tx,
      y1: 150,
      x2: tx,
      y2: 255,
      stroke: 'magenta',
      strokeW: 0.5
    });
    beatLines.push(tBl);


    let tBl3 = mkSvgLine({
      svgContainer: staves[0].svg,
      x1: tx,
      y1: 285,
      x2: tx,
      y2: 450,
      stroke: 'magenta',
      strokeW: 0.5
    });
    beatLines.push(tBl);

  }

}
//#endef Draw Notation SVG


//#endef BUILD WORLD



//#ef WIPE/UPDATE/DRAW




//#endef WIPE/UPDATE/DRAW



//#ef ANIMATION


//#ef Animation Engine
function animationEngine(timestamp) { //timestamp not used; timeSync server library used instead

  let ts_Date = new Date(TS.now()); //Date stamp object from TimeSync library
  let tsNowEpochTime_MS = ts_Date.getTime();
  cumulativeChangeBtwnFrames_MS += tsNowEpochTime_MS - epochTimeOfLastFrame_MS;
  epochTimeOfLastFrame_MS = tsNowEpochTime_MS; //update epochTimeOfLastFrame_MS for next frame

  while (cumulativeChangeBtwnFrames_MS >= MS_PER_FRAME) { //if too little change of clock time will wait until 1 animation frame's worth of MS before updating etc.; if too much change will update several times until caught up with clock time

    if (cumulativeChangeBtwnFrames_MS > (MS_PER_FRAME * FRAMERATE)) cumulativeChangeBtwnFrames_MS = MS_PER_FRAME; //escape hatch if more than 1 second of frames has passed then just skip to next update according to clock
    wipe();
    update();
    draw();

    FRAMECOUNT++;
    cumulativeChangeBtwnFrames_MS -= MS_PER_FRAME; //subtract from cumulativeChangeBtwnFrames_MS 1 frame worth of MS until while cond is satisified

  } // while (cumulativeChangeBtwnFrames_MS >= MS_PER_FRAME) END

  if (animationEngineCanRun) requestAnimationFrame(animationEngine); //animation engine gate: animationEngineCanRun

} // function animationEngine(timestamp) END
//#endef Animation Engine END


//#ef WIPE/UPDATE/DRAW


//#ef Wipe Function
function wipe(epochClock_MS) {

} // function wipe() END
//#endef Wipe Function

//#ef Update Function
function update() {


}
//#endef Update Function

//#ef Draw Function
function draw(epochClock_MS) {

}
//#endef Draw Function


//#endef WIPE/UPDATE/DRAW


//#endef ANIMATION





//
