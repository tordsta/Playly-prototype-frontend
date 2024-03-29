function CEndPanel(oSpriteBg){
    
    var _oFade;
    var _oBg;
    var _oGroup;
    
    var _oMsgText;
    var _oScoreText;
    var _iScore;
    var _oButRestart;
    var _oButHome;
    var _oParent;
    
    this._init = function(oSpriteBg){
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oFade.on("mousedown",function(){});
        s_oStage.addChild(_oFade);
        
        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        s_oStage.addChild(_oGroup);

        new createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oBg = createBitmap(oSpriteBg);
        var oBgInfo = _oBg.getBounds();
        _oBg.regX = oBgInfo.width/2;
        _oBg.regY = oBgInfo.height/2;
        _oBg.x = CANVAS_WIDTH/2;
        _oBg.y = CANVAS_HEIGHT/2;
        _oGroup.addChild(_oBg);


        _oMsgText = new CTLText(_oGroup, 
                    CANVAS_WIDTH/2-250, (CANVAS_HEIGHT/2)-130, 500, 150, 
                    50, "center", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    " ",
                    true, true, true,
                    false );

        
        _oScoreText = new CTLText(_oGroup, 
                    CANVAS_WIDTH/2-250, (CANVAS_HEIGHT/2)+30, 500, 50, 
                    50, "center", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false );

        
        var oSprite = s_oSpriteLibrary.getSprite("but_restart");
        _oButRestart = new CGfxButton(CANVAS_WIDTH/2+60,CANVAS_HEIGHT/2+180,oSprite,_oGroup);
        
        oSprite = s_oSpriteLibrary.getSprite("but_home");
        _oButHome = new CGfxButton(CANVAS_WIDTH/2-60,CANVAS_HEIGHT/2+180,oSprite,_oGroup);
    };
    
    this.unload = function(){
        _oButRestart.unload();
        _oButHome.unload();
        
        _oFade.removeAllEventListeners();
        _oGroup.removeAllEventListeners();
        
        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oGroup);
    };
    
    this._initListener = function(){
        _oButHome.addEventListener(ON_MOUSE_DOWN,this._onExit,this);
        _oButRestart.addEventListener(ON_MOUSE_DOWN,this._onRestart, this);
    };
    
    this.show = function(iScore,iWinner){
	playSound("game_over",1,false);
        _iScore = iScore;
        
        var iPlayerWin = iWinner + 1;
        
        if (iWinner===0){
            _oMsgText.refreshText(TEXT_GAMEOVER);
            _oMsgText.y = (CANVAS_HEIGHT/2)-30;
        }else{
            iScore = 0;
            _iScore = 0;
            _oMsgText.refreshText(sprintf(TEXT_LOSE, iPlayerWin) );
        }
        
        _oScoreText.refreshText(TEXT_SCORE +": "+iScore);
        
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {oParent._initListener();});
        
        $(s_oMain).trigger("save_score",iScore);  
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
    };
    
    this._onExit = function(){      
        $(s_oMain).trigger("share_event",_iScore);
        
        _oGroup.off("mousedown",this._onExit);
        s_oStage.removeChild(_oGroup);
        
        
        
        s_oGame.unload();
        s_oMain.gotoMenu();
    };
    
    this._onRestart = function(){
        _oParent.unload();
        s_oGame.restart();
        
        /*
        s_oGame.unload();
        s_oMain.gotoGame(false);
        * 
        */
    };
    
    this._init(oSpriteBg);
    
    _oParent = this;
    return this;
}
