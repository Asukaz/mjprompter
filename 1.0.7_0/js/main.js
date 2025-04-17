/***
 * main.js for Image Prompter
 * 
 * author: Ray Lee
 * studio: Luupine
 * website: https://sites.google.com/view/imageprompter
 * emmail: raykkncc@gmail.com
 * date: 2023-4-20
 * Note: Third party library JQuery is used (version 3.6.4).
 */


let featureData = null;
let feature_url   = "https://raw.githubusercontent.com/raymondhekk/image-prompter-pre/main/conf/features.json"; 

//let feature_url = "https://raw.githubusercontent.com/raymondhekk/image-prompter-pre/main/confp/features-p.json";

//let img_src_feature_type = "images/no-style-type-1.png";
const DEFAULT_IMG_SRC = "images/no-style-1.png";
const _IMG_S_WIDTH  = 120;
const _IMG_S_HEIGHT = 120;

//let printLog = true ;
/**
 selected_features data structure 
selected_features = {
    subject:  [],
    style :   [],
    control : [],
    camera :  [],
    parameter : []
};
 */

let model_data = {
    dimension_names : [],
    selected_features: {}
} 

function sleep( s ) {
    let interval = setInterval(() => {}, s ); // Pause for 1 second
    clearInterval(interval); 
}

function initEvent() {
    
    setTextboxEvent();

    setDimTabClickEvent();
   
    setFeatureClickEvent();

    //setShowHandle();

    setTabShowing();

    setWebsiteYear();
}


function setShowHandle() {

    $("#showHandle").click( function() {
        $(this).toggleClass("open");
    })
}


function setTextboxEvent() {
    $("#txt_core_prompt").on("keyup", function(){
    
        let final_prompt = generateFinalPrompts( model_data );
        $("#txt_final_prompt").val(  final_prompt );
    });

    $("#btn_copy_final_prompt").on("click",function(){
        $("#txt_final_prompt").select();
        document.execCommand("copy");   //paste cut 

        //alert('setMidjPrompt');
        //if( isPrintLog())  console.log( `function setMidjPrompt: ${setMidjPrompt}`);
        /*
        //TODO: implement setMidjPrompt
        if( setMidjPrompt ) {   //setMidjPrompt function, inject prompt
            let new_prompt = $("#txt_final_prompt").val();
            setMidjPrompt( new_prompt );
        }*/
    });

    $("#btn_clear_final_prompt").on("click", function() {
        $("#txt_final_prompt").val("");
        clearSelection();

        generateFeatureCheckgroup( model_data );
    });
}

function setTabShowing() {
    
    $(`div[tag="dim_features_box"]`).hide();
    $(`div[tag="dim_features_box"]:first`).show();

    $("div.dimTab:first").toggleClass("selected");
}

/** Switch tab  */
function setDimTabClickEvent() {

    $(".dimTab").on("click", function(){

        $("div.dimTab").attr("class", "dimTab" );
        $(this).toggleClass("selected");

        let this_dimName = $(this).attr("tab_dimname").toLowerCase();
      
        $(`div[tag="dim_features_box"]`).hide();
        $(`div[tag="dim_features_box"][dim_box_name="${this_dimName}"]`).show();
    });
}

function setFeatureClickEvent() {

    $("div.feature").on("click",function() {
        //alert($(this).parent());
        let dim_name = $(this).attr("dimension");
        let prompt = $(this).attr("prompt");
        let featurename000 = $(this).attr("featurename");
        //if( isPrintLog())  console.log(`click feature featurename=${featurename}, prompt=${prompt}`);

        if(!dim_name || dim_name == "") {
            if( isPrintLog())  console.log(`selected feature dim_name is empty！`);
            return false;
        }

        if(!prompt || prompt == "") {
            if( isPrintLog())  console.log(`selected feature name is empty！`);
            return false;
        }

        if( model_data.dimension_names.length <=0 ) {
            if( isPrintLog())  console.log('model_data.dimension_names not init yet!');
            return false;
        }

  
        let isSelected = isfeatureSelected( dim_name, prompt );
        if( isPrintLog())  
           console.log(`click feature, dim_name=${dim_name}, feature=${prompt}, before isSelected=${isSelected}`);
        
        if( isSelected  ) {
            deleteSelectedFeature( dim_name, prompt );
        }else {
            addSelectedFeature( dim_name, prompt );
        }
            
        if( isPrintLog())  console.log(" selected_features dimension:" + dim_name +"-"+ model_data.selected_features[ dim_name ] );
        showSelectedFeature(dim_name, prompt );

        generateFinalPrompts(  );
    
        generateFeatureCheckgroup( model_data );
       
    });
}



