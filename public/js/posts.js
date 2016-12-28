jQuery(document).ready(function($) {
  console.log("loaded");
  var $ups = $('#ups');
  var ups = $('#ups').text().split(' ')[0];
  var $upsButton = $('.ups-icon');

  console.log(ups);
  $ups.on('click', function(ups){
    $ups.text(ups+1);
  })


});
