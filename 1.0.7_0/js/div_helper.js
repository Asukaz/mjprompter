
/* 
    Div floating helper toolbar framework. 

    Add a floating toolbar to div you specified. 
    You should provid the content of toolbar as a template.

    @author: Ray Lee
    @email: raykkncc@gmail.com
    @date: 2023-5-20
*/


let img_op_data ={ };
img_op_data['desc'] = "img collect status data";

let collected_color   = "orange";  //  brightblue #3486ea
let uncollected_color = "#edeaea";

                            

/*
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

*/

function is_image_selected( collector_id ) {
    let is_selected = (img_op_data[collector_id] &&  img_op_data[ collector_id ].collected ==true )==true  ;
    return is_selected;
}


function collect_img( collector_id , value ) {
    img_op_data[ collector_id ] = { collected : value };
    //if( isPrintLog())  console.log( `collect_img - ` + collector_id + `, ` + collector_id.parent().parent().parent().attr(`srcset`));
    //if( isPrintLog() ) if( isPrintLog() ) console.log( `img_op_data - collected? ${collector_id} - ` + img_op_data[collector_id].collected );
}


function init_helper_mouse_event( div_objects, on_mouseenter_callback ) {
    div_objects.on("mouseenter", function(e) {
        //if( isPrintLog() ) console.log('into img_div... ' + e.target);
            $(this).children(".helper_toolbar_box").show();

            let ret = true;
            if( on_mouseenter_callback ) {
                ret = on_mouseenter_callback( $(this) );
            }
    });
    
    div_objects.on("mouseleave", function(e) {
        let collector_id = $(this).children('.helper_toolbar_box').attr('id');
        let is_selected = is_image_selected( collector_id );
        //if( isPrintLog() ) console.log(`out img_div  is_selected? ${collector_id}, ${ is_selected }`  );

        if( is_selected == false ) {
            $(this).children(".helper_toolbar_box").hide();

            if( isPrintLog() ) {
                console.log(`*** helper leave, ` + $(this).prop('tagName') +', id:' + collector_id ); 
            }
        }
    });
}

function init_helper_click_event( div_objects, selected_func, deselected_func ) {
    div_objects.find(".helper_logo1").on("click", function(event) {

        //if( isPrintLog() ) console.log('helper_logo1 click ');
        let collector_id = $(this).parents('div.helper_toolbar_box').attr("id");

        let is_selected = is_image_selected( collector_id );
        if( isPrintLog() ) {
            console.log('----- helper_logo1 click, helperid:' + collector_id + ',before is_selected? ' + is_selected );
            console.log(`----- event target :${event.target.tagName} `);
        }
    
        if(is_selected == false ) {
                collect_img( collector_id , true ); 
                //$(this).children("polygon").css("fill",collected_color );
                $(this).attr('class', 'helper_logo1_selected');

                if( selected_func ) {
                    try {
                        selected_func( $(this) );
                    }catch( err ) {
                        console.error('Fail to run selected_func: ' + selected_func  +', error:' + err.stack );
                    }
                }
                return false;
        }else {
            collect_img( collector_id , false );  
            //$(this).children("polygon").css("fill",uncollected_color );
            $(this).attr('class', 'helper_logo1');

            if( deselected_func ) {
                try {
                    deselected_func( $(this) );
                }catch( err ) {
                    console.error('Fail to run deselected_func: ' + deselected_func  +', error:' + err );
                }
            }
            return false;
        }
    });
} 

function init_helper_events( div_objects, selected_func, deselected_func , on_mouseenter ) {

    init_helper_mouse_event( div_objects , on_mouseenter );

    init_helper_click_event( div_objects, selected_func, deselected_func );

    /////////////////////////////////
    let helper_box = div_objects.children('div.helper_toolbar_box');
    let collector_id = helper_box.attr('id');
    let is_selected = is_image_selected( collector_id );

    if( isPrintLog())  console.log("Init helper - %s, is_selected? %s ", collector_id, is_selected  );

    if( is_selected ) {
        helper_box.show();

        let helper_logo1 = helper_box.find(`.helper_logo1`);
        helper_logo1.attr('class', 'helper_logo1_selected');
    }
}


/*
 * Add helper div box to specified container.
 */
function add_helper0( container, helperTemplateFunc, generateHelperId ) {
    if( isPrintLog())  console.log(`Add_helper to container: tag=%s `, container[0].tagName  );

    //let temp = getTemplate( helper_template_id );
    //let tempHtml = temp.innerHTML;

    let tempHtml = getTemplateHtml( helperTemplateFunc ); 
    //if( isPrintLog())  console.log(`tempHtml - ${tempHtml}`);

    container.append( tempHtml );
    
    let collectors = container.children(`.helper_toolbar_box`);
   
    if( collectors.length <= 0 ) {
        if( isPrintLog())  console.log("Add_helper - No node added to " + container.prop('tagName')  );

    }else {
        let collector = collectors[ 0 ]; 
        let collector_id = collector.id;

        if( isPrintLog())  console.log("Add_helper - before add. id=%s",  collector_id  );
        
        if(  collectors[ 0 ].id &&  collectors[ 0 ].id != "") {
            if( isPrintLog())  console.log("Add_helper - Node exists! id=" + collectors[ 0 ].id  );
        }else {
            if( generateHelperId )
                collectors[ 0 ].id =  generateHelperId( container ) ;
            else
                collectors[ 0 ].id = `helper-` + randomId() ;
            if( isPrintLog())  console.log("Add_helper - Set node id=%s",  collectors[ 0 ].id  );
        }
    } 
}


function add_helper( container, helperTemplateFunc, generateHelperId, on_selected, on_deselected, on_mouseenter ) {

    add_helper0(container, helperTemplateFunc, generateHelperId ); 

    init_helper_events(  container , on_selected, on_deselected, on_mouseenter );
    
}