function isfeatureSelected( dim_name, feature ) {
    //console.log(`isfeatureSelected? dim:${dim_name}, selected features=${model_data.selected_features[ dim_name ]}`);

    let selectedList = model_data.selected_features[ dim_name ];
    let idx = selectedList.indexOf( feature );
    return idx > -1; 
}

function deleteSelectedFeature(dim_name, feature) {
    let selectedList = model_data.selected_features[ dim_name ];
    let idx = selectedList.indexOf( feature );
    if( idx > -1  ) 
        selectedList.splice(idx,1);
}

function addSelectedFeature(dim_name, feature) {
    let selectedList = model_data.selected_features[ dim_name ];
    let idx = selectedList.indexOf( feature);
    if( idx < 0 ) 
        model_data.selected_features[ dim_name ].push( feature );
}

/**
 * Generate check group of selected feature, providing an intuitive way.
 * @param 'Selected feature' model_data0 
 */
function generateFeatureCheckgroup( model_data0 ) {
    let con = $("#feature_check_group_div");

    con.empty();  //empty 
    renderFeatureCheckgroup( con, model_data0 ); 
}

function renderFeatureCheckgroup( con, model_data0 ) {

    let dims = model_data0.dimension_names;
    for( let i=0; i < dims.length; i++ ) {
        let dim_name = dims[ i ];

        let feature_check_group_dim_temp = getTemplate('feature_check_group_box');
        let tempHtml = feature_check_group_dim_temp.innerHTML;
        tempHtml = renderTemplateHtml( tempHtml, 'checked_dim_name', dim_name );

        //render selected features
        let selected_features = model_data.selected_features[ dim_name ];
        let checkedFeaturesHtml = renderCheckedFeatures( dim_name, selected_features ) ;
        
        tempHtml = renderTemplateHtml( tempHtml, 'checked_features', checkedFeaturesHtml );
        con.append( tempHtml );

        let dim_group_div = con.find(`div[checked_dim_name="${dim_name}"]`);
        if( selected_features.length <= 0 ) {
            dim_group_div.hide();
        }
    }
    
    //add click event to delete checked feature.
    con.find(`div.check_feature_tick`).on('click', function(e) {
        let this_dim_name = $(this).attr('dim_name');
        let this_checked_feature = $(this).attr('checked_feature');

        deleteSelectedFeature( this_dim_name , this_checked_feature );
         
        showSelectedFeature(this_dim_name, this_checked_feature );

        generateFinalPrompts();

        generateFeatureCheckgroup( model_data );
    });
   
}


/*  renderCheckedFeatures */
function renderCheckedFeatures( dim_name, checkedFeatures ) {
    //if( isPrintLog()) console.log(`checked_features_box , count:${checked_features_box.length}`);
    //if( isPrintLog()) console.log(`checkedFeatureHtml , ${checkedFeatureHtml}`);
    let checkedFeaturesHtml = '';
    checkedFeatures.forEach( function( feature ) {
        let checked_feature_temp = getTemplate('checked_feature');
        let tempHtml = renderTemplateHtml( checked_feature_temp.innerHTML, 'checked_feature', feature );
        tempHtml = renderTemplateHtml( tempHtml , 'dim_name', dim_name );
        
        checkedFeaturesHtml += tempHtml + '\n';
    });

    return checkedFeaturesHtml;
}

