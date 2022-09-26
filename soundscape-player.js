
var custom_audio_player = {
  init: function() {
    const audio = document.querySelector('audio');
    const audioPlayerContainer = document.getElementById('audio-player');
    const sundscapePlayer = document.getElementsByClassName("soundscape-player")[0];

    this.create_basic_controls(audioPlayerContainer);
    this.create_advanced_controls(audioPlayerContainer);
    const playIconContainer = document.getElementById('play-icon');
    const seekSlider = document.getElementById('seek-slider');
    const volumeSlider = document.getElementById('volume-slider');
    const speedSlider = document.getElementById('pbrate');
    const muteIconContainer = document.getElementById('mute-icon');


    let playState = 'play';
    let muteState = 'unmute';
    var rate = 1.0;

    const source = document.getElementById('audio-src');
    const original_source = source.src;
    const expanded_src = document.getElementById('expanded-audio-src');
    var expanded_source = null;

    if (expanded_src){
      expanded_source = expanded_src.src;
    } else {
      speedSlider.min = 0.065;
    }

    const playAnimation = bodymovin.loadAnimation({
      container: playIconContainer,
      path: 'https://maxst.icons8.com/vue-static/landings/animated-icons/icons/pause/pause.json',
      renderer: 'svg',
      loop: false,
      autoplay: false,
      name: "Play Animation",
    });

    const muteAnimation = bodymovin.loadAnimation({
        container: muteIconContainer,
        path: 'https://maxst.icons8.com/vue-static/landings/animated-icons/icons/mute/mute.json',
        renderer: 'svg',
        loop: false,
        autoplay: false,
        name: "Mute Animation",
    });

    playAnimation.goToAndStop(14, true);

    playIconContainer.addEventListener('click', () => {
        if(playState === 'play') {
            audio.play();
            playAnimation.playSegments([14, 27], true);
            requestAnimationFrame(whilePlaying);
            playState = 'pause';
        } else {
            audio.pause();
            playAnimation.playSegments([0, 14], true);
            cancelAnimationFrame(raf);
            playState = 'play';
        }
    });

    muteIconContainer.addEventListener('click', () => {
        if(muteState === 'unmute') {
            muteAnimation.playSegments([0, 15], true);
            audio.muted = true;
            muteState = 'mute';
        } else {
            muteAnimation.playSegments([15, 25], true);
            audio.muted = false;
            muteState = 'unmute';
        }
    });

    const showRangeProgress = (rangeInput) => {
        if(rangeInput === seekSlider) {
          audioPlayerContainer.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
        } else if (rangeInput === volumeSlider) {
          audioPlayerContainer.style.setProperty('--volume-before-width', rangeInput.value / rangeInput.max * 100 + '%');
        } else {
          audioPlayerContainer.style.setProperty('--speed-before-width', (rangeInput.value-rangeInput.min) / (rangeInput.max-rangeInput.min) * 100 + '%');
        }
    }

    seekSlider.addEventListener('input', (e) => {
        showRangeProgress(e.target);
    });
    volumeSlider.addEventListener('input', (e) => {
        showRangeProgress(e.target);
    });

    speedSlider.addEventListener('input', (e) => {
        showRangeProgress(e.target);
    });

    audio.addEventListener('ended', (e) => {
      if (playState == 'pause'){
        playAnimation.playSegments([0, 14], true);
        cancelAnimationFrame(raf);
        playState = 'play';
      }
    });

    const currentTimeContainer = document.getElementById('current-time');
    const outputContainer = document.getElementById('volume-output');
    let raf = null;

    const calculateTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${returnedSeconds}`;
    }

    soundscapeStep = (sundscapePlayer.getAttribute('step')) ? sundscapePlayer.getAttribute('step') : 30*60;
    soundscapeRate = (sundscapePlayer.getAttribute('rate')) ? sundscapePlayer.getAttribute('rate') : 5;
    startHour = (sundscapePlayer.getAttribute('hour-start')) ? sundscapePlayer.getAttribute('hour-start') : 0;
    startMinute = (sundscapePlayer.getAttribute('minute-start')) ? sundscapePlayer.getAttribute('minute-start') : 0;
    ampm = (sundscapePlayer.getAttribute('am-pm')) ? sundscapePlayer.getAttribute('am-pm') : true;

    const time2string = (secs, duration) => {
      relSeconds = Math.floor(secs/soundscapeRate)*soundscapeStep;
      hours = Math.floor(relSeconds / 3600);
      minutes = (relSeconds - hours*3600)/60;
      cycle_hour = (startHour + hours) % 24;
      am_suffix = ""
      if (ampm) {
        am_suffix = " AM"
        if (cycle_hour >= 12 && cycle_hour <= 23 ) {
          am_suffix = " PM";
          if (cycle_hour > 12){
            cycle_hour = (cycle_hour - 12);
          }
        } else if (cycle_hour == 0) {
          cycle_hour = 12;
        }
      }

      const returnedHours = cycle_hour < 10 ? `0${cycle_hour}` : `${cycle_hour}`;
      const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

      return returnedHours+":"+returnedMinutes+am_suffix;
    }


    const setPlayerParams = () => {
        if (expanded_source){
          if (source.src === expanded_source){
            rate = 50;
          } else {
            rate = 1;
          }
        }
        seekSlider.max = audio.duration/rate;
        seekSlider.step = 1/100;
    }

    const displayBufferedAmount = () => {
        const bufferedAmount = Math.floor(audio.buffered.end(audio.buffered.length - 1));
        audioPlayerContainer.style.setProperty('--buffered-width', `${(bufferedAmount / seekSlider.max) * 100}%`);
    }

    const displayComposedTime = () => {
      seekSlider.value = audio.currentTime/rate;
      time = time2string(Math.floor(seekSlider.value), audio.duration/rate)
      // duration_text = calculateTime(audio.duration/rate);
      // current_time_text = calculateTime(Math.floor(seekSlider.value));
      currentTimeContainer.textContent = time;
    }
    const whilePlaying = () => {
        duration_text = calculateTime(audio.duration/rate);
        if (duration_text != "NaN:NaN"){
          seekSlider.value = audio.currentTime/rate;
          time = time2string(Math.floor(seekSlider.value), audio.duration/rate)
          // current_time_text = calculateTime(Math.floor(seekSlider.value));
          currentTimeContainer.textContent = time;
          audioPlayerContainer.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
        }
        raf = requestAnimationFrame(whilePlaying);

    }

    showRangeProgress(speedSlider);

    audio.addEventListener('loadedmetadata', () => {
        setPlayerParams();
        displayComposedTime();
        displayBufferedAmount();
    });

    audio.addEventListener('progress', displayBufferedAmount);

    seekSlider.addEventListener('input', () => {
        audio.currentTime = seekSlider.value*rate;
        // if(!audio.paused) {
        requestAnimationFrame(whilePlaying);
        // }
    });

    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        // outputContainer.textContent = value;
        audio.volume = value / 100;
    });

  },
  create_basic_controls: function(audio_player){
    var div = document.createElement('div');
    div.className = 'basic_audio_controls';
    htmlString =  '<div class="progress_control"><button id="play-icon"></button><span id="current-time" class="time">0:00/0:00</span><input type="range" id="seek-slider" max="100" value="0"></div><div class="volume_control"><button id="mute-icon"></button><input type="range" id="volume-slider" max="100" value="100"></div>';
    div.innerHTML = htmlString.trim();
    audio_player.appendChild(div);
  },
  create_advanced_controls: function(audio_player){
    var div = document.createElement('div');
    div.className = 'advanced-controls';
    htmlString = '<div class="speed-control"><div class="speed-input" style="margin-left: 10px"><label for="pbrate"><img src="icon/speed.png" style="float: left;" title="Velocidad" alt="" /></label><input type="range" id="pbrate" min=0.005 max=2.0 value=1.0 step=.0001></div><div class="speed-display" style="font-family: "Orbitron", sans-serif;">1.000</div></div>';
    div.innerHTML = htmlString.trim();
    audio_player.appendChild(div);
  }
};

var editMouseMove = function(e){
  viewer = document.getElementsByClassName("sp-viewer")[0];
  tmp_interval = document.getElementById("tmp-interval");
  pos = e.screenX - viewer.offsetWidth + (e.screenX - e.clientX);
  former_pos = parseInt(tmp_interval.style.left.replace(/px/i, ''));
  new_width = pos - former_pos;
  if (new_width < 0){
    new_width = 1;
  }
  tmp_interval.style.width = new_width+"px";
  tmp_interval.style.visibility = "visible";

};
var editMouseDown = function(e){
  viewer = document.getElementsByClassName("sp-viewer")[0];
  tmp_interval = document.getElementById("tmp-interval");
  if (tmp_interval.firstClick == true){
    viewer.addEventListener("mousemove", editMouseMove);
    pos = e.screenX - viewer.offsetWidth + (e.screenX - e.clientX);
    tmp_interval.style.width = "1px";
    tmp_interval.style.left = pos+'px';
    tmp_interval.style.visibility = "visible";
    tmp_interval.firstClick = false;
  } else {
    viewer.removeEventListener("mousemove", editMouseMove);
    /*Save annotation and proceed*/
    tmp_interval.style.visibility = "hidden";
    tmp_interval.style.width = "1px";
    tmp_interval.style.left = 0+'px';
    tmp_interval.firstClick = true;
    console.log("Done annotating")
  }
};
var soundscape_player = {
  defaultViewWidth: 500,
  defaultWidth: 500,
  defaultHeight: 200,
  defaultFreqMin: 0,
  defaultFreqMax: 20,
  defaultAxisWidth: 30,
  defaultAxisDivisionHeight: 40,
  defaultAxisSmoothing: 2,
  isEdit: false,
  drawObj: null,
  playerIDs: [],
  annotations: [],
  init: function() {
    players = document.getElementsByClassName("soundscape-player");
    for (i = 0; i < players.length; i++) {
      player = players[i];

      imgElms = player.getElementsByTagName("img");
      if (imgElms.length == 0) {
        console.log('Soundscape Player: Missing image element');
        continue;
      } else if (imgElms.length > 1) {
        console.log('Soundscape Player: Found multiple images in player. First image element is assumed to be the soundscape.')
      }

      audioElms = player.getElementsByTagName("audio");
      displays = player.getElementsByTagName('span');
      speed_displays = player.getElementsByClassName("speed-display");

      if (audioElms.length == 0) {
        console.log('Soundscape Player: Missing audio element');
        continue;
      } else if (audioElms.length != 1) {
        console.log('Soundscape Player: Found multiple audio elements in player. First audio element is assumed to be the audio file.')
      }

      view_width = (player.getAttribute('view-width')) ? player.getAttribute('view-width') : this.defaultViewWidth;
      width = (player.getAttribute('data-width')) ? player.getAttribute('data-width') : this.defaultWidth;
      height = (player.getAttribute('data-height')) ? player.getAttribute('data-height') : this.defaultHeight;
      freqMin = (player.getAttribute('data-freq-min')) ? player.getAttribute('data-freq-min') : this.defaultFreqMin;
      freqMax = (player.getAttribute('data-freq-max')) ? player.getAttribute('data-freq-max') : this.defaultFreqMax;
      axisWidth = (player.getAttribute('data-axis-width')) ? player.getAttribute('data-axis-width') : this.defaultAxisWidth;
      axisDivisionHeight = (player.getAttribute('data-axis-division-height')) ? player.getAttribute('data-axis-division-height') : this.defaultAxisDivisionHeight;
      axisSmoothing = (player.getAttribute('data-axis-smoothing')) ? player.getAttribute('data-axis-smoothing') : this.defaultAxisSmoothing;

      soundscape = imgElms[0].src;
      imgElms[0].parentNode.removeChild(imgElms[0]);

      audio = audioElms[0];
      audio.id = "sp-audio" + i;
      audio.style.width = "500px";

      playbackrate = document.getElementById("pbrate");
      display = displays[0]
      speed_display = speed_displays[0]

      const displayvalue = val => {
        return parseFloat(val).toFixed(3);
      }

      speed_display.innerHTML = displayvalue(playbackrate.value);
      source = document.getElementById('audio-src');
      original_source = source.src;
      expanded_src = document.getElementById('expanded-audio-src');
      expanded_source = null;
      if (expanded_src) {
        expanded_source = expanded_src.src;
      }

      playbackrate.addEventListener('input', e => {
        trate = playbackrate.value;
        ctime_display = document.querySelector('.-webkit-media-controls-time-remaining-display');
        if (playbackrate.value < 0.065 && expanded_source) {
          trate = 50*trate;
          if (source.src != expanded_source){
            source.src = expanded_source;
            currenttime = audio.currentTime*50;
            paused = audio.paused;
            audio.load();
            audio.currentTime = currenttime;
            if (!paused){
              audio.play();
            }
          }
        } else if (expanded_source) {
          if (source.src == expanded_source){
            source.src = original_source;
            currenttime = audio.currentTime/50;
            paused = audio.paused;
            audio.load();
            audio.currentTime = currenttime;
            if (!paused){
              audio.play();
            }
          }
        }
        audio.preservesPitch = false;
        audio.playbackRate = trate;
        speed_display.innerHTML = displayvalue(playbackrate.value);
      });

      // ann_button = document.getElementById("annotation-button")
      // ann_button.addEventListener('click', e => {
      //   if (ann_button.className == "annotate-button-released") {
      //     ann_button.className = "annotate-button-pressed";
      //     this.editorOn(viewer)
      //   } else {
      //     ann_button.className = "annotate-button-released";
      //     this.editorOff(viewer)
      //   }
      // });
      //Create viewer element
      viewer = document.createElement('div');
      viewer.className = "sp-viewer";
      viewer.id = "sp-viewer" + i;

      viewer.style.width = view_width + "px";
      viewer.style.height = height + "px";

      viewer.style.backgroundImage = "url('" + soundscape + "')";
      viewer.style.backgroundPosition = width / 2 + "px";
      viewer.style.backgroundSize = "auto " + height + "px";

      if (axisWidth > 0) {
        divisions = Math.floor(height / axisDivisionHeight);
        if (axisSmoothing != 0)
          divisions = this.smoothAxis(freqMax - freqMin, divisions, [0, .5, .25], axisSmoothing);

        axis = this.drawAxis(axisWidth, height, freqMin, freqMax, divisions, "kHz");
        axis.className = "sp-axis";
        viewer.appendChild(axis);
      }

      timeBar = document.createElement('div');
      timeBar.className = "sp-timeBar";
      viewer.appendChild(timeBar);

      tmp_interval = document.createElement('div');
      tmp_interval.id = "tmp-interval";
      tmp_interval.className = "interval";
      tmp_interval.style.visibility = "hidden";
      tmp_interval.firstClick = true;
      viewer.appendChild(tmp_interval);

      if (!typeof annotations === 'undefined'){
        for (n = 0; n < annotations.length; n++) {
          this.addAnnotation(viewer, annotations[n]);
        }
      }

      player.insertBefore(viewer, player.firstChild);
      this.playerIDs.push(i);
      audio.load();
    }

    setInterval(function() {
      soundscape_player.moveSoundscapes();
    }, 33);

  },
  editorOn: function(viewer) {
    this.isEdit = true;
    tmp_interval = document.getElementById("tmp-interval");
    tmp_interval.firstClick = true;
    viewer.addEventListener("mousedown", editMouseDown);
  },
  editorOff: function(viewer) {
    this.isEdit = false;
    viewer.removeEventListener("mousedown", editMouseDown);
    viewer.removeEventListener("mousemove", editMouseMove);
  },
  addAnnotation: function(viewer, metadata){
    this.annotations.push(document.createElement('div'));
    ann_index = this.annotations.length -1;
    this.annotations[ann_index].className = "sp-annotation";
    this.annotations[ann_index].annotation_index = ann_index;
    this.annotations[ann_index].metadata = metadata;
    this.annotations[ann_index].addEventListener('click', e => {
      this.selectAnnotation(e.srcElement.annotation_index);
    });
    viewer.appendChild(this.annotations[ann_index]);
  },
  selectAnnotation: function(aindex) {
    alert(JSON.stringify(this.annotations[aindex].metadata));
  },
  positionAnnotations: function(spec_width, viewer_width, audio) {
    duration = audio.duration;
    for (i = 0; i < this.annotations.length; i++) {
      start_time = this.annotations[i].metadata.start_time;
      end_time = this.annotations[i].metadata.end_time;
      start = start_time / duration * spec_width;
      end = end_time / duration * spec_width;
      width = end - start;
      margin_start = start + viewer_width / 2 - audio.currentTime / duration * spec_width;
      margin_end = end + viewer_width / 2 - audio.currentTime / duration * spec_width;
      hide = false;
      if (viewer_width - margin_start < width) {
        if (viewer_width - margin_start <= 0){
          hide = true;
        } else {
          width = viewer_width - margin_start;
        }
      } else if (margin_start <= 0) {
        width = width + margin_start;
        margin_start = 0;
      }
      if (margin_end <= 0) {
        hide = true;
      }
      if (hide==true) {
        this.annotations[i].style.visibility = "hidden";
      } else {
        this.annotations[i].style.visibility = "visible";
      }
      this.annotations[i].style.width = width + "px";
      this.annotations[i].style.marginLeft = margin_start + "px";
    }
  },
  moveSoundscapes: function() {
    for (i = 0; i < this.playerIDs.length; i++) {
      id = this.playerIDs[i];
      audio = document.getElementById("sp-audio" + id);
      viewer = document.getElementById("sp-viewer" + id);
      viewerWidth = viewer.offsetWidth;
      duration = audio.duration;

      viewerStyle = viewer.currentStyle || window.getComputedStyle(viewer, false);
      img = new Image();
      //remove url(" and ") from backgroundImage string
      img.src = viewerStyle.backgroundImage.replace(/url\(\"|\"\)$/ig, '');
      //get the width of the soundscape image based on its scaled size * its native size
      spectWidth = viewer.offsetHeight / img.height * img.width;

      viewer.style.backgroundPosition = viewerWidth / 2 - audio.currentTime / duration * spectWidth + "px";

      this.positionAnnotations(spectWidth, viewerWidth, audio);
    }
  },
  smoothAxis: function(range, baseDivision, allowedDecimals, distance) {
    if (distance == 0)
      return baseDivision;

    subtractFirst = (distance < 0) ? false : true;

    for (var i = 0; i <= distance; i++) {
      d1 = (subtractFirst) ? baseDivision - i : baseDivision + i;
      d2 = (subtractFirst) ? baseDivision + i : baseDivision - i;

      if (d1 > 0) {
        decimal = this.qoutientDecimal(range, d1, 4)
        if (allowedDecimals.indexOf(decimal) > -1)
          return d1;
      }

      if (d2 > 0) {
        decimal = this.qoutientDecimal(range, d2, 4)
        if (allowedDecimals.indexOf(decimal) > -1)
          return d2;
      }
    }

    return baseDivision;
  },
  drawAxis: function(width, height, min, max, divisions, unit) {
    axis = document.createElement('canvas');
    axis.width = width;
    axis.height = height;

    ctx = axis.getContext("2d");

    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.fillRect(0, 0, width, height);

    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgb(255, 153, 0)";
    ctx.strokeStyle = "rgb(255, 153, 0)";

    range = max - min;

    for (var i = 0; i < divisions; i++) {
      y = Math.round(height / divisions * i);
      ctx.moveTo(0, y + .5);
      ctx.lineTo(width, y + .5);
      ctx.stroke();

      curVal = (divisions - i) * range / divisions + min * 1;

      ctx.fillText(Math.round(curVal * 100) / 100, width, y);
    }

    ctx.textBaseline = "bottom";
    ctx.fillText(unit, width, height);

    return axis;
  },
  qoutientDecimal: function(dividend, divisor, precision) {
    quotient = dividend / divisor;

    if (precision === undefined)
      b = 1;
    else
      b = Math.pow(10, precision);

    return Math.round(quotient % 1 * b) / b;
  }
};

window.onload = function() {
    custom_audio_player.init();
    soundscape_player.init();
};
