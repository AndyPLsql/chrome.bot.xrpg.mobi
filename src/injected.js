console.log("Ok injected file loaded");

//ENUMS
let InfoTypesEnum = Object.freeze({"simple":0, "info":1, "warning":2, "details":3})

//Settings
let job = "unknown"; // "unknown", "underground", "tavern"
let jobs = [];
let currentJobId = 0;
let state = "idle"; // "idle", "unknown", "prepare", "complete", "execution", "fight"
let mode = "auto"; //"auto", "manual"
let debugLevel = 0;
let infoLevel = 1;
let rewardSilverTotal = 0;
let rewardKeyTotal = 0;
let rewardSilverArena = 0;
let rewardKeyArena = 0;
let repeatCount = 0;
let arenaCountdown = 15;

function init() {
  job = "unknown";
  jobs = ["arena", "underground", "underground", "underground", "tavern", "bag"];
  currentJobId = 0;
  state = "idle";
  mode = "auto";
  debugLevel = 0;
  rewardSilverTotal = 0;
  rewardKeyTotal = 0;
  rewardSilverArena = 0;
  rewardKeyArena = 0;
  repeatCount = 0;
  arenaCountdown = 15;
}

function ai_on(){
  //Точка входа
  printInfoMessage("---AI ON---");
  
  // let evtFocus = new MouseEvent('focus', {
  //   bubbles: false,
  //   cancelBubble: false,
  //   cancelable: false,
  //   composed: false,
  //   defaultPrevented: false,
  //   eventPhase: 0,
  //   isTrusted: false,
  //   returnValue: true,
  // });
  // window.dispatchEvent(evtFocus);

  window.onblur = null; // Чтобы страницы работали в фоне

  init();
  setTimeout(loops, 8000);
}

function ai_off() {
  printInfoMessage("---AI OFF---");
  let highestTimeoutId = setTimeout(";");
  for (let i = 0 ; i < highestTimeoutId ; i++) {
    clearTimeout(i);
  }
  init();
}

function ai_reset() {
  printInfoMessage("---AI RESET---");
  location.reload();
  ai_off();
  setTimeout(loops, 8000);
}

function closeLevelUpNotification() {
  let btn = $('div.levelUpNotification').find('div.button-content:contains("Закрыть")')[0];
  if (btn !== undefined) {
    btn.click();
  }
}

function closeClaimRewardNotification() {
  let btn = $('div.claimRewardNotification').find('div.button-content:contains("Получить")')[0];
  if (btn !== undefined) {
    btn.click();
  }
}

function loops() {
  printDebugInfo("loops");

  if (repeatCount > 150) {
    ai_reset();
    return;
  }

  let pwd = getPlace();
  if ( (state === "idle" || state === "complete") && pwd !== "main") {
    openHomePage(loops);
    return;
  }

  if ($('div.spinner-loading').length > 0) {
    repeatCount += 10;
    printInfoMessage("Long loading (repeatCount=" + repeatCount + ")", InfoTypesEnum.warning)
  } else {
    if (state === "idle" || state === "complete") {
      repeatCount = 0;
    }
  }

  closeLevelUpNotification();
  closeClaimRewardNotification();

  if (state === "idle" || state === "complete") {
    switch (jobs[currentJobId++]) {
      case "underground":
        goUnderground();
        break;
      case "arena":
        if (arenaCountdown-- > 0) {
          goArena();
        }
        break;
      case "tavern":
        goTavern();
        break;
      case "bag":
        goBag();
        break;
      default:
        currentJobId = 0;
        break;
    }
  }

  if (mode === "auto") {
    let st = setTimeout(loops,  18000);
  } else {
    printInfoMessage("loops is off");
  }

}

function getPlace() {
  let pwd = location.href.replace("http://xrpg.mobi/?src=portal#/","").replace(/^\/+|\/+$/g,"")
  if (pwd === "") {
    pwd = "unknown";
  }
  return pwd;
}

function openHomePage(nextfunc, timeout = 3000) {
  printDebugInfo("openHomePage");
  let pwd = getPlace();
  if ( pwd !== "main")
  {
    let btnHome =  $('div.footer-sectionName:contains("Домой")')[0]
    if (btnHome !== undefined)
    {
      btnHome.click();
    }
    else
    {
      repeatCount += 5;
      printInfoMessage("Не нашли кнопку домой! (repeatCount="+ repeatCount+")", InfoTypesEnum.warning);
    }
  }
  if (nextfunc !== undefined)
  {
    setTimeout(nextfunc, timeout);
  }
}