/* Init basic model data
 * It includes dimensions and selected_features.
 */
function init_model_data( dimensions ) {
    model_data.dimension_names = dimensions.map( dim => dim["name"]);

    model_data.dimension_names.forEach( dim_name => model_data.selected_features[dim_name] = [ ] );
    
    if( isPrintLog())  console.log("Init init_model_data by dimensions: " + model_data.dimension_names)
}

function showSelectedFeature(dim_name, prompt ) {

    let selectedFeatureDiv = $(`div[dimension="${dim_name}"][prompt="${prompt}"]`);
    selectedFeatureDiv.toggleClass("selected");
}

function generateFinalPrompts(   ) {
    let final_prompts = "";

    for( let dim_name of model_data.dimension_names ) {
        let tmp_features = new Set( model_data.selected_features[ dim_name ] );
        if( dim_name=="parameter" ) {
            final_prompts =  final_prompts.endsWith(",") ? final_prompts.slice(0, final_prompts.length-1 ) : final_prompts;
            tmp_features.forEach( x=> final_prompts += x + " " );
        }else {
            tmp_features.forEach( x=> final_prompts += x + ", " );
        }
    }

    final_prompts =  final_prompts.trim();
    final_prompts =  final_prompts.endsWith(",") ? final_prompts.slice(0, final_prompts.length-1 ) : final_prompts;

    let core_prompt = $("#txt_core_prompt").val();
    final_prompts = core_prompt.length>0 ? `${core_prompt}, ${final_prompts}` : final_prompts;

    $("#txt_final_prompt").val( final_prompts );

    return final_prompts;
}


function setWebsiteYear() {
    //if( isPrintLog())  console.log("year--" + new Date().getFullYear())
    $("#year_div").html( new Date().getFullYear() );
}

function clearSelection() {
    for(let dim_name in model_data.selected_features) {
        model_data.selected_features[dim_name].forEach( prompt => {
            let selectedFeatureDiv = $(`div[dimension="${dim_name}"][prompt="${prompt}"]`);
            selectedFeatureDiv.toggleClass('selected');
        });
        model_data.selected_features[dim_name] = [];
    }
    if( isPrintLog())  console.log("clearSelection ... ")
}

/****init event and action **********************/
function initFeatureTailsSlideButton() {
    if( isPrintLog())  console.log("---add event feature_tails_button");

    $("button.feature_tails_button").on("click", function( e ) {
        //if( isPrintLog())  console.log("add event feature_more_button");
        // button in old position
        //let p = $(this).parent().parent().parent();
        //feature_more = p.children(".feature_tails_box");

        let p = $(this).parent().parent().parent();
        feature_more = p.find(".feature_tails_box");

        //if( isPrintLog())  console.log("feature_more " + feature_more.length );
        if(feature_more && feature_more.length>0) 
            feature_more.slideToggle();
    });
}

/***** template util methods ***********************/
function getTemplate( temp_tag ) {
    let tm = $("template[tag='" + temp_tag + "']")[0];
    return tm; 
}

function renderTemplate( tm, var_name, var_value ) {
    let var_name0 = "$(" + var_name + ")";
    return tm.innerHTML.replaceAll( var_name0 , var_value );
}
        
function renderTemplateHtml( tm_html, var_name, var_value ) {
    let var_name0 = "$(" + var_name + ")";
    return tm_html.replaceAll( var_name0 , var_value );
}
        
function createNode( con, tm, tm_html ) {
    if( isPrintLog())  console.log(" add template node"+ tm );
    tm.innerHTML = tm_html;
    let tmnode = tm.content.cloneNode(true);
    con.append( tmnode);
    return tmnode;
}
 
function renderAppendNodesByHtml( con, tm_html ) {
    if( isPrintLog())  console.log(" createNodesByHtml in container:" + con  );
    con.append( tm_html);
    return true;
}
        
