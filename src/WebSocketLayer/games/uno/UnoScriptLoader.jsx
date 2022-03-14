import React, { useState, useEffect } from 'react';
import jquery from "./js/jquery-3.2.1.min.js";
//import createjs from "./uno/js/createjs.min.js";
import platform from "./js/platform.js";
import iosFullscreen from "./js/ios_fullscreen.js";
import howler from "./js/howler.min.js";
//import ctlUtils from "./uno/js/ctl_utils.js";
import spriteLib from "./js/sprite_lib.js";
import settings from "./js/settings.js";
import CLang from "./js/CLang.js";
import CPreloader from "./js/CPreloader.js";
import CMain from "./js/CMain.js";
import CTextButton from "./js/CTextButton.js";
import CToggle from "./js/CToggle.js";


function ScriptLoader() {
  const [count, setCount] = useState(0);
  const [jqueryLoaded, setJqueryLoaded] = useState(false);

  useEffect(() => {
    jquery(() => {
        setJqueryLoaded(true);
    });
  });


  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      {jqueryLoaded ? "yes" : "no" }
    </div>
  );
}

export default ScriptLoader;