function openHeroProfile(nextfunc, timeout = 3000){
  printDebugInfo("openHeroProfile");
  let pwd = getPlace();
  if (pwd.search("profile") === -1) {
    let btnProfile = $('div.footer-sectionName:contains("Герой")')[0]
    if (btnProfile !== undefined) {
      btnProfile.click();
    }
    else {
      repeatCount += 5;
      printInfoMessage("Не нашли кнопку Герой! (repeatCount="+ repeatCount+")", InfoTypesEnum.warning);
    }
  }
  if (nextfunc !== undefined)
  {
    setTimeout(nextfunc, timeout);
  }
}

function printDebugInfo(funcName, _debugLevel=debugLevel) {
  if (_debugLevel > 0) {
    console.log("func:" + funcName + " | job:" + job + " | state: " + state);
  }
}

/**
 * Вывод информационных сообщений
 * @param message Сообщение которое нужно отобразить
 * @param _infoType Тип выводимого сообщения (enum)
 * @param _infoLevel Уровень детализации
 */
function printInfoMessage(message, _infoType=InfoTypesEnum.simple, _infoLevel=infoLevel) {
  if (_infoLevel > 0) {
    switch (_infoType) {
      case InfoTypesEnum.simple:
        console.log(message);
        break;
      case InfoTypesEnum.info:
        console.log("%c" + message, "color: white; background-color: green;");
        break;
      case InfoTypesEnum.warning:
        console.log("%c" + message, "color: white; font-style: italic; background-color: red; padding: 2px;");
        break;
      case InfoTypesEnum.details:
        console.log("%c" + message, "color: black; font-style: italic; background-color: aqua; padding: 2px;");
        break;
      default:
        console.log(message);
        break;
    }
  }
}

function kick(canvas) {
    let x = Math.round(window.innerWidth/2);
    let y = 460;
    let evtFocus = new MouseEvent('focus', {
      bubbles: false,
      cancelBubble: false,
      cancelable: false,
      composed: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      returnValue: true,
    });

    let evtDown = new MouseEvent('mousedown', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 1,
      eventPhase: 0,
      fromElement: null,
      identifier: 0,
      isTrusted: false,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      relatedTarget: null,
      returnValue: true,
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });
    let evtUp = new MouseEvent('mouseup', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 1,
      eventPhase: 2,
      fromElement: null,
      identifier: 0,
      isTrusted: true,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      relatedTarget: null,
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });    
    let evtOver = new MouseEvent('mouseover', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: canvas,
      defaultPrevented: false,
      detail: 0,
      eventPhase: 2,
      isTrusted: true,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      mozInputSource: 1,
      mozPressure: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });

    x = Math.round(window.innerWidth/2) - 60;
    y = 470;
    let evtLeftDown = new MouseEvent('mousedown', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 1,
      eventPhase: 0,
      fromElement: null,
      identifier: 0,
      isTrusted: false,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      relatedTarget: null,
      returnValue: true,
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });
    let evtLeftUp = new MouseEvent('mouseup', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 1,
      eventPhase: 2,
      fromElement: null,
      identifier: 0,
      isTrusted: true,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      relatedTarget: null,
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });    
    let evtLeftOver = new MouseEvent('mouseover', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: canvas,
      defaultPrevented: false,
      detail: 0,
      eventPhase: 2,
      isTrusted: true,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      mozInputSource: 1,
      mozPressure: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });

    x = Math.round(window.innerWidth/2) + 60;
    y = 471;

    let evtRightDown = new MouseEvent('mousedown', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 1,
      eventPhase: 0,
      fromElement: null,
      identifier: 0,
      isTrusted: false,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      relatedTarget: null,
      returnValue: true,
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });
    let evtRightUp = new MouseEvent('mouseup', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 1,
      eventPhase: 2,
      fromElement: null,
      identifier: 0,
      isTrusted: true,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      relatedTarget: null,
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });    
    let evtRightOver = new MouseEvent('mouseover', {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelBubble: false,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      currentTarget: canvas,
      defaultPrevented: false,
      detail: 0,
      eventPhase: 2,
      isTrusted: true,
      layerX: x,
      layerY: y,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      mozInputSource: 1,
      mozPressure: 0,
      offsetX: x,
      offsetY: y,
      pageX: x,
      pageY: y,
      //path ?
      screenX: x,
      screenY: y,
      shiftKey: false,
      which: 1,
      x: x,
      y: y
    });

    canvas.dispatchEvent(evtLeftOver);
    canvas.dispatchEvent(evtLeftDown);
    canvas.dispatchEvent(evtLeftUp);
    //console.log("left kick. x:", evtLeftDown.clientX, "y:", evtLeftDown.clientY)

    canvas.dispatchEvent(evtRightOver);
    canvas.dispatchEvent(evtRightDown);
    canvas.dispatchEvent(evtRightUp);
    //console.log("right kick. x:", evtRightDown.clientX, "y:", evtRightDown.clientY)

    window.dispatchEvent(evtFocus);
    canvas.dispatchEvent(evtOver);
    canvas.dispatchEvent(evtDown);
    canvas.dispatchEvent(evtUp);
    //console.log("main kick. x:", evtDown.clientX, "y:", evtDown.clientY)
}