/****Render Dimensions ********************* */
function renderUI( feattureData, container ) {
    try {
        let data = JSON.parse( feattureData );
        if( isPrintLog())  console.log("remote dimension "+ data.dimension );
        let dimensions = data.dimension;

        if( !container ) {
            if( isPrintLog())  console.log("No container given for rendering!");
            return false;
        }

        
        if( dimensions && dimensions.length > 0 ) {
            renderDimensionTabs( data , container );
            renderDimensions( data , container );
            init_model_data( dimensions );
        }

        renderDataVersion( data );  
    }catch( err ) {
        setMsg( 'Data error.  Please contact us. ' + err.stack );
        
    }
}

function renderDataVersion( data ) {
    if( isPrintLog())  console.log("Data version " + data.version +"," + data.date );
    if( data.version && data.date )
        $("#data_version").text( `${data.version} on ${data.date}` );
}


function renderDimensionTabs( data, container ) {
    let dimensions = data.dimension;

    let tmp_name = "dimension_tab";
    let tmp_dm_tab = getTemplate( tmp_name );

    if( isPrintLog())  console.log(`Render dimension tab:  ${tmp_name}` );

    if( !tmp_dm_tab ) {
        if( isPrintLog())  console.log(`No dimension template found ${tmp_name}` );
        return `No dimension template found ${tmp_name}`;
    }

    let dim_tabs_html = "";
    for(let i=0; i< dimensions.length; i++ ) {
        let dm_name = dimensions[ i ]["name"];

        let tmp_dm_tab = getTemplate( tmp_name );
        let tmp_html = tmp_dm_tab.innerHTML ;
        
        tmp_html = renderTemplateHtml( tmp_html, "dimname0", dm_name  );
        tmp_html = renderTemplateHtml( tmp_html, "dimname1", dm_name.toLowerCase()  );

        dim_tabs_html = dim_tabs_html + tmp_html + "\n";

        if( isPrintLog())  console.log(`Render dm tab: ${dm_name} ` );
    }

    let con = container.children("#operationTitle");
 
    let temp_dimension_tabs = getTemplate("dimension_tabs");

    //createNode( con , temp_dimension_tabs, dim_tabs_html );

    renderAppendNodesByHtml( con ,  dim_tabs_html );
    
}

/**
 * renderDimensions 
 * @param  data   json data
 * @param  container 
 * @returns 
 */
function renderDimensions( data, container ) {
    let dimensions = data.dimension;
    let temp_dms = getTemplate( "dimensions"  );
    if( !temp_dms ) {
        if( isPrintLog())  console.log("No template found " + temp_tag );
        return "No template found " + temp_tag;
    }
    
    //let subcontainer = container.children("#operationBoxDiv").children("#operationBox");
    let subcontainer = container.children("#operationBox");
    
    let dimensionsHtml = "";
    for( let i=0; i < dimensions.length; i++ ) {
        let dm_obj = dimensions[i];
        let dm_name = dm_obj["name"];
        if( isPrintLog())  console.log("render dm_name " + dm_name);
        let dm = data[ dm_name ];
        //if( isPrintLog())  console.log("render dm " + dm );
        let html = renderDimension( dm_name,  dm , i );
        //dimensionsHtml = dimensionsHtml + "\n " + html ;

        renderAppendNodesByHtml( subcontainer , html );
        if( i==0 ) sleep( 1000 );
    }
    //if( isPrintLog())  console.log("renderHTML " + dimensionsHtml );
    
    /*let temp_var_name = "template_list_dimension";
    let temp_dms_html = renderTemplateHtml( temp_dms.innerHTML, temp_var_name, dimensionsHtml );
    */
}

    
function renderDimension( dm_name, dm, i ) {

    if( dm == undefined )
        return ".";
    let tm_dm = getTemplate( "dimension" );
    
    /* render feature_box */	
    //let featureTypes = dm["featureTypes"];
    let feature_box_list_html = render_feature_box_list( dm_name, dm );
    temp_dm_html = renderTemplateHtml( tm_dm.innerHTML , "dimName", dm_name );
    temp_dm_html = renderTemplateHtml( temp_dm_html , "template_list_feature_box", feature_box_list_html  );
    
    return temp_dm_html;
}
        
