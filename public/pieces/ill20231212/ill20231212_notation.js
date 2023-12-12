//#ef NOTES
/*
Calculate BB Timing
Animate/Update BBs
Animated Cursor
Add Bouncing Ball to Cursor
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
const PX_PER_BEAT = 105;
const TEMPO_BPM = 60;
const TEMPO_BPSEC = TEMPO_BPM / 60;
const PX_PER_SEC = PX_PER_BEAT * TEMPO_BPSEC; //scrolling speed; from the notation svg; 105 pixels between beats
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
const NUMLINES = 4;
const STAFFGAP = 4;
const STAFF_H = 700;
const STAFF_W = NOTATIONCANVAS_W;
const LEFT_MARGIN = 3;
const VERT_DISTANCE_BETWEEN_LINES = 115;
let staves = [];
let beatLines = [];
let tempoCursors = [];
let cursorBBs = [];
//#endef Staff Variables

//#ef Staff Timing
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
for (var i = 0; i < (STAFF_WIDTH_IN_FRAMES * NUMLINES); i++) {
  let tFrameDict = {}; //a dictionary for each frame
  let tpx = Math.round(i % STAFF_WIDTH_IN_FRAMES * PX_PER_FRAME); //this is the pixel location for each frame; modulo for each line
  tFrameDict['x'] = tpx;
  let tMS = Math.round(i * MS_PER_FRAME);
  tFrameDict['ms'] = tMS;
  let tY = tJ * VERT_DISTANCE_BETWEEN_LINES;
  tFrameDict['y'] = tY;
  timelineFRAMES.push(tFrameDict);
  if (i != 0 && i % STAFF_WIDTH_IN_FRAMES == 0) tJ = tJ + 1; //increment tJ for each line
}
console.log(timelineFRAMES);
//#endef Staff Timing

//##ef Calculate BBs


    //##ef Main Cycle
    let bbYpos_thisTempo = [];
    let bbLeadIn = [];

    goFrames_thisTempo.forEach((goFrm, goFrmIx) => { //goFrames_thisTempo contains the frame number of each go frame

      if (goFrmIx > 0) { //start on second goFrmIx so you can compare to previous index

        let previousGoFrame = goFrames_thisTempo[goFrmIx - 1];
        let thisBeatDurInFrames = goFrm - previousGoFrame; //because of necessary rounding beats last various amounts of frames usually with in 1 frame difference
        let ascentPct = 0.35; //looks best when descent is longer than ascent
        let descentPct = 1 - ascentPct;
        let numFramesUp = Math.floor(ascentPct * thisBeatDurInFrames);
        let numFramesDown = Math.ceil(descentPct * thisBeatDurInFrames);

        let ascentFactor = 0.2;
        let descentFactor = 2.8;

        let ascentPlot = plot(function(x) { //see Function library; exponential curve
          return Math.pow(x, ascentFactor);
        }, [0, 1, 0, 1], numFramesUp, BB_TRAVEL_DIST); //will create an object with numFramesUp length (x) .y is what you want

        ascentPlot.forEach((ascentPos) => {

          let tBbY = BBCIRC_TOP_CY + ascentPos.y; //calculate the absolute y position of bb
          bbYpos_thisTempo.push(Math.round(tBbY)); //populate bbYpos_thisTempo array with bby position for every frame

          //save first bounce for lead-in
          if (goFrmIx == 1) {
            bbLeadIn.push(tBbY);
          }

        }); // ascentPlot.forEach((ascentPos) => END

        let descentPlot = plot(function(x) {
          return Math.pow(x, descentFactor);
        }, [0, 1, 0, 1], numFramesDown, BB_TRAVEL_DIST);

        descentPlot.forEach((descentPos) => {

          let tBbY = BBCIRC_BOTTOM_CY - descentPos.y;
          bbYpos_thisTempo.push(Math.round(tBbY));

          //save first bounce for lead-in
          if (goFrmIx == 1) {
            bbLeadIn.push(tBbY);
          }

        }); // descentPlot.forEach((descentPos) => END

      } // if(goFrmIx>0) END

    }); // goFrames_thisTempo.forEach((goFrm, goFrmIx) => END

    scoreDataObject.bbYpos_perTempo.push(bbYpos_thisTempo);
    //##endef Main Cycle

    //##ef Lead In
    let leadIn_bbYpos_thisTempo = [];
    //make 1 ascent just before first beat
    bbLeadIn.forEach((bbYpos) => { //leadInAscent is already reversed so first index is lowest bbYpos
      leadIn_bbYpos_thisTempo.push(bbYpos);
    });

    scoreDataObject.leadIn_bbYpos_perTempo.push(leadIn_bbYpos_thisTempo);
    //##endef Lead In


    //##endef Calculate BBs


//#endef GLOBAL VARIABLES



//#ef INIT
function init() {

  makeWorldPanel();
  makeStaves();
  drawNotation();
  makeScrollingTempoCursors();
  makeScrollingCursorBbs();

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

  for (var i = 0; i < NUMLINES; i++) {

    let ty = -18 + (i * VERT_DISTANCE_BETWEEN_LINES);
    let tx1 = -2 + (i * -944);
    let tSvgImage = document.createElementNS(SVG_NS, "image");
    tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/ill20231212/notationSVGs/ILL20231212_SVG.svg');
    tSvgImage.setAttributeNS(null, "y", ty);
    tSvgImage.setAttributeNS(null, "x", tx1);
    tSvgImage.setAttributeNS(null, "visibility", 'visible');
    tSvgImage.setAttributeNS(null, "display", 'yes');
    staves[0].svg.appendChild(tSvgImage);

    //Beat Lines
    for (var j = 0; j < 9; j++) {
      let tx2 = j * 105;
      let y2 = (i * VERT_DISTANCE_BETWEEN_LINES) + 15;
      let tBl = mkSvgLine({
        svgContainer: staves[0].svg,
        x1: tx2,
        y1: y2,
        x2: tx2,
        y2: y2 + 55,
        stroke: 'magenta',
        strokeW: 0.5
      });
      beatLines.push(tBl);
    }

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

}
//#endef Draw Notation SVG

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
    cx: 50,
    cy: 50,
    r: 5,
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
    tempoCursors[0].setAttributeNS(null, 'y2', currScrollingCsrY + 80);
    //Scrolling BB

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
  updateScrollingCsrs();

}
//#endef Update Function

//#ef Draw Function
function draw(epochClock_MS) {

}
//#endef Draw Function


//#endef WIPE/UPDATE/DRAW


//#endef ANIMATION





//
