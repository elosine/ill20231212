//#ef NOTES
/*
Figure Out BB
*/
//#endef NOTES

//#ef General Variables
const TEMPO_COLORS = [clr_brightOrange, clr_brightGreen, clr_brightBlue, clr_lavander, clr_darkRed2];
//Timing
const FRAMERATE = 60;
const MS_PER_FRAME = 1000.0 / FRAMERATE;
let FRAMECOUNT = 0;
//Canvas Variables
let WORLD_W; // Calculated later in notation variables; 9 beats of notation @ 105 pixels per beat
let WORLD_H; //calculated later with notation variables
let canvas = {}; // canvas.panel(jspanel); canvas.div(jspanel div); canvas.svg(svg container on top of canvas.div)
let panelTitle = "Interactive Looping Line 20231212"
//Notation Variables
//File name LL20231212_SVG.svg; long single line svg notation with proportionate spacing
//just draw several times 1 for each line and move it over
//105 pixels per beat; 42 beats; 4410 x 109
//9 beats per line; 945 pixels per line
const NOTATION_FILE_NAME = 'ILL20231212_SVG.svg';
const PX_PER_BEAT = 105;
const BEATS_PER_LINE = 9;
const WHOLE_NOTATION_W = 4410;
const NOTATION_H = 109;
const GAP_BTWN_NOTATION_LINES = 10;
const VERT_DISTANCE_BETWEEN_LINES = NOTATION_H + GAP_BTWN_NOTATION_LINES;
const NOTATION_TOTAL_BEATS = 42; //cut off a few measures for long note but keep 42 for pixels per beat
const NUM_NOTATION_LINES = 4;
const NUM_BEATS_IN_PIECE = 36;
const NOTATION_LINE_LENGTH = BEATS_PER_LINE * PX_PER_BEAT;
const TOTAL_NUM_PX_IN_SCORE = NOTATION_LINE_LENGTH * NUM_NOTATION_LINES;
WORLD_W = NOTATION_LINE_LENGTH;
WORLD_H = (NOTATION_H * NUM_NOTATION_LINES) + (GAP_BTWN_NOTATION_LINES * (NUM_NOTATION_LINES - 1));
//Beat Lines
let beatLines = [];
//Scrolling Cursors
let scrollingCursors = [];
let scrollingCsrY1 = 33;
let scrollingCsrH = 57;
let scrollingCsrClrs = [clr_limeGreen, clr_mustard, clr_brightOrange, clr_brightBlue];
//Tempo Timing
let tempos = [60, 37.14, 96.92];
let totalNumFramesPerTempo = [];
let tempoConsts = [];
tempos.forEach((tempo, i) => {
  let td = {};
  td['bpm'] = tempo;
  let bps = tempo / 60;
  td['bps'] = bps;
  let framesPerBeat = FRAMERATE / bps;
  td['framesPerBeat'] = framesPerBeat;
  let numFramesInPiece = NUM_BEATS_IN_PIECE * framesPerBeat;
  td['numFramesInPiece'] = numFramesInPiece;
  let pxPerFrame = PX_PER_BEAT / framesPerBeat;
  td['pxPerFrame'] = pxPerFrame;
  td['framesPerLine'] = framesPerBeat * BEATS_PER_LINE;
  tempoConsts.push(td);
});
//Timesync
const TS = timesync.create({
  server: '/timesync',
  interval: 1000
});
//#endef General Variables

//#ef Animation Engine
//Animation Engine Variables
let cumulativeChangeBtwnFrames_MS = 0;
let epochTimeOfLastFrame_MS;

