console.log("Content.js works...")


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
window.dispatchEvent(evtFocus);
window.onblur = null; 

var script = document.createElement('script');
script.setAttribute("type", "text/javascript");
script.src = chrome.extension.getURL('injected.js');
script.innerHTML = script;
document.getElementsByTagName("head")[0].appendChild(script);
document.getElementsByTagName("body")[0].setAttribute("onLoad", "ai_on();");

