/***
 * Extension Enhancement features of Image Prompter.
 * 
 * Add feature to manipulate current tab page.
 * 
 * author: Ray Lee
 * studio: Luupine
 * website: https://sites.google.com/view/imageprompter
 * emmail: raykkncc@gmail.com
 * date: 2023-6-1
 * 
 * Note: Third party library JQuery is used (version 3.6.4).
 */

//let helper_template_id = "_t_img_collector";

let helperTemplateFunc = function() {
    let templateHtml = `
                    <div class="helper_toolbar_box">
                    <div class="helper_div">
                    <div class="helper_line_div">
                        <div  class="helper_logo_div">  
                            <svg  class="helper_logo1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" >
                                <polygon points="50,5 62.9,35.9 95,35.9 69.1,56.1 80.9,88.1 50,68.1 19.1,88.1 30.9,56.1 5,35.9 37.1,35.9" 
                                        class="logo_graph"/>
                            </svg>
                        </div>
                    </div>
                </div>
                </div>	`;
    return templateHtml;
};

/* current logined username on Midjourney */
const MJ_WEBSITE = 'https://www.midjourney.com/';
const SD_WEBSITE = 'https://stability.ai/';

const _Midjourney_ = 'mj';
const _StableDiffusion_ = 'sd';
const _UNKNOWN_USER_ = 'UNKNOWN';

let platform =  null;
let platform_url =  null;
let username =  null;  

getCurrentTabUrl( function( url) {
    if( platform == null ) {
        if( url!=null && url.startsWith( MJ_WEBSITE )) {
            platform = _Midjourney_;
            platform_url = url ; 
        }
        console.log('platform=%s, platform_url=%s', platform, platform_url );
    }
}); 

function getPlatform() {
    return platform;
}

function getPlatformUrl() {
    return platform_url;
}


/* get current logined username on Midjourney */
function getUsername() {
    //Midjourney username 
    if( platform == _Midjourney_ && username==null ) {
        navv = $('nav')[0];
        p_logo = navv.querySelectorAll('img')[0];
        ppp =p_logo.parentNode.parentNode.parentNode;
        username = ppp.childNodes[1].childNodes[0].textContent ;
        if( isPrintLog()) {
            console.log('logined username=%s ', username  ); 
        }
    }
    if( username == null ||  username.trim() == '')
        username = _UNKNOWN_USER_;
    return username;
}


function generateHelperId( container ) {
    let core_imgs = container.find(`img[data-job-id]`);
    if( isPrintLog() ) console.log(`generateHelperId core_imgs count: %d`, core_imgs.length);

    let helper_id = '0';
    if( core_imgs.length > 0  ) {
        let img_obj = core_imgs[0];
        helper_id = 'helper-' + $(img_obj).attr('data-job-id') + '-' +  $(img_obj).attr('data-job-index') ;
        if( isPrintLog() ) console.log(`generateHelperId %s`, helper_id);
    }else {
        helper_id = randomId() ; 
    }
    return helper_id;  
}

function storeSelected( container ) {

    img_id = container.attr('platform') + '-' +container.attr('data_job_id');

    collect_time_str = formatDate(new Date());
    img_data = { img_id  : img_id,
                 platform: container.attr('platform'), 
                 creator : container.attr('creator'),  //special
                 prompt :  container.attr('prompt'),
                 collector:container.attr('username'),
                 src1 :    container.attr('src1'), 
                 src2 :    container.attr('src2'), 
                 src :     container.attr('src'),
                 collect_time: collect_time_str
                 //collect time
               };
   
    localStorage.setItem( img_id , JSON.stringify(img_data) );
    if(isPrintLog()) console.log('save img select data:' + { 'img111' : img_data });

    /*chrome.storage.local.get( [ img_id], function(data) {
        if(isPrintLog()) console.log('get saved img data:' + data.src1);
    });
    */ 
   
   data = localStorage.getItem( img_id );
   if(isPrintLog()) console.log('get saved img data: %s' + data);
}