function animationEngine(timestamp) { //timestamp not used; timeSync server library used instead
  let ts_Date = new Date(TS.now()); //Date stamp object from TimeSync library
  let tsNowEpochTime_MS = ts_Date.getTime();
  cumulativeChangeBtwnFrames_MS += tsNowEpochTime_MS - epochTimeOfLastFrame_MS;
  epochTimeOfLastFrame_MS = tsNowEpochTime_MS; //update epochTimeOfLastFrame_MS for next frame
  while (cumulativeChangeBtwnFrames_MS >= MS_PER_FRAME) { //if too little change of clock time will wait until 1 animation frame's worth of MS before updating etc.; if too much change will update several times until caught up with clock time
    if (cumulativeChangeBtwnFrames_MS > (MS_PER_FRAME * FRAMERATE)) cumulativeChangeBtwnFrames_MS = MS_PER_FRAME; //escape hatch if more than 1 second of frames has passed then just skip to next update according to clock
    update();
    FRAMECOUNT++;
    cumulativeChangeBtwnFrames_MS -= MS_PER_FRAME; //subtract from cumulativeChangeBtwnFrames_MS 1 frame worth of MS until while cond is satisified
  }
  requestAnimationFrame(animationEngine);
}
// Update Functions
function update() {
  totalNumFramesPerTempo.forEach((numFrames, tempoIx) => {
    let currFrame = FRAMECOUNT % numFrames;
    updateScrollingCsrs(currFrame, tempoIx);
  });

}
//#endef Animation Engine END

//#ef Calculate Timelines
function calcTimeline() {
  //Number of frames in score
  tempoConsts.forEach((tempoObj, tempoIx) => { //run for each tempo
    let tNumFrames = Math.round(tempoObj.numFramesInPiece); //create an array with and index for each frame in the piece
    let tFrmsPerLine = tempoObj.framesPerLine;
    let frameArray = [];
    for (var frmIx = 0; frmIx < tNumFrames; frmIx++) { //loop for each frame in the piece
      let td = {};
      let tCurPx = Math.round(frmIx * tempoObj.pxPerFrame);
      let tx = tCurPx % NOTATION_LINE_LENGTH; //calculate cursor x location at each frame for this tempo
      td['x'] = tx;
      //Calc Y pos
      let ty;
      if (frmIx < tFrmsPerLine) {
        ty = scrollingCsrY1
      } else if (frmIx >= tFrmsPerLine && frmIx < (tFrmsPerLine * 2)) {
        ty = scrollingCsrY1 + NOTATION_H + GAP_BTWN_NOTATION_LINES;
      } else if (frmIx >= (tFrmsPerLine * 2) && frmIx < (tFrmsPerLine * 3)){
        ty = scrollingCsrY1 + ((NOTATION_H+GAP_BTWN_NOTATION_LINES) * 2);
      } else{
        ty = scrollingCsrY1 + ((NOTATION_H+GAP_BTWN_NOTATION_LINES) * 3);
      }
      td['y'] = ty;
      frameArray.push(td);
    }
    tempoConsts[tempoIx]['frameArray'] = frameArray;
    totalNumFramesPerTempo.push(frameArray.length);
  });
}
//#endef Calculate Timelines

//#ef INIT
function init() { //runs from html file: ill20231212.html <body onload='init();'></body>
  makeCanvas();
  drawNotation();
  makeScrollingCursors();
  calcTimeline();
  // console.log(tempoConsts);
  //Initialize clock and start animation engine
  let ts_Date = new Date(TS.now()); //Date stamp object from TimeSync library
  let tsNowEpochTime_MS = ts_Date.getTime(); //current time at init in Epoch Time MS
  epochTimeOfLastFrame_MS = tsNowEpochTime_MS;
  requestAnimationFrame(animationEngine); //kick off animation
}
//#endef INIT

