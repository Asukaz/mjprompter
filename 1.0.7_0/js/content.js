/* 
 *   content.js of Extension Image Prompter
 *   @date 2023-5-7
 *   @author:  Ray Lee
 *   @email :  raykkncc@gmail.com
 *   @thanks:  JQuery 3.6 is used
 */

let mainPageUrl = "main.html";
let image_prompter_log_url = chrome.runtime.getURL("images/icon-48.png");

console.log(" ---------- Extension Image Prompter -------------- ");

//init extension show handle. 
//When user click show handle the main panel will show.
 
let prodcutName = "Image Prompter";

function initShowHanle() {
    $("#showHandle").on("click", function(e){
        //console.log("showHandle click " + e.target );
        $("#mainFloatBox").toggleClass("show");
    });
}


function appendToBody( extHtml ) {
  //injected_html0 = injected_html.replace('$(extHtml)', extHtml );
  injected_html1 = extHtml.replaceAll('images/icon-48.png', image_prompter_log_url );

  //console.log('appendToBody - ' + injected_html1.substring(0,50) );

  //let elements = $( injected_html0 ); 
  $("body").append( injected_html1 );

  initShowHanle();
}

function appendExtensionHtml( sourceHtml ) {

  let idx1 = sourceHtml.indexOf("<body>"); 
	let idx2 = sourceHtml.indexOf("</body>"); 
	extHtml = sourceHtml.substring(idx1+6, idx2);
  appendToBody( extHtml );
}

let createPageUrl = chrome.runtime.getURL( mainPageUrl );
fetch(  createPageUrl )
    .then( response => response.text() )
    .then( extHtml => appendExtensionHtml( extHtml ));