function render_feature_box_list( dm_name, dm ) {
    let featureTypes = dm["featureTypes"];
    
    let feature_box_list_html = "";
    for(let i=0 ; i < featureTypes.length; i++ ) {

        let feature_type = featureTypes[i];
        let feature_type_name = feature_type["name"];
        if( isPrintLog())  console.log(" render feature_type " + feature_type_name );
        //if( isPrintLog())  console.log(" dm has feature_type_name? "+ dm.hasOwnProperty( feature_type_name ));
        if( dm.hasOwnProperty( feature_type_name )) {
            let feature_list = dm[ feature_type_name ];
            let feature_html = render_feature_box( dm_name, feature_type, 
                                                    feature_list , i );
            feature_box_list_html +=  feature_html +"\n";
        }else {
            feature_box_list_html += ".";
            //feature_box_list_html += "No feature_type found:" + feature_type_name +".  \n";
        }
    }
    //let feature_box_list_html_list = featureTypes.map( (f,i) => render_feature_box(f,i ));
    //let feature_box_list_html = feature_box_list_html_list.join(" ");
    return feature_box_list_html;
}

function render_feature_box( dm_name,  feature_type, feature_list , i ) {
    let temp_feature_box = getTemplate( "feature_box");
    let feature_type_html = render_feature_type( dm_name,  feature_type, feature_list.length,i );
    let feature_box_html = renderTemplateHtml( temp_feature_box.innerHTML , 
                                            "template_feature_type",
                                            feature_type_html);
    
    const HEAD_COUNT = 4;                                        //head_features
    //tail_features
    let heads_list = feature_list.slice(0,HEAD_COUNT);
    let feature_heads_html = render_feature_heads( dm_name, feature_type, heads_list , i);
    feature_box_html = renderTemplateHtml( feature_box_html  , 
                                            "template_list_feature_heads",
                                            feature_heads_html);
    if( feature_list.length <=HEAD_COUNT )
        feature_box_html = feature_box_html.replace("feature_tails_button","feature_tails_button_hidden");

    let tails_list = feature_list.slice( HEAD_COUNT );
    let feature_tails_html = render_feature_tails( dm_name, feature_type,tails_list, i);
    feature_box_html   = renderTemplateHtml( feature_box_html, 
                                            "template_list_feature_tails",
                                            feature_tails_html);
    return feature_box_html;
}
        
function render_feature_type( dm_name, feature_type, sub_count, i ) {

    let image_no = feature_type["image"] == "no";

    //set image_no = no, don't show image for all feature type box 
    image_no = true;
    let feature_html = render_feature( dm_name, feature_type , feature_type, i , image_no );
    feature_html = feature_html.replace('class="feature"','class="featureType"');
    feature_html = feature_html.replace('class="feature_small_img"','class="feature_type_small_img"');
    feature_html = feature_html.replace('class="featureText"','class="featureTypeText"');
    feature_html = renderTemplateHtml(feature_html, 'sub_count', `(${sub_count})`);
    
    //let tails_button_html = getTemplate('feature_tails_button').innerHTML;
    //feature_html = renderTemplateHtml( feature_html, '&nbsp;', tails_button_html);
    
    return feature_html;

}

function render_feature_heads(  dm_name, feature_type, feature_list, i ) {
    let feature_list_html = "";

    let image_no = feature_type["image"] == "no";
    //for( let j =0; j <feature_list.length; j++) {
    for( let j = 0;  j<feature_list.length ; j++) {
        let feature = feature_list[ j ];
        let feature_name = feature["name"];
        let feature_html = render_feature( dm_name, feature_type, feature, j, image_no );
        feature_html = renderTemplateHtml(feature_html, 'sub_count', "" );

        feature_list_html += feature_html + "\n" ;
        if( isPrintLog())  console.log("render feature:" + feature_type + "-" +j + " - "+ feature_name );
    }
    return feature_list_html;
}
    