//#ef Make Canvas
function makeCanvas() {
  //Make Panel with jsPanel
  let tPanel = mkPanel({
    w: WORLD_W,
    h: WORLD_H,
    title: panelTitle,
    onwindowresize: true,
    clr: 'none',
    ipos: 'center-top',
  });
  // Enable Click/Tap to go to full screen mode
  tPanel.content.addEventListener('click', function() {
    document.documentElement.webkitRequestFullScreen({
      navigationUI: 'hide'
    });
  });
  //tPanel.content is the jspanel's div container
  //Change Background Color of Panel: tPanel.content.style.backgroundColor = clr_plum;
  canvas['panel'] = tPanel;
  canvas['div'] = tPanel.content;
  // SVG Container on top of jsPanel's div
  let tSvg = mkSVGcontainer({
    canvas: tPanel.content,
    w: WORLD_W,
    h: WORLD_H,
    x: 0,
    y: 0,
  });
  //Change Background Color of svg container tSvg.style.backgroundColor = clr_mustard
  canvas['svg'] = tSvg;
}
//#endef Make Canvas

//#ef Draw Notation
function drawNotation() {
  for (var i = 0; i < NUM_NOTATION_LINES; i++) {
    //Notation
    let tSvgImage = document.createElementNS(SVG_NS, "image");
    tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/ill20231212/notationSVGs/' + NOTATION_FILE_NAME);
    tSvgImage.setAttributeNS(null, "y", i * (NOTATION_H + GAP_BTWN_NOTATION_LINES));
    tSvgImage.setAttributeNS(null, "x", i * -NOTATION_LINE_LENGTH);
    tSvgImage.setAttributeNS(null, "visibility", 'visible');
    tSvgImage.setAttributeNS(null, "display", 'yes');
    canvas.svg.appendChild(tSvgImage);
    //Beat Lines
    for (var j = 0; j < BEATS_PER_LINE; j++) {
      let tx2 = j * PX_PER_BEAT;
      let y1 = (i * VERT_DISTANCE_BETWEEN_LINES);
      let tBl = mkSvgLine({
        svgContainer: canvas.svg,
        x1: tx2,
        y1: y1,
        x2: tx2,
        y2: y1 + NOTATION_H,
        stroke: 'magenta',
        strokeW: 0.5
      });
      beatLines.push(tBl);
    }
  }
}
//#endef Draw Notation

//##ef Scrolling Cursor
function makeScrollingCursors() {
  for (var i = 0; i < tempos.length; i++) {
    let tCsr = mkSvgLine({
      svgContainer: canvas.svg,
      x1: 0,
      y1: scrollingCsrY1,
      x2: 0,
      y2: scrollingCsrY1 + scrollingCsrH,
      stroke: scrollingCsrClrs[i],
      strokeW: 2
    });
    tCsr.setAttributeNS(null, 'stroke-linecap', 'round');
    tCsr.setAttributeNS(null, 'display', 'yes');
    scrollingCursors.push(tCsr);
  }
}
//Animate Scrolling Cursors
function updateScrollingCsrs(frame, tempoIx) {
  let tx = tempoConsts[tempoIx].frameArray[frame].x;
  let ty = tempoConsts[tempoIx].frameArray[frame].y;
  scrollingCursors[tempoIx].setAttributeNS(null, 'x1', tx);
  scrollingCursors[tempoIx].setAttributeNS(null, 'x2', tx);
  scrollingCursors[tempoIx].setAttributeNS(null, 'y1', ty);
  scrollingCursors[tempoIx].setAttributeNS(null, 'y2', ty + scrollingCsrH);
  //Scrolling BB
  // cursorBBs[0].setAttributeNS(null, 'transform', "translate(" + currScrollingCsrX.toString() + "," + currScrollingCsrY.toString() + ")");
  // let tBBy = timelineFRAMES[timelineFrameIx].bby;
  // cursorBBs[0].setAttributeNS(null, 'cx', currScrollingCsrX);
  // cursorBBs[0].setAttributeNS(null, 'cy', tBBy + currScrollingCsrY);
}
//##endef Scrolling Cursor








