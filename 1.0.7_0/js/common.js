

/***
 * common.js for Image Prompter
 * 
 * author: Ray Lee
 * studio: Luupine
 * website: https://sites.google.com/view/imageprompter
 * emmail: raykkncc@gmail.com
 * date: 2023-4-20
 * Note: Third party library JQuery is used (version 3.6.4).
 */

//
//  1. common functions
//
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month}-${day} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function sleep( s ) {
    let target = Date.now() + s;  // 2 seconds from now
    while (Date.now() < target) { }  // Do nothing, just loop
}

function randomId( max=1000000 ) {
    return Math.floor( (Math.random()*max )+1);
}


/*************************************************** */
//
//  2  template functions
//

function getTemplate( temp_tag ) {
    let tm = $("template[id='" + temp_tag + "']")[0];
    return tm; 
}


function getTemplateHtml( helperTemplateFunc ) {
    try {
        if( helperTemplateFunc ) {
            if( isPrintLog() ) console.log('Use customed function helperTemplateFunc！ '   );
            let html = helperTemplateFunc();
            return html;
        }else {
            if( isPrintLog() ) console.log('Customed function helperTemplateFunc not specified! '  );
        }
    }catch( err ) {  
        if( isPrintLog() ) console.error('Error run function - ' + helperTemplateFunc + '\n ' + err.stack  );
        return 'Error Template!!!';
    }

    if( isPrintLog() ) console.log('helperTemplateFunc not provided outside! The helper will be empty! Use add_helper( container, helperTemplateFunc) ' );
    return '<template>Empty Template!!!</template>';
}