function render_feature_tails( dm_name,  feature_type, feature_list, i ) {
    let feature_list_html = render_feature_heads( dm_name, feature_type,feature_list, i);
    return feature_list_html;
}


function render_feature(  dm_name, feature_type , feature , i, image_no ) {

    let feature_type_name = feature_type["name"];
    let feature_class ="feature";
    let feature_img_div_class = "feature_small_img_div";
    let feature_small_img_class = "feature_small_img";

    let feature_name = feature["name"];
    let feature_caption = feature["caption"];
    let feature_prompt = feature["prompt"];
    let feature_description = feature["description"];
    let image_url = feature["image"];

    let temp_feature = getTemplate("feature");
    if( isPrintLog())  console.log("--- Render feature " + feature_name );
    
    let img_src = image_url ? image_url : DEFAULT_IMG_SRC;
    img_src = `${img_src}?width=${_IMG_S_WIDTH}&height=${_IMG_S_HEIGHT}`  ;

    let feature_html = temp_feature.innerHTML;

    if( isPrintLog())  console.log("feature_caption ==undefined ?" +(feature_caption ==undefined));

    let feature_name_1 = feature_name.replaceAll("_"," ");
    //TODO: use i18n to set feature_caption in some version later
    //feature_caption     = feature_name_1;
    feature_caption     = feature_caption && dm_name=="parameter"  ? feature_caption     : feature_name_1;

    feature_prompt      = feature_prompt      ? feature_prompt      : feature_name_1;
    feature_description = feature_description ? feature_description : feature_name_1;

    feature_html = renderTemplateHtml( feature_html,  "dimension", dm_name );
    feature_html = renderTemplateHtml( feature_html,  "featureType", feature_type_name );
    
    feature_html = renderTemplateHtml( feature_html,  "featureName", feature_name );

    feature_html = renderTemplateHtml( feature_html,  "feature_prompt", feature_prompt );
    feature_html = renderTemplateHtml( feature_html,  "feature_caption",  feature_caption );

    feature_html = renderTemplateHtml( feature_html , "img_alt",    feature_prompt );
    feature_html = renderTemplateHtml( feature_html , "img_title",  feature_description );

    feature_html = renderTemplateHtml( feature_html , "feature_class",  feature_class );

    img_src             = image_no  ? "" : img_src;
    feature_img_div_class = image_no  ? "feature_small_img_div_hidden" : feature_img_div_class;

    if( isPrintLog())  console.log("image_no == 'no'? " + image_no +", feature_img_div_class:" + feature_img_div_class );
    feature_html = renderTemplateHtml( feature_html , "img_src",  img_src );
    feature_html = renderTemplateHtml( feature_html , "feature_img_div_class",  feature_img_div_class );

    feature_html = renderTemplateHtml( feature_html , "feature_small_img_class",  feature_small_img_class );
    
    return feature_html;
}
        

/***********************************
 * Init UI by prompt feature data
 * 
 ***************************************/


function handleData(data,status ){
    featureData = data;
    if( isPrintLog())  console.log('get feature data, status:' + status );
    //alert( featureData );
    //let container = document.querySelector("#featureOperationBox");
    let container = $("#operationDiv");
    //if( isPrintLog())  console.log( '$("#operationBox2") ' +container);
    renderUI( featureData , container );

    initEvent();
    initFeatureTailsSlideButton();
}
	 
//$.get( feature_url, handleData );
function getDataAndInit() {
    $.ajax( {
        url: feature_url,
        error: function( x, status, err) {
            setMsg( "Fail to get feature data:" + status +","+err + ". Check your network or contact us."  );
        },
        success:handleData
     } );
}

function setMsg( msg ) {
    $("#msgBox").text( msg );
    $("#msgBox").show();
}

$(document).ready( function(){
    getDataAndInit();
})