function on_selected( curr_node ) {
    //collect
    if( isPrintLog()) console.log( `+++ on_selected node, %s,%s ` , curr_node.attr('tagName'), curr_node.attr('class') );

    let helper_boxes =  curr_node.parents('.helper_toolbar_box');
    let helper_box = helper_boxes.length > 0 ? helper_boxes[0] : null;

    if( isPrintLog()) {
        console.log('helper_boxes count %d , %s ', helper_boxes.length, (helper_box == null) );
    }
    if( helper_box == null ) 
        return true; 

    if( isPrintLog()) {
        console.log('helper_box %s, id=%s', helper_box, helper_box.id );
    }
    let container = $(helper_box).parent();

    let img_nodes = container.find('img[srcset]');
    let img_node = img_nodes.length>0 ? img_nodes[0] : null;

    let $img_node= $(img_node);
    let data_job_id    = $img_node.attr('data-job-id');
    let data_job_index = $img_node.attr('data-job-index');
    let data_job_type = $img_node.attr('data-job-type');
    let srcset = $img_node.attr('srcset');
    let src = $img_node.attr('src');
    let prompt = $img_node.attr('alt');

    if( isPrintLog()) {
        console.log('srcset %s', srcset);
    }

    let src_array = srcset.split(',');
    let src1 = src_array.length> 0 ? src_array[0].trim().split(' ')[0] : '';
    let src2 = src_array.length> 1 ? src_array[1].trim().split(' ')[0] : '';

    if( isPrintLog()) {
        console.log('data_job_id=%s, prompt=%s, src1=%s, src2=%s', data_job_id, prompt, src1,src2 );
    }

    container.attr('data_job_id', data_job_id );
    container.attr('data_job_index',data_job_index );
    container.attr('data_job_type', data_job_type );
    container.attr('src'          , src );
    container.attr('prompt'       , prompt );
    container.attr('src1'         , src1 );
    container.attr('src2'         , src2 );

    container.attr('platform', getPlatform() );
    container.attr('username', getUsername() );
   
    storeSelected( container ); 
}

function on_deselected( curr_node ) {
    let helper_box =  curr_node.parents('.helper_toolbar_box');
    if( isPrintLog()) console.log( `--- on_deselected curr_ele - `   + curr_node.attr('class')  );
}

function on_mouseenter( div_container ) {
    console.log('on_mouseenter callback, container %s', div_container[0].tagName );

    ////////////////////
    let container = div_container;

    let creator_logo_imgs =  container.find('img'); //  container.find('p[title]');

    if( isPrintLog()) {
        console.log('creator_logo_imgs count %d', creator_logo_imgs.length );
    }
    let creator_logo_img = creator_logo_imgs.length > 0 ? creator_logo_imgs[2] : null;

    if( creator_logo_img == null ) {
        return true;
    }

    let $creator_logo_img = $(creator_logo_img);
    let creator_name = $creator_logo_img.attr('alt');
    let creator_logo = $creator_logo_img.attr('src');

    div_container.attr('creator', creator_name); 
    div_container.attr('creator_logo', creator_logo); 

     //creator 
     if( isPrintLog()) 
        console.log('creator_name=%s, creator_logo=%s, class=%s ', creator_name, creator_logo, $creator_logo_img.attr('class') );
    
   
}
/*
 *
 * Note: When new image div node inserted, add a helper to this node.
 */
function on_newNode( node  ) {
    
    let isNode = (node instanceof Element);
    if( isNode == false )
        return false;

    if( isPrintLog()) console.log('New node role: %s,%s', node.tagName, node.getAttribute('role') );
    
    if( isNode && node.tagName == 'DIV' &&  node.getAttribute('role') == "gridcell" ) {
        let $node = $(node);
        if( $node.find('.helper_toolbar_box').length <=0 ) {
            //$(element).append('<div class="my_helper_box">11111</div>');
            if( isPrintLog()) console.log(`** Add new helper_box! `);
    
            let container = $node.children('div');

            add_helper( container, helperTemplateFunc, generateHelperId , on_selected, on_deselected, on_mouseenter ); 
            //init_helper_events(  container , on_selected, on_deselected);
    
        }else {
            if( isPrintLog()) console.log(`my_helper_box exists in this node. role=gridcell `);
        }
    }
    return true; 
}

function init_node_insertion_event() {
        //**Monitor new node ***************************
        var mconfig = { childList: true, subtree: true };
        var ob = new MutationObserver( function( mutations ) {
            
            mutations.forEach( function( mutation ) { 

                let action = mutation.addedNodes.length>0 ? 1 : ( mutation.removedNodes.length>0 ? -1 :  0 );
                if( action==1 && (mutation.type=="childList" || mutation.type=="subtree" )) {   //add node
                    
                    let newNode = mutation.addedNodes[0];
                    if(newNode)  on_newNode( newNode );
                }
            });
        });
        
        ob.observe( document.body, mconfig );

};



function init_node_removal_event() {
    //DO nothing now.
    return true;
}


function init_document_ready_event() {
    $(document).ready( function() {

        var jq_version = $().jquery; 
  
        if( isPrintLog()) console.log('In Extension jq_version ' + jq_version );

        init_node_insertion_event();

        //init_node_removal_event();
    })
}

/*  main entry function execution. all starts from here */
init_document_ready_event();