/*

for (var i = 0; i < NUM_NOTATION_LINES; i++) {

  let ty = -18 + (i * VERT_DISTANCE_BETWEEN_LINES);
  let tx1 = -2 + (i * -944);
  let tSvgImage = document.createElementNS(SVG_NS, "image");
  tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/ill20231212/notationSVGs/ILL20231212_SVG.svg');
  tSvgImage.setAttributeNS(null, "y", ty);
  tSvgImage.setAttributeNS(null, "x", tx1);
  tSvgImage.setAttributeNS(null, "visibility", 'visible');
  tSvgImage.setAttributeNS(null, "display", 'yes');
  staves[0].svg.appendChild(tSvgImage);



  //End of line mask
  let tLineMask = mkSvgRect({
    svgContainer: staves[0].svg,
    x: 944,
    y: i * 105,
    w: 70,
    h: 70,
    fill: 'white',
    stroke: 'none',
    strokeW: 0,
    roundR: 0
  });

}
*/







/*

//##ef Timing
const FRAMERATE = 60;
const FRAMES_PER_MS = FRAMERATE / 1000;
let FRAMECOUNT = 0;
const PX_PER_BEAT = 105;
const MS_PER_FRAME = 1000.0 / FRAMERATE;
//Below all BPM Based
// let tempos = [60, 96.92, 37.14];
// let tempoConsts = []; //bpm, bpSec, pxPerSec, pxPerMS, MSperPx, pxPerFrame, beatDurFrames
// tempos.forEach((tempo, i) => {
//   let td = {};
//   let bpsec = tempo/60;
//   let pxpersec = PX_PER_BEAT * bpSec;
//   td['bpm'] = tempo;
//   td['bpSec'] = bpsec;
//   td['pxPerSec'] = pxpersec;
//   td['pxPerMS'] = pxpersec/1000;
//
// });

const TEMPO_BPM = 60;
const TEMPO_BPSEC = TEMPO_BPM / 60;
const PX_PER_SEC = PX_PER_BEAT * TEMPO_BPSEC; //scrolling speed; from the notation svg; 105 pixels between beats
const PX_PER_MS = PX_PER_SEC / 1000;
const PX_PER_FRAME = PX_PER_SEC / FRAMERATE;
const BEAT_DUR_FRAMES = PX_PER_BEAT / PX_PER_FRAME; //Width of the staff in frames
//##endef Timing





//#ef World Panel Variables


//#endef World Panel Variables

//#ef Canvas Variables
const NOTATIONCANVAS_TOP = 0;
const NOTATIONCANVAS_H = WORLD_H;
const NOTATIONCANVAS_W = WORLD_W;
//#endef Canvas Variables

//#ef Staff Variables
const NUMSTAVES = 1;
const NUM_NOTATION_LINES = 4;
const STAFFGAP = 4;
const STAFF_H = 700;
const STAFF_W = NOTATIONCANVAS_W;
const LEFT_MARGIN = 3;
const VERT_DISTANCE_BETWEEN_LINES = 115;
const CURSOR_H = 80;
const BEAT_LINES_Y1 = 15;
const BEAT_LINES_H = 55;
const BB_RADIUS = 5;
const BB_Y1 = BEAT_LINES_Y1 + BB_RADIUS;
console.log(BB_Y1);
let staves = [];
let beatLines = [];
let beatLines_XY = [];
let tempoCursors = [];
let cursorBBs = [];
let oneBounceBbYpos = [];
//#endef Staff Variables

//#ef Staff Timing

//##ef Calculate Ascent and Descent for 1 BB
let ascentPct = 0.5;
let descentPct = 1 - ascentPct;
let numFramesUp = Math.floor(ascentPct * BEAT_DUR_FRAMES);
let numFramesDown = Math.floor(descentPct * BEAT_DUR_FRAMES);
let ascentFactor = 0.5;
let  descentFactor = 3;
let ascentPlot = plot(function(x) { //see Function library; exponential curve
  return Math.pow(x, ascentFactor);
}, [0, 1, 1, 0], numFramesUp, BEAT_LINES_H, BB_Y1); //will create an object with numFramesUp length (x) .y is what you want

ascentPlot.forEach((ascentPos) => { //curve for descent
  let tBbY = CURSOR_H - ascentPos.y; //calculate the absolute y position of bb
  oneBounceBbYpos.push(Math.round(tBbY)); //populate bbYpos_thisTempo array with bby position for every frame
}); // descentPlot.forEach((descentPos) => END

let descentPlot = plot(function(x) { //curve for ascent
  return Math.pow(x, descentFactor);
}, [0, 1, 1, 0], numFramesDown, BEAT_LINES_H, 0);

descentPlot.forEach((descentPos) => {
  let tBbY = descentPos.y;
  oneBounceBbYpos.push(Math.round(tBbY));
}); // ascentPlot.forEach((ascentPos) => END
//##endef Calculate BBs

console.log(oneBounceBbYpos);
//find out how many frames in a timeline
const STAFF_WIDTH_IN_FRAMES = Math.round(STAFF_W / PX_PER_FRAME); //Width of the staff in frames
let timelineFRAMES = [];
//which frame for each MS
const STAFF_WIDTH_IN_MS = Math.round(STAFF_W / PX_PER_MS); //Width of the staff in frames
console.log(STAFF_WIDTH_IN_MS / 1000 + " - duration of one staff");
let timelineMS_returnsFrames = [];
for (var i = 0; i < STAFF_WIDTH_IN_MS; i++) {
  let tFrameNum = Math.round(FRAMES_PER_MS * i);
  timelineMS_returnsFrames.push(tFrameNum);
}

//Should contain an index for each frame in the timeline
let tJ = 0;
for (var i = 0; i < (STAFF_WIDTH_IN_FRAMES * NUM_NOTATION_LINES); i++) {
  let tFrameDict = {}; //a dictionary for each frame
  let tpx = Math.round(i % STAFF_WIDTH_IN_FRAMES * PX_PER_FRAME); //this is the pixel location for each frame; modulo for each line
  tFrameDict['x'] = tpx;
  let tMS = Math.round(i * MS_PER_FRAME);
  tFrameDict['ms'] = tMS;
  let tY = (tJ * VERT_DISTANCE_BETWEEN_LINES) + BEAT_LINES_Y1;
  tFrameDict['y'] = tY; //which line cursor is on
  if (i != 0 && i % STAFF_WIDTH_IN_FRAMES == 0) tJ = tJ + 1; //increment tJ for each line
  timelineFRAMES.push(tFrameDict);
}
//BBs
for (var i = 0; i < timelineFRAMES.length; i++) {
  timelineFRAMES[i]['bby'] = oneBounceBbYpos[i%oneBounceBbYpos.length];
}

console.log(timelineFRAMES);
//#endef Staff Timing









//#ef BUILD WORLD







//##ef Make Scrolling Tempo Cursors


function makeScrollingTempoCursors() {

  let tLine = mkSvgLine({
    svgContainer: staves[0].svg,
    x1: 50,
    y1: 0,
    x2: 50,
    y2: 80,
    stroke: clr_brightGreen,
    strokeW: 2
  });
  tLine.setAttributeNS(null, 'stroke-linecap', 'round');
  tLine.setAttributeNS(null, 'display', 'yes');
  // tLine.setAttributeNS(null, 'transform', "translate(" + beatCoords[4].x.toString() + "," + beatCoords[4].y.toString() + ")");
  tempoCursors.push(tLine);

} // function makeScrollingTempoCursors() END


//##endef Make Scrolling Tempo Cursors

//##ef Make Scrolling Cursor BBs


function makeScrollingCursorBbs() {

  let tCsrBB = mkSvgCircle({
    svgContainer: staves[0].svg,
    cx: 0,
    cy: 0,
    r: BB_RADIUS,
    fill: clr_brightGreen,
    stroke: 'white',
    strokeW: 0
  });

  cursorBBs.push(tCsrBB);


} //function makeScrollingCursorBbs() END


//##endef Make Scrolling Cursor BBs


//#endef BUILD WORLD



//#ef WIPE/UPDATE/DRAW

//###ef updateScrollingCsrs
function updateScrollingCsrs() {

  let timelineFrameIx = FRAMECOUNT % timelineFRAMES.length;
  if (timelineFrameIx < timelineFRAMES.length) {
    //Scrolling Cursor
    let currScrollingCsrX = timelineFRAMES[timelineFrameIx].x;
    let currScrollingCsrY = timelineFRAMES[timelineFrameIx].y;
    tempoCursors[0].setAttributeNS(null, 'x1', currScrollingCsrX);
    tempoCursors[0].setAttributeNS(null, 'x2', currScrollingCsrX);
    tempoCursors[0].setAttributeNS(null, 'y1', currScrollingCsrY);
    tempoCursors[0].setAttributeNS(null, 'y2', currScrollingCsrY + BEAT_LINES_H);
    //Scrolling BB
    // cursorBBs[0].setAttributeNS(null, 'transform', "translate(" + currScrollingCsrX.toString() + "," + currScrollingCsrY.toString() + ")");
    let tBBy = timelineFRAMES[timelineFrameIx].bby;
    cursorBBs[0].setAttributeNS(null, 'cx', currScrollingCsrX);
    cursorBBs[0].setAttributeNS(null, 'cy', tBBy + currScrollingCsrY);

  }
} // function updateScrollingCsrs() END
//###endef updateScrollingCsrs


//###ef updateScrollingBBs
function updateScrollingBBs() {
  if (FRAMECOUNT > 0) { //No lead in motion for scrolling cursors
    scoreData.scrollingCsrCoords_perTempo.forEach((posObjSet, tempoIx) => { // Loop: set of goFrames

      let setIx = FRAMECOUNT % posObjSet.length; //adjust current FRAMECOUNT to account for lead-in and loop this tempo's set of goFrames //scoreData.scrollingCsrCoords_perTempo & scoreData.bbYpos_perTempo arrays are same length so you can just one modulo
      //From scrollingCsrCoords_perTempo:
      let tX = posObjSet[setIx].x;
      let tY1 = posObjSet[setIx].y1;
      let tY2 = posObjSet[setIx].y2;
      //From bbYpos_perTempo:
      let tBbCy = scoreData.bbYpos_perTempo[tempoIx][setIx];

      let tBbCy_norm = (tBbCy - BBCIRC_TOP_CY) / (BBCIRC_BOTTOM_CY - BBCIRC_TOP_CY); //BBCIRC_TOP_CY to BBCIRC_BOTTOM_CY is the distance of the larger bbs; normalize this distance and multiple by the length of the scrolling cursor
      let scrBbY = tY2 - HALF_NOTEHEAD_H + (tBbCy_norm * NOTATION_CURSOR_H);
      let scrBbX = tX + SCRBBCIRC_R + NOTATION_CURSOR_STROKE_W;
      scrollingCsrBbsObjSet[tempoIx].ball.setAttributeNS(null, 'transform', "translate(" + scrBbX.toString() + "," + scrBbY.toString() + ")");
      scrollingCsrBbsObjSet[tempoIx].ball.setAttributeNS(null, 'display', "yes");

    }); //goFrameCycles_perTempo.forEach((bbYposSet, tempoIx) => END
  } // if (FRAMECOUNT > LEAD_IN_FRAMES) END
} // function updateScrollingCsrs() END
//###endef updateScrollingBBs


//#endef WIPE/UPDATE/DRAW



//#ef ANIMATION




//#ef WIPE/UPDATE/DRAW


//#ef Wipe Function
function wipe(epochClock_MS) {

} // function wipe() END
//#endef Wipe Function



//#ef Draw Function
function draw(epochClock_MS) {

}
//#endef Draw Function


//#endef WIPE/UPDATE/DRAW


//#endef ANIMATION


*/


//
