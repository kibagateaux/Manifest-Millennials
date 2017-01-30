// (function($){
//   $(function(){

//     $('.button-collapse').sideNav();
//     $('.parallax').parallax();
//     $('.collapsible').collapsible();

//   }); // end of document ready
// })(jQuery); // end of jQuery name space
jQuery(document).ready(function($) {

    console.log("Init.js loaded")

    $('select').material_select();
    $('.button-collapse').sideNav();
    $('.parallax').parallax();
    $('.collapsible').collapsible();
    Materialize.updateTextFields();
})
