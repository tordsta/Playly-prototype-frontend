import React, { Component, useEffect, useState } from 'react';
import ScriptLoader from "./UnoScriptLoader";
import styled from "styled-components";

const Main = {
  backgroundColor: "#000000",
  backgroundRepeat: "repeat-x",
  backgroundPosition: "top",  
}

const canvas = {
  imageRendering: "optimizeSpeed",
  imageRendering: "-o-crisp-edges",
  imageRendering: "-webkit-optimize-contrast",
  msInterpolationMode: "nearest-neighbor",
  msTouchAction: "none",
}


class UnoTranslator extends Component {
    constructor(props) {
      super(props);
      this.state = {
          something: "something",
      }
    }

    render() {
        return(
          <div style={Main}> {/*"body element"*/}
            <ScriptLoader></ScriptLoader>

            <div style={{backgroundColor: "blue"}}> {/*style="position: fixed; background-color: transparent; top: 0px; left: 0px; width: 100%; height: 100%"*/} 
              
              {/*main script*/}{/**/}
              <div>{/*class="check-fonts"*/}
                <p>test 1</p>{/*class="check-font-1"*/}
              </div>

              <canvas style={canvas}  width="1024" height="576"> </canvas>{/*class='ani_hack'  width="1920" height="1080"*/}
              
              <div data-orientation="landscape" > {/*class="orientation-msg-container"*/}
                <p>Please rotate your device</p> {/*class="orientation-msg-text"*/}
              </div>
              <div id="block_game" style={{position: "fixed", backgroundcolor: "transparent", top: "0px", left: "0px", width: "100%", height: "100%", display:"none"}}>
              </div>{/**/}            
            </div>

          </div>
        );
      }
}  

export default UnoTranslator;