function goUnderground() {
  printDebugInfo("goUnderground");
  repeatCount++;
  job = "underground"
  let btnWar;
  if (state === "idle" || state === "complete") {
    state = "prepare";
    btnWar = $('div.mainPage-locations').find('div.questBlock.questBlock_isClickable-true.questBlock_isAvailable-true')[0];
    if (btnWar !== undefined) {
      btnWar.click();
      setTimeout(goUnderground, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }

  if (state === "prepare") {
    state = "execution";
    btnWar = $('div.button-content:contains("В бой")')[0];
    if (btnWar !== undefined) {
      btnWar.click();
      state = "prepare";
      setTimeout(goUnderground, 1000);
      return;
    }

    btnWar = $('div.button-content:contains("Войти")')[0];
    if (btnWar !== undefined) {
      btnWar.click();
      state = "prepare";
      setTimeout(goUnderground, 1000);
      return;
    }
    
    let canvas = $('div[class*="fightscene"]').find('canvas')[0];
    if (canvas === undefined) {
      state = "complete";
      return
    }
  }

  if (state === "execution") {
    let getAward = $('div.button-content:contains("Получить")')[0];
    if (getAward !== undefined) {
     getAward.click();
     state = "complete";
     setTimeout(goUnderground, 2000);
     return;
    }
    
    getAward = $('div.button-content:contains("Следующий")')[0]
    if (getAward !== undefined) {
     getAward.click();
     state = "execution";
     setTimeout(goUnderground, 2000);
     return;
    }  
    
    getAward = $('div.button-content:contains("Убить босса!")')[0]
    if (getAward !== undefined) {
     getAward.click();
     state = "execution";
     setTimeout(goUnderground, 2000);
     return;
    }     
    
    getAward = $('div.button-content:contains("Продолжить")')[0]
    if (getAward !== undefined) {
     getAward.click();
     state = "complete";
     setTimeout(goUnderground, 2000);
     return;
    }      
    
    let canvas = $('div[class*="fightscene"]').find('canvas')[0];
    if (canvas === undefined) {
      state = "complete";
      return
    }
    
    kick(canvas);
    state = "execution";
    setTimeout(goUnderground, 973);
    return;
  }
  printDebugInfo("goUnderground");
}

function goArena() {
  printDebugInfo("goArena");
  job = "arena";
  repeatCount++;
  if (state === "idle" || state === "complete") {
    state = "prepare";
    let btnArena =  $('div.sectionIcon-name:contains("Арена")')[0]
    if (btnArena !== undefined) {
      btnArena.click();
      setTimeout(goArena, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }

  if (state !== "exit") {
    let btnToWar = $('div.button-content:contains("Продолжить")');
    if (btnToWar.length > 0) {
      state = "exit";
      setTimeout(goArena, 2000);
      return;
    }
  }

  if (state === "prepare") {
    state = "wait";
    let btnArena =  $('div.arenaEntryActivity-enterButton.arenaEntryActivity-enterButton_isDisabled-false')[0];
    if (btnArena !== undefined) {
      btnArena.click();
      setTimeout(goArena, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }

  if (state === "exit") {
    let btnToWar = $('div.button-content:contains("Продолжить")');
    if (btnToWar.length > 0) {
      //Подсчет серебра
      let rs = $('span.arenaResults-rewardResource');
      if (rs.length > 0) {
        rs.each( function( index, value ) {
          rewardSilverArena = value.textContent-0;
        } );
      } else {
        rewardSilverArena = 0;
      }
      //Подсчет ключей
      rs = $('div.arenaResults-keysReward');
      if (rs.length > 0) {
        rs.each( function( index, value ) {
          let xstr = value.textContent.match( /Ключей найдено в бою: (\d+) из (\d+)/i );
          rewardKeyArena += xstr[1]-0;
        } );
      } else {
        rewardKeyArena = 0;
      }

      rewardSilverTotal += rewardSilverArena;
      rewardKeyTotal += rewardKeyArena;

      btnToWar.each(function( index ) {
        $(this).click();
      });
      state = "complete";
      return;
    }
  }

  let canvas = $('div[class*="fightscene"]').find('canvas')[0];
  if (canvas === undefined) {
    state = "wait";
    setTimeout(goArena, 2000);
    return;
  }

  state = "fight";
  kick(canvas);

  setTimeout(goArena, 1712);

}

function goTavern() {
  printDebugInfo("goTavern");
  repeatCount++;
  job = "tavern";
  if (state === "idle" || state === "complete") {
    state = "execution";
    let btnTavern =  $('div.sectionIcon-name:contains("Таверна")')[0]
    if (btnTavern !== undefined) {
      btnTavern.click();
      setTimeout(goTavern, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }
  if (state === "execution") {
    let btnClose = $('div.button-content:contains("Закрыть")')[0];
    if (btnClose !== undefined) {
      btnClose.click();
      setTimeout(goTavern, 1000);
      return;
    }

    let btnsTakeQuest = $('div.button-content:contains("Взять квест")')
    if (btnsTakeQuest.length > 0) {
      btnsTakeQuest.each(function( index ) {
        $(this).click();
      });	
      setTimeout(goTavern, 2000);
      return;
    }    

    let btnsTakeFight = $('div.button-content:contains("Автобой")')[0];
    if (btnsTakeFight !== undefined) {
      btnsTakeFight.click();
      setTimeout(goTavern, 2000);
      return;
    }

    let btnsReward = $('div.button-content:contains("Награда")')[0]
    if (btnsReward !== undefined) {
      btnsReward.click();
      setTimeout(goTavern,2000);
      return;
    }

    btnsReward = $('div.button-content:contains("Продолжить")')[0]
    if (btnsReward !== undefined) {
      btnsReward.click();
      setTimeout(goTavern, 2000);
      return;
    }

    let btnsBox= $('div.progressBar-valueFill[style*="width: 100%;"]')[0];
    if (btnsBox !== undefined) {
      btnsBox.click();
      setTimeout(goTavern, 2000);
      return;
    }  
    
    let btnToWar = $('div.button-content:contains("В бой")')[0];
    if (btnToWar !== undefined) {
      btnToWar.click();
      state = "fight";
      setTimeout(goTavern, 5000);
      return;
    }
    
    let canvas = $('div[class*="fightscene"]').find('canvas')[0];
    if (canvas !== undefined) {
      state = "fight";
      setTimeout(goTavern, 2000);
      return;
    }

    state = "complete";
  }
  if (state === "fight") {
    let getAward = $('div.button-content:contains("Получить")')[0];
    if (getAward !== undefined) {
     getAward.click();
     state = "execution";
     setTimeout(goTavern, 2000);
     return;
    }
    
    getAward = $('div.button-content:contains("Следующий")')[0]
    if (getAward !== undefined) {
     getAward.click();
     state = "fight";
     setTimeout(goTavern, 2000);
     return;
    }  
    
    getAward = $('div.button-content:contains("Продолжить")')[0]
    if (getAward !== undefined) {
     getAward.click();
     state = "execution";
     setTimeout(goTavern, 2000);
     return;
    }

    let canvas = $('div[class*="fightscene"]').find('canvas')[0];
    if (canvas === undefined) {
      state = "execution";
      return
    }
    
    kick(canvas);
    state = "fight";
    setTimeout(goTavern, 973);
    return;

  }
  state = "complete";
  
}

function goBag() {
  printDebugInfo("goBag");
  repeatCount++;
  job = "bag";

  if (state === "idle" || state === "complete") {
    state = "execution";
    let btnBag =  $('div.sectionIcon-name:contains("Сумка")')[0]
    if (btnBag !== undefined) {
      btnBag.click();
      setTimeout(goBag, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }
  
  if (state === "execution") {
    //Сначала закрываем открытые окошки и только потом давим "Разобрать"
    let btnClose = $('div.button-content:contains("Закрыть")')[0];
    if (btnClose !== undefined) {
      btnClose.click();
      setTimeout(goBag, 4000);
      return;
    }    

    let btnDism = $('div.equipmentItemBlock-content:contains("Разобрать")')[0];
    if (btnDism !== undefined) {
      let dismInfo = $(btnDism).find('div.equipmentItemBlock-title')[0].innerText;
      dismInfo += "; " + $(btnDism).find('div.equipmentGrade')[0].innerText;
      
      btnDism = $(btnDism).find('span:contains("Разобрать")')[0];
      if (btnDism !== undefined) {
        btnDism.click();
        printInfoMessage("Разобрано: " + dismInfo, InfoTypesEnum.details);
      } else {
        printInfoMessage("Не разобрано: " + dismInfo, InfoTypesEnum.warning)
      }
      setTimeout(goBag, 4000);
      return;
    }

    state = "complete"
  }

  state = "complete";
}



//Информация о герое
function getHeroInfo() {
  let pwd = getPlace();
  if ( (state === "idle" || state === "complete") && pwd !== "main") {
    openHeroProfile(getHeroInfo);
    return;
  }


}