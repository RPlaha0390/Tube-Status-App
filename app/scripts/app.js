/*global window, jQuery:false */

(function ($) {
  'use strict';

  // Global Variables
  var myJSON;

  $('.tube-button').on('click', function () {
    // Get The JSON data 
    $.getJSON('data/tubes.json', function (jsonData) {
        myJSON = jsonData;
      })
      .done(function () {
        console.log('success')
          //Calling Function
        printDataToPage();
        //Show close button
        $('.close-button').addClass('active');
      })
  });

  $('.close-button').on('click', function () {
    $('.results').empty();
    $(this).removeClass('active');
  });


  $('.results').on('click', '.plus-accordion', function (e) {
    $(this).parents('.tube-line-item').toggleClass('show');
  });


  function printDataToPage() {
    var html = '';

    $.each(myJSON, function (index, value) {
      html += getHTMLFromTemplate('#tube-result-data', index);
    });

    $('.results').html(html)
  }

  function getHTMLFromTemplate(template, tubeLine) {
    var tubeResultsTemplate,
      template,
      content;

    tubeResultsTemplate = $(template).html();
    template = _.template(tubeResultsTemplate);
    content = template(myJSON[tubeLine]);

    return content;
  }

})(jQuery);
