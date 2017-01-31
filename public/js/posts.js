jQuery(document).ready(function($) {
  console.log("loaded");
   $('.parallax').parallax();
  var $ups = $('#ups');
  var ups = $('#ups').text().split(' ')[0];
  var $upsButton = $('#ups-icon');

  console.log(ups);
  $ups.on('click', function(ups){
    $ups.text(ups+1);
  })

//when reaction form is off active, send with AJAX
//How to update if they change their minds after this?
//Not likely but important.
//Save their reactions on the form too.
});
