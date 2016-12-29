jQuery(document).ready(function($) {
    console.log('loaded');

    var body = $('body');
    var $img = $('.img');
    var $title = $('.title');
    var $source = $('.source');
    var $desc = $('.desc');

    var viewNews = function(data) {
        var a = data.articles;

        body.append('<div class="row source"> <h2>' +
            data.source + '</h2> </div>');
        for (var i = 0; i < a.length; i++) {

            var article = 'article' + [i];
            var image = 'image' + [i];

            console.log(a[i].urlToImage);

            $('.source').append('<div class="col s8 article offset-s2" id="' + article + '"></div>');

            $('#' + article).append('<img class="col s4 responsive-image" id="' + image + '">');
            $('#' + image).attr('src', a[i].urlToImage);

            $('#' + article).append('<a href="' + a[i].url + '">' +
                '<h4 class="title">' + a[i].title + '</h4>' +
                '</a>');
            $('#' + article).append('<p class="center-align">' + a[i].description + '</p>');
            $('#' + article).append('<form class="fave " method="POST" action="/news">' +
                '<input class="hide" name="title" value=' + toString(a[i].title) + '>' +
                '<input class="hide" name="url" value=' + a[i].url + '>' +
                '<button class="save btn red" type="submit" > Save </button> </form>');
        }
    };

    var getNews = function(source) {
        $('.source').remove();
        console.log('news click');
        $.ajax({
            'url': 'https://newsapi.org/v1/articles?source=' +
                source +
                '&sortBy=top&apiKey=965acc5184e44a65a376cddaff5df040',
            'method': 'GET',
            'success': function(data) {
                viewNews(data);
            }
        });
    };

    var getNYT = function(source) {
        console.log('NYT CALL');
        $('.source').remove();
        var url = "https://api.nytimes.com/svc/mostpopular/v2/mostviewed/" +
            source + "/30.json";
        url += '?' + $.param({
            'api-key': "4d4b6d3d99ad460a81e461a282bff354"
        });
        $.ajax({
                url: url,
                method: 'GET',
            }).done(function(data) {
                body.append('<div class="row source"> <h2> New York Times </h2> </div>');

                  var i = 0;
                data.results.forEach(function(a) {

                    var article = 'article' + [i];
                    var image = 'image' + [i];

                    var image_url = a.media[0]["media-metadata"][1].url;
                    console.log(image_url);

                    console.log(a);
                    console.log(image_url);

                    $('.source').append('<div class="col s8 article offset-s2" id="' + article + '"></div>');

                    $('#' + article).append('<img class="col s4 responsive-image" id="' + image + '">');
                    $('#' + image).attr('src', image_url);

                    $('#' + article).append('<a href="' + a.url + '" target="_blank">' +
                        '<h4 class="title">' + a.title + '</h4>' +
                        '</a>');
                    $('#' + article).append('<p class="center-align">' + a.abstract + '</p>');
                    $('#' + article).append('<form class="fave " method="POST" action="/news">' +
                        '<input class="hide" name="title" value=' + a.title + '>' +
                        '<input class="hide" name="url" value=' + a.url + '>' +
                        '<button class="save btn red" type="submit" > Save </button> </form>');
                    i++;
                });//end forEach
            })//end done
            .fail(function(err) {
                throw err;
            });//end fail
    };//end function

    var $drop = $('#drop-list');

    $("#search").on('click',function(e){
        $drop.toggleClass('hide');
    });

    $("#dropdown-menu").mouseleave(function(){
        $drop.toggleClass('hide');
    });


    getNews('bloomberg');

    $('#bloomberg').on('click', function() {
        getNews('bloomberg');
    });
    $('#ars-technica').on('click', function() {
        getNews('ars-technica');
    });
    $('#techcrunch').on('click', function() {
        getNews('techcrunch');
    });
    $('#hacker-news').on('click', function() {
        getNews('hacker-news');
    });
    $('#recode').on('click', function() {
        getNews('recode');
    });
    $('#wall-street').on('click', function() {
        getNews('the-wall-street-journal');
    });
    $('#the-economist').on('click', function() {
        getNews('the-economist');
    });
    $('#engadget').on('click', function() {
        getNews('engadget');
    });
    $('#business-insider').on('click', function() {
        getNews('business-insider');
    });
    $('#fortune').on('click', function() {
        getNews('fortune');
    });

    $('#NYT-tech').on('click', function() {
        getNYT('Technology');
    })
    $('#NYT-biz').on('click', function() {
        getNYT('Business-Day');
    });


});
