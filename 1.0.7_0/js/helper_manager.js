/* 
    Div floating helper manager framework. 

    Add a floating toolbar to div you specified. And manage their status such as collected, liked , liked numbers etc.
    You should provid the content of toolbar as a template.
    The framework control the operation and manage the data for you.

    @author: Ray Lee
    @email: raykkncc@gmail.com
    @date: 2023-5-20
*/

class HelperManager {

    constructor() {

        this.helperTemplateFunc = null;
        this.generateHelperId = null;
        this.on_selected = null;
        this.on_deselected = null;
        this.on_mouseenter = null;
    }

    add_helper( container ) {

    }
}

/**
 * test demo
 */

/*
*   function add_helper( container, helperTemplateFunc, generateHelperId, on_selected, on_deselected, on_mouseenter ) {

    add_helper0(container, helperTemplateFunc, generateHelperId ); 

    init_helper_events(  container , on_selected, on_deselected, on_mouseenter );
    
}
*
*/