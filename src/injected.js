console.log("Ok injected file loaded");

//ENUMS
let InfoTypesEnum = Object.freeze({"simple":0, "info":1, "warning":2, "details":3})
let JobStatesEnum = Object.freeze({"unknown":-1, "idle":0, "prepare":100, "execution":200, "fight":300, 
  "complete":400, "invasion": 500})


//global temp variables (be careful!)
let jobMessage = "";

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
let arenaCountdown = 340 ;
let waitClanPortalRespawn = false;
let bagLimit = 14;

function init() {
  jobMessage = "";
  job = "unknown";
  jobs = ["fireplace", "clantask", "clanwar", "bag", "task", "underground", "underground", "underground", "invasion",  "arena", "tavern", "ruby" ];
  currentJobId = 0;
  state = "idle";
  mode = "auto";
  debugLevel = 0;
  rewardSilverTotal = 0;
  rewardKeyTotal = 0;
  rewardSilverArena = 0;
  rewardKeyArena = 0;
  repeatCount = 0;
  arenaCountdown = 340;
  bagLimit = 14;
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

  //Выключение звука
  $('div.footer-sound:contains("вкл")').each(function(index) { $(this).click(); });

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
    if (repeatCount >= 110 && repeatCount <= 130) {
      openHomePage(loops);
      return;
    } else {
      state = "idle";
      openHeroProfile(loops);
      return;
    }
  } else {
    if (state === "idle" || state === "complete") {
      repeatCount = 0;
    }
  }

  closeLevelUpNotification();
  closeClaimRewardNotification();

  if (state === "idle" || state === "complete") {
    //Быстрый переход в портал
    if ($('div.mainPage-locations div.questSphere.questSphere_isAvailable-true span.questSphere-labelText:contains("Портал")')[0] !== undefined
      && !waitClanPortalRespawn)
    {
      goClanPortal();
    } else {
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
        case "task":
          goTask();
          break;
        case "clantask":
          goClanTask();
          break;
        case "clanwar":
          goClanWar();
          break;
        case "invasion":
          goInvasion();
          break;
        case "ruby":
          goRuby();
          break;
        case "fireplace":
          goFireplace();
          break;
        default:
          currentJobId = 0;
          break;
      }
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

/**
 * Вывод сообщения хранящегося в переменной jobMessage
 * @param {boolean} clearMessage Очистка глобальной переменной jobMessage после окончания
 */
function printJobMessage(clearMessage=false) {
  printInfoMessage(jobMessage, InfoTypesEnum.info);
  if (clearMessage) {
    jobMessage = "";
  }
}

/**
 * Возвращает события мыши
 * @param {*} x cursor position
 * @param {*} y cursor position
 */
function execMouseEvent(canvas, event, x, y) {
  let retevent;
  switch (event) {
    case "focus":
      retevent = new MouseEvent('focus', {
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        returnValue: true,
      });
      window.dispatchEvent(retevent);
      break;
    case "mousedown":
      retevent = new MouseEvent('mousedown', {
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
      canvas.dispatchEvent(retevent);  
      break;
    case "mouseup":
      retevent = new MouseEvent('mouseup', {
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
      canvas.dispatchEvent(retevent);
      break;
    case "mouseover":
      retevent = new MouseEvent('mouseover', {
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
      canvas.dispatchEvent(retevent);  
      break;
  }
  return retevent;
}

function kick(canvas) {
    printDebugInfo("kick");
    //Удар по центру (арена)
    execMouseEvent(canvas, "focus", Math.round(window.innerWidth/2), 460);
    execMouseEvent(canvas, "mouseover", Math.round(window.innerWidth/2), 460);
    execMouseEvent(canvas, "mousedown", Math.round(window.innerWidth/2), 460);
    execMouseEvent(canvas, "mouseup", Math.round(window.innerWidth/2), 460);

    //Удар по центру (портал)
    execMouseEvent(canvas, "focus", Math.round(window.innerWidth/2), 510);
    execMouseEvent(canvas, "mouseover", Math.round(window.innerWidth/2), 510);
    execMouseEvent(canvas, "mousedown", Math.round(window.innerWidth/2), 510);
    execMouseEvent(canvas, "mouseup", Math.round(window.innerWidth/2), 510);

    //Левый удар (арена)
    execMouseEvent(canvas, "focus", Math.round(window.innerWidth/2) - 60, 470);
    execMouseEvent(canvas, "mouseover", Math.round(window.innerWidth/2) - 60, 470);
    execMouseEvent(canvas, "mousedown", Math.round(window.innerWidth/2) - 60, 470);
    execMouseEvent(canvas, "mouseup", Math.round(window.innerWidth/2) - 60, 470);

    //Левый удар (портал)
    execMouseEvent(canvas, "focus", Math.round(window.innerWidth/2) - 60, 510);
    execMouseEvent(canvas, "mouseover", Math.round(window.innerWidth/2) - 60, 510);
    execMouseEvent(canvas, "mousedown", Math.round(window.innerWidth/2) - 60, 510);
    execMouseEvent(canvas, "mouseup", Math.round(window.innerWidth/2) - 60, 510);

    //Правый удар (арена)
    execMouseEvent(canvas, "focus", Math.round(window.innerWidth/2) + 60, 470);
    execMouseEvent(canvas, "mouseover", Math.round(window.innerWidth/2) + 60, 470);
    execMouseEvent(canvas, "mousedown", Math.round(window.innerWidth/2) + 60, 470);
    execMouseEvent(canvas, "mouseup", Math.round(window.innerWidth/2) + 60, 470);

    //Правый удар (портал)
    execMouseEvent(canvas, "focus", Math.round(window.innerWidth/2) + 60, 510);
    execMouseEvent(canvas, "mouseover", Math.round(window.innerWidth/2) + 60, 510);
    execMouseEvent(canvas, "mousedown", Math.round(window.innerWidth/2) + 60, 510);
    execMouseEvent(canvas, "mouseup", Math.round(window.innerWidth/2) + 60, 510);

}

function goUnderground() {
  printDebugInfo("goUnderground");
  repeatCount++;
  job = "underground"
  let btnWar;
  if (state === "idle" || state === "complete") {
    state = "prepare";
    btnWar = $('div.mainPage-locations div.questSphere.questSphere_isAvailable-true span.questSphere-labelText:contains("Квест"),span.questSphere-labelText:contains("Подземелье")');
    if (btnWar.length > 0) {
      btnWar[0].click();
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
    var currentdate = new Date();
    if(currentdate.getHours() >= 16 && currentdate.getHours() <= 20) {
      state = "complete";
      return
    }

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
      let personLine = $('span.arenaResults-name.arenaResults-name_isSelf-true')[0].parentElement.parentElement
      jobMessage = "Арена: место #" + personLine.getElementsByClassName("arenaResults-tableCell_type-place")[0].innerText
      jobMessage += "; Рейтинг:" + personLine.getElementsByClassName("arenaResults-rankDelta")[0].innerText;
      jobMessage += " (" + personLine.getElementsByClassName("arenaResults-rankValue")[0].innerText + ")";
      
      let results = $('span.arenaResults-rewardResource,div.arenaResults-keysReward');
      for (let i = 0; i < results.length; i++) {
        let listTags = results[i].getElementsByTagName('span');
        for (let t = 0; t < listTags.length; t++ ) {
          let listClasses = listTags[t].classList;
          for (let j = 0; j < listClasses.length; j++ ) {
            switch (listClasses[j]) {
              case "icon_type-gold":
                jobMessage += "; Золото = " + results[i].innerText;
                continue; 
                break;
              case "icon_type-silver":
                jobMessage += "; Серебро = " + results[i].innerText;
                continue; 
                break;
              case "icon_type-key":
                jobMessage += "; Ключи = " + results[i].innerText;
                continue;
                break;
              case "icon_type-soulStone":
                jobMessage += "; Фиал душ = " + results[i].innerText;
                continue;
                break;
            }
          }   
        }        
      }
      printJobMessage(true);

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

  setTimeout(goArena, 1812);

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
    let btnClose = $('div.button-content:contains("Закрыть")');
    
    if (btnClose.length > 0) {
      btnClose[0].click();
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

    let btnsTakeFight = $('div.button-content:contains("Автобой")');
    if (btnsTakeFight.length > 0) {
      btnsTakeFight[0].click();
      setTimeout(goTavern, 2000);
      return;
    }

    let btnsReward = $('div.button-content:contains("Награда")')
    if (btnsReward.length > 0) {
      btnsReward[0].click();
      setTimeout(goTavern,2000);
      return;
    }

    btnsReward = $('div.button-content:contains("Продолжить")')
    if (btnsReward.length > 0) {
      btnsReward[0].click();
      setTimeout(goTavern, 2000);
      return;
    }

    let btnsBox= $('div.progressBar-valueFill[style*="width: 100%;"]');
    if (btnsBox.length > 0) {
      btnsBox[0].click();
      setTimeout(goTavern, 2000);
      return;
    }  
    
    let btnToWar = $('div.button-content:contains("В бой")');
    if (btnToWar.length > 0) {
      btnToWar[0].click();
      state = "fight";
      setTimeout(goTavern, 5000);
      return;
    }
    
    let canvas = $('div[class*="fightscene"]').find('canvas');
    if (canvas.length > 0) {
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

/**
 * Разбор шмоток
 */
function goBag() {
  printDebugInfo("goBag");
  repeatCount++;
  job = "bag";

  if (state === "idle" || state === "complete") {
    state = "wear";
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
  
  if (state === "wear") {
    let btnWear = $('div.equipmentItemBlock-content:contains("Надеть")')[0];
    if (btnWear !== undefined) {
      let dismInfo = $(btnWear).find('div.equipmentItemBlock-title')[0].innerText;
      dismInfo += "; " + $(btnWear).find('div.equipmentGrade')[0].innerText;
      
      btnWear = $(btnWear).find('span:contains("Надеть")')[0];
      if (btnWear !== undefined) {
        btnWear.click();
        printInfoMessage("Надето: " + dismInfo, InfoTypesEnum.details);
      } else {
        printInfoMessage("Не Надето: " + dismInfo, InfoTypesEnum.warning)
      }
      setTimeout(goBag, 2000);
      return;
    } else {
      state = "disassemble";
    }
  }

  if (state === "disassemble") {
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
    state = "drop"
  }

  if (state === "drop") {
    if ($('div.equipmentItemBlock').length > bagLimit) {
      for (let i = 1; i <= 7; i++) {
        let items = $('div.equipmentGrade.equipmentGrade_grade-' + i.toString());
        if (items.length > 0) {
          items[0].parentElement.getElementsByClassName('link')[0].click();
          setTimeout(goBag, 700);
          return;
        }
      }
    }
    state = "complete"
  }
  state = "complete";
}

/**
 * Собирает золото и ключи в заданиях
 */
function goTask() {
  printDebugInfo("goTask");
  repeatCount++;
  job = "task";

  if (state === "idle" || state === "complete") {
    state = "execution1";
    let btnTask =  $('div.sectionIcon-name:contains("Задания")')[0]
    if (btnTask !== undefined) {
      btnTask.click();
      setTimeout(goTask, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }
  
  //Задания Главы
  if (state === "execution1") {
    let pwd = getPlace();
    let btnContent = $('div.button-content:contains("Глава")')[0];
    if (btnContent !== undefined && pwd !== "tasks") {
      btnContent.click();
      setTimeout(goTask, 3000)
      return;
    }

    getClaim();

    btnContent = $('div.questTask.questTask_isComplete-true div.questTask-text')[0];
    if (btnContent !== undefined) {
      jobMessage = "Задание главы:" + btnContent.innerText + "; ";
      btnContent.click();
      setTimeout(goTask, 3000);
      return;
    }

    state = "execution2";
  }
  
  //Задания Ежедневные
  if (state === "execution2") {
    let pwd = getPlace();
    let btnContent = $('div.button-content:contains("Ежедневные")')[0];
    if (btnContent !== undefined && pwd !== "tasks/daily") {
      btnContent.click();
      jobMessage = "";
      setTimeout(goTask, 3000)
      return;
    }

    getClaim();

    btnContent = $('div.dailyQuestTask.dailyQuestTask_isComplete-true div.dailyQuestTask-text')[0];
    if (btnContent !== undefined) {
      jobMessage = "Задание ежед.:" + btnContent.innerText + "; ";
      btnContent.click();
      setTimeout(goTask, 3000);
      return;
    }

    state = "complete";
  }

  state = "complete"
}

/**
 * Берет и выполняет клановые задания
 */
function goClanTask() {
  printDebugInfo("goClanTask");
  repeatCount++;
  job = "clantask";

  if (state === "idle" || state === "complete") {
    state = "openClanTask";
    let btnClanTask =  $('div.footer-sectionName:contains("Клан")')[0]
    if (btnClanTask !== undefined) {
      btnClanTask.click();
      setTimeout(goClanTask, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }

  if (state === "openClanTask") {
    let btnContent = $('div.clanActivity-buttons div.funcpanel-content:contains("Клановые задания")')[0];
    if (btnContent !== undefined) {
      state = "getclaim";
      jobMessage = "";
      btnContent.click();
      setTimeout(goClanTask, 3000);
      return;
    } else {
      state = "complete";
      return;
    }    
  }

  if (state === "getclaim") {
    getClaim();
    
    let btnGetClaim = $('div.clanTask.clanTask_isComplete-true')[0]
    if (btnGetClaim !== undefined) {
      state = "getclaim";
      jobMessage = "Задание клана:" + $(btnGetClaim).find('div.clanTask-text')[0].innerText + "; ";
      $(btnGetClaim).find('div.button-content:contains("Выполнить")')[0].click();
    } else {
      state = "getTask";
    }
    setTimeout(goClanTask, 3000);
    return;
  }

  if (state === "getTask") {
    let listStartTask = $('div.button-content:contains("Приступить")');
    let arrMatches = [ /Убей на арене 60 соперников/g , /Получи \d+(\.\d)?\w кланового опыта/g, /Сразись 60 раз в подземелье/g, /Сразись в квесте 39 раз/g, /Собери 45 ключей/g];
    for (let i = 0; i < arrMatches.length; i++) {
      for (let j = 0; j < listStartTask.length; j++) {
        if ( arrMatches[i].exec(listStartTask[j].parentElement.parentElement.getElementsByClassName("clanTask-text")[0].innerText) !== null) {
          listStartTask[j].click();
          state = "exit";
          setTimeout(goClanTask, 1500);
          printInfoMessage("Взято задание: " + listStartTask[j].parentElement.parentElement.getElementsByClassName("clanTask-text")[0].innerText, InfoTypesEnum.simple);
          return;
        }
      }
    }
    state = "complete";    
  }

  state = "complete";

}

/**
 * Обработка вторжений, если нужно, то дерется, если нет, то просто записывается
 */
function goInvasion() {
  printDebugInfo("goInvasion");
  job = "invasion";
  repeatCount++;
  if (state === "idle" || state === "complete") {
    state = "prepare";
    let btnArena =  $('div.sectionIcon-name:contains("Вторжение")')[0]
    if (btnArena !== undefined) {
      btnArena.click();
      setTimeout(goInvasion, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }

  if (state === "prepare") {
    let btnGoWar= $('div.button-content:contains("Записаться")');
    if (btnGoWar.length > 0) {
      btnGoWar.click();
      state = "fight";
      setTimeout(goInvasion, 2000);
      return;
    }
  }

  let canvas = $('div[class*="fightscene"]').find('canvas')[0];
  if (canvas !== undefined) {
    state = "fight";
    kick(canvas);
    setTimeout(goInvasion, 1813);
    return;
  }

  state = "complete";
}

/**
 * Заход в клановый портал с целью кого-нибудь завалить
 */
function goClanPortal() {
  printDebugInfo("goClanPortal");
  repeatCount++;
  job = "clanportal";

  if (state === "idle" || state === "complete") {
    state = "openClanPortal";
    let btnClanTask =  $('div.footer-sectionName:contains("Клан")')[0]
    if (btnClanTask !== undefined) {
      btnClanTask.click();
      setTimeout(goClanPortal, 3000);
      return;
    } else {
      state = "complete";
      return;
    }
  }

  if (state === "openClanPortal") {
    let btnContent = $('div.clanActivity-buttons div.funcpanel-content:contains("Портал")')[0];
    if (btnContent !== undefined) {
      state = "execution";
      jobMessage = "";
      btnContent.click();
      setTimeout(goClanPortal, 3000);
      return;
    } else {
      state = "complete";
      return;
    }    
  }

  if (state === "execution") {
    let btnWar = $('div.button.button_color-green div.button-content:contains("В бой")')[0];
    if (btnWar !== undefined) {
      //Ожидание для одновременного начала боя, ждем до первой 5 или 10ой минуты, но которая не ближе 2х минут
      let currentdate = new Date();
      repeatCount--;
      let cm = currentdate.getMinutes() > 9 ? currentdate.getMinutes() % 10  : currentdate.getMinutes();
      if (cm === 5 || cm === 0) {
        btnWar.click();
        state = "fight";
      }
      setTimeout(goClanPortal, 1000);
      return;
    } else {
      //Кнопка не активна - выяснеем почему
      try {
        switch ($('span.portalLobbyActivity-respawnText')[0].innerText) 
        {
          case " Войти могут игроки, находящиеся в клане более 5 дней.":
            printInfoMessage("Ты еще мал для портала!", InfoTypesEnum.details);  
            waitClanPortalRespawn = true;
            break;
          case "Вы сможете войти через":
            let countDownTimer = $('div.countdownTimer.portalLobbyActivity-respawnTimer');
            if (countDownTimer.length > 0) {
              countDownTimer = getMilliseconds(countDownTimer[0].innerText);
              if (countDownTimer > 6000) {
                waitClanPortalRespawn = true;
                printInfoMessage("Ожидаем портал " + countDownTimer + " мс.", InfoTypesEnum.details);
                setTimeout( function() {waitClanPortalRespawn = false;}, countDownTimer - 6000);
              } else {
                waitClanPortalRespawn = false;
              }
            }
            break;
        }
      }
      catch (err) {
        console.log("Ошибочка: ", err)
      }
    }
  }

  if (state === "fight") {
    let canvas = $('div[class*="fightscene"]').find('canvas')[0];
    if (canvas !== undefined) {
      state === "fight";
      kick(canvas);
    } else {
      state = "complete";
    }
    setTimeout(goClanPortal, 967);
    return;
  }

  state = "complete";
}

/**
 * Забирает призы в охоте за рубинами
 */
function goRuby() {
  printDebugInfo("goRuby");
  repeatCount++;
  job = "rubyHunt";

  
  if (state === "idle" || state === "complete") {
    state = "takeRuby";
    let btnRubyHunt =  $('div.mainPage-huntText:contains("Охота за Рубинами")')[0]
    if (btnRubyHunt !== undefined) {
      btnRubyHunt.click();
      setTimeout(goRuby, 1500);
      return;
    } else {
      state = "complete";
      return;
    }
  }

  if (state === "takeRuby") {
    let btnRubyHunt = $('div.button.button_color-green div.button-content:contains("Получить!")')[0];
    if (btnRubyHunt !== undefined) {
      state = "complete";
      btnRubyHunt.click();
      setTimeout(goRuby, 1500);
      return;
    }
  }

  state = "complete";
}

/**
 * Запись в клановых войнах
 */
function goClanWar() {
  printDebugInfo("goClanWar");
  repeatCount++;
  job = "clanWar";

  if (state === "idle" || state === "complete") {
    state = "openClanWar";
    let btnClanWar =  $('div.footer-sectionName:contains("Клан")')[0]
    if (btnClanWar !== undefined) {
      btnClanWar.click();
      setTimeout(goClanWar, 1500);
      return;
    } else {
      state = "complete";
      return;
    }
  }

  if (state === "openClanWar") {
    let btnContent = $('div.clanActivity-buttons div.funcpanel-content:contains("Клановые войны")')[0];
    if (btnContent !== undefined) {
      state = "choosePosition1";
      btnContent.click();
      setTimeout(goClanWar, 1500);
      return;
    } else {
      state = "complete";
      return;
    }    
  }

  if (state === "choosePosition1") {
    let btnRubyHunt = $('div.button.button_color-green div.button-content:contains("Выбрать позицию")')[0];
    if (btnRubyHunt !== undefined) {
      state = "choosePosition2";
      btnRubyHunt.click();
      setTimeout(goClanWar, 1500);
      return;
    } else {
      state = "complete";
      return;
    } 
  }

  if (state === "choosePosition2") {
    state = "exit";
    let btnRubyHunt = $('div.clanWarMap-line div.clanWarMap-circle_isSelecting-true');
    if (btnRubyHunt.length > 0) {
      let position = getRandomInt(0, btnRubyHunt.length);
      btnRubyHunt[position].click();
      jobMessage = "Выбрана позиция №" + (position+1);
      printJobMessage(true);
      setTimeout(goClanWar, 1500);
      return;
    } 
  }
  state = "complete";
}

/**
 * Поджигаем камин и заходим за бонусами
 */
function goFireplace() {
  printDebugInfo("goFireplace");
  repeatCount++;
  job = "fireplace";
  
  if (state === "idle" || state === "complete") {
    state = "openFirelace";
    let btnClanWar =  $('div.footer-sectionName:contains("Клан")')[0]
    if (btnClanWar !== undefined) {
      btnClanWar.click();
    } else {
      state = "exit";
    }
    setTimeout(goFireplace, 1500);    
    return;
  }

  if (state === "openFirelace") {
    let btnContent = $('div.clanActivity-buttons div.funcpanel-content:contains("Камин")')[0];
    if (btnContent !== undefined) {
      state = "lightFireplace";
      btnContent.click();
    } else {
      state = "exit";
    }    
    setTimeout(goFireplace, 1500);
    return;
  }

  if (state === "lightFireplace") {
    let currentdate = new Date();
    //Зажигаем камин только в с 17 до 18 часов
    if(currentdate.getHours() === 17) {
      //Нет смысла зажигать камин, если активен бонус
      if ( $('div.clanFireplacePage-activeBonus div:contains("Ваш бонус закончится через")').length === 0 ) {
        let btnFireplace = $('div.button.button_color-green div.button-content:contains("Зажечь огонь")');
        if (btnFireplace.length > 0) {
          printInfoMessage("Камин раззожен!", InfoTypesEnum.details)
          btnFireplace[0].click();
        }
      }
    }
    state = "takeFireplace";
    setTimeout(goFireplace, 1500);
    return;
  }

  if (state === "takeFireplace") {
    let btnFireplace = $('div.button.button_color-green div.button-content:contains("Получить бонус")');
    if (btnFireplace.length > 0) {
      btnFireplace[0].click();
    }
    state = "exit";
    setTimeout(goFireplace, 1500);
    return;
  }

  if (state === "exit") {
    state = "complete";

  }
  state = "complete";
}

/**
 * Получение наград
 * TODO: Неплохобы доделать глобальный подсчет золота и ключей
 * TODO: Возможно будет шмот в наградах, пока не учитывается
 */
function getClaim() {
  printDebugInfo("getClaim");
  try {
    let lightbox = $('div.lightbox-box div.claimRewardNotification')[0];
    if (lightbox !== undefined) {
      jobMessage += lightbox.getElementsByClassName('claimRewardNotification-title')[0].innerText;
      let results = lightbox.getElementsByClassName('battleResultResources-resource');
      //Перебор наград
      for (let i = 0; i < results.length; i++) {
        let listClasses = results[i].getElementsByTagName('span')[0].classList;
        for (let j = 0; j < listClasses.length; j++ ) {
          switch (listClasses[j]) {
            case "icon_type-gold":
              jobMessage += "; Золото = ";
              continue; 
              break; //TODO: Вроде как до бряка не доходит дело. Нужна достоверная инфа
            case "icon_type-silver":
              jobMessage += "; Серебро = ";
              continue; 
              break;            
            case "icon_type-key":
              jobMessage += "; Ключи = ";
              continue;
              break; //TODO: Вроде как до бряка не доходит дело. Нужна достоверная инфа
            case "icon_type-soulStone":
              jobMessage += "; Фиал душ = ";
              continue;
              break;
          }
        }
        jobMessage += results[i].getElementsByClassName("battleResultResources-value")[0].innerText;
      }
      //Закрытие окна наград
      let btnClose = lightbox.getElementsByClassName("button-content")[0];
      if (btnClose !== undefined) {
        btnClose.click();
      }
      printJobMessage(true);
    }
  }
  catch(err) {
    console.log("Поймали ошибку: ", err)
  }
}

/**
 * 
 * @param {string} time_value Строка со временем, например 1ч. 50мин. 
 */
function getMilliseconds(time_value) {
  let milliseconds = 0;
  let regexp = /(\d?\d)ч\./g;
  let match = regexp.exec(time_value)
  if (match !== null) {
    milliseconds = match[1] * 60 * 60 * 1000
  }
  regexp = /(\d?\d)мин\./g;
  match = regexp.exec(time_value)
  if (match !== null) {
    milliseconds += match[1] * 60 * 1000
  }
  regexp = /(\d?\d)с\./g;
  match = regexp.exec(time_value)
  if (match !== null) {
    milliseconds += match[1] * 1000
  }  
  return milliseconds;
}

//Информация о герое
function getHeroInfo() {
  let pwd = getPlace();
  if ( (state === "idle" || state === "complete") && pwd !== "main") {
    openHeroProfile(getHeroInfo);
    return;
  }


}

/**
 * Возвращает случайное целое число между min (включительно) и max (не включая max)
 * Использование метода Math.round() даст вам неравномерное распределение!
 * @param {*} min Нижняя граница (включительно)
 * @param {*} max Верхняя граница (не включительно)
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//
function getStorage() {
  chrome.storage.local.set({key: value}, function() {
    console.log('Value is set to ' + value);
  });
}

function setStorage() {
  var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
  var open = indexedDB.open("injected_DB", 3);
  console.log(open)
  open.onupgradeneeded = function(e) {
    console.log("Upgrage...")
    var db = open.result;
    var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
    var index = store.createIndex("NameIndex", ["name.last", "name.first"]);
  };

  open.onsuccess = function() {
    // Start a new transaction
    console.log("Success...")
    var db = open.result;
    var tx = db.transaction("MyObjectStore", "readwrite");
    var store = tx.objectStore("MyObjectStore");
    var index = store.index("NameIndex");

    // Add some data
    store.put({id: 12345, name: {first: "John", last: "Doe"}, age: 42});
    store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});
    
    // Query the data
    var getJohn = store.get(12345);
    var getBob = index.get(["Smith", "Bob"]);

    getJohn.onsuccess = function() {
        console.log(getJohn.result.name.first);  // => "John"
    };

    getBob.onsuccess = function() {
        console.log(getBob.result.name.first);   // => "Bob"
    };

    // Close the db when the transaction is done
    tx.oncomplete = function() {
        db.close();
    };
  }

  open.onerror = function (e) {
    console.log("Error...")
    console.dir(e)
  }

}


function getStorage() {
  var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
  var open = indexedDB.open("injected_DB", 3);
  var db;
  
  open.onsuccess = function(event) {
    db = open.result;
    console.log("success: "+ db);
  };
  console.log(db)

  var transaction = db.transaction(["id"]);
  var objectStore = transaction.objectStore("id");
  var open = objectStore.get("00-03");
  
  open.onerror = function(event) {
    alert("Unable to retrieve daa from database!");
  };
  
  open.onsuccess = function(event) {
    // Do something with the request.result!
    if(open.result) {
          alert("Name: " + open.result.name + ", Age: " + open.result.age + ", Email: " + open.result.email);
    } else {
          alert("Kenny couldn't be found in your database!"); 
    }
  };

}