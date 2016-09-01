/*! 
 * Roots v 2.0.0
 * Follow me @adanarchila at Codecanyon.net
 * URL: http://codecanyon.net/item/roots-phonegapcordova-multipurpose-hybrid-app/9525999
 * Don't forget to rate Roots if you like it! :)
 */

// In this file we are goint to include all the Controllers our app it's going to need

(function(){
  'use strict';
 
  var app = angular.module('app', ['onsen', 'angular-images-loaded', 'ngMap','ngAnimate', 'angular-carousel','ngSanitize' ]);

  

    

    // Filter to convert HTML content to string by removing all HTML tags
  app.filter('htmlToPlaintext', function() {
      return function(text) {
        return String(text).replace(/<[^>]+>/gm, '');
      };
    }
  );

  app.directive('datePicker', function () {
      return {
          link: function postLink(scope, element, attrs) {
              scope.$watch(attrs.datePicker, function () {
                  if (attrs.datePicker === 'start') {
                      //element.pickadate();
                  }
              });
          }
      };
  });  
    
    
  
    

  app.controller('networkController', function($scope){

    // Check if is Offline
    document.addEventListener("offline", function(){

      offlineMessage.show();

      /* 
       * With this line of code you can hide the modal in 8 seconds but the user will be able to use your app
       * If you want to block the use of the app till the user gets internet again, please delete this line.       
       */

      setTimeout('offlineMessage.hide()', 8000);  

    }, false);

    document.addEventListener("online", function(){
      // If you remove the "setTimeout('offlineMessage.hide()', 8000);" you must remove the comment for the line above      
      // offlineMessage.hide();
    });

  });

  // This functions will help us save the JSON in the localStorage to read the website content offline

  Storage.prototype.setObject = function(key, value) {
      this.setItem(key, JSON.stringify(value));
  }

  Storage.prototype.getObject = function(key) {
      var value = this.getItem(key);
      return value && JSON.parse(value);
  }

  // This directive will allow us to cache all the images that have the img-cache attribute in the <img> tag
//  app.directive('imgCache', ['$document', function ($document) {
//    return {
//      link: function (scope, ele, attrs) {
//        var target = $(ele);
//
//        scope.$on('ImgCacheReady', function () {
//
//          ImgCache.isCached(attrs.src, function(path, success){
//            if(success){
//              ImgCache.useCachedFile(target);
//            } else {
//              ImgCache.cacheFile(attrs.src, function(){
//                ImgCache.useCachedFile(target);
//              });
//            }
//          });
//        }, false);
//
//      }
//    };
//  }]);    


  
  
  
  

  // News Controller / Show Latest Posts
  // This controller gets all the posts from our WordPress site and inserts them into a variable called $scope.items
  
  //Detroit Listings: http://www.myvipclubs.com/test/api/get_posts/?post_type=listing&count=100&zones_id=3682
  app.controller('newsController', [ '$http', '$scope', '$rootScope', function($http, $scope, $rootScope){

    $scope.yourAPI = 'http://www.myvipclubs.com/members/api/get_posts/?post_type=listing&count=100&zones_id=3682';
    $scope.items = [];
    $scope.totalPages = 0;
    $scope.currentPage = 1;
    $scope.pageNumber = 1;
    $scope.isFetching = true;
    $scope.lastSavedPage = 0;
      
      

    

    // Let's initiate this on the first Controller that will be executed.
    ons.ready(function() {
      
      // Cache Images Setup
      // Set the debug to false before deploying your app
      ImgCache.options.debug = false;

      ImgCache.init(function(){

        //console.log('ImgCache init: success!');
        $rootScope.$broadcast('ImgCacheReady');
        // from within this function you're now able to call other ImgCache methods
        // or you can wait for the ImgCacheReady event

      }, function(){
        //console.log('ImgCache init: error! Check the log for errors');
      });

    });


    $scope.pullContent = function(){
      
      $http.jsonp($scope.yourAPI+'/&page='+$scope.pageNumber+'&callback=JSON_CALLBACK').success(function(response) {

        if($scope.pageNumber > response.pages){

          // hide the more news button
          $('#moreButton').fadeOut('fast');  

        } else {

          $scope.items = $scope.items.concat(response.posts);
          window.localStorage.setObject('rootsPosts', $scope.items); // we save the posts in localStorage
          window.localStorage.setItem('rootsDate', new Date());
          window.localStorage.setItem("rootsLastPage", $scope.currentPage);
          window.localStorage.setItem("rootsTotalPages", response.pages);

          // For dev purposes you can remove the comment for the line below to check on the console the size of your JSON in local Storage
          //for(var x in localStorage)console.log(x+"="+((localStorage[x].length * 2)/1024/1024).toFixed(2)+" MB");

          $scope.totalPages = response.pages;
          $scope.isFetching = false;

          if($scope.pageNumber == response.pages){

            // hide the more news button
            $('#moreButton').fadeOut('fast'); 

          }

        }

      });

    }

    $scope.getAllRecords = function(pageNumber){

      $scope.isFetching = true;    

      if (window.localStorage.getItem("rootsLastPage") == null ) {

        $scope.pullContent();

      } else {
        
        var now = new Date();
        var saved = new Date(window.localStorage.getItem("rootsDate"));

        var difference = Math.abs( now.getTime() - saved.getTime() ) / 3600000;

        // Lets compare the current dateTime with the one we saved when we got the posts.
        // If the difference between the dates is more than 24 hours I think is time to get fresh content
        // You can change the 24 to something shorter or longer

        if(difference > .01){
          // Let's reset everything and get new content from the site.
          $scope.currentPage = 1;
          $scope.pageNumber = 1;
          $scope.lastSavedPage = 0;
          window.localStorage.removeItem("rootsLastPage");
          window.localStorage.removeItem("rootsPosts");
          window.localStorage.removeItem("rootsTotalPages");
          window.localStorage.removeItem("rootsDate");

          $scope.pullContent();
        
        } else {
          
          $scope.lastSavedPage = window.localStorage.getItem("rootsLastPage");

          // If the page we want is greater than the last saved page, we need to pull content from the web
          if($scope.currentPage > $scope.lastSavedPage){

            $scope.pullContent();
          
          // else if the page we want is lower than the last saved page, we have it on local Storage, so just show it.
          } else {

            $scope.items = window.localStorage.getObject('rootsPosts');
            $scope.currentPage = $scope.lastSavedPage;
            $scope.totalPages = window.localStorage.getItem("rootsTotalPages");
            $scope.isFetching = false;

          }

        }

      }

    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };

    $scope.showPost = function(index){
        
      $rootScope.postContent = $scope.items[index];
      $scope.ons.navigator.pushPage('post.html');
      //$scope.item.custom_fields.average_rating = $scope.rating1;

    };

    $scope.nextPage = function(){

      $scope.currentPage++; 
      $scope.pageNumber = $scope.currentPage;                 
      $scope.getAllRecords($scope.pageNumber);        

    }

  }]);

  // This controller let us print the Post Content in the post.html template
  app.controller('postController', [ '$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce){
    
    $scope.item = $rootScope.postContent;

    $scope.bgColor = 'red';
    $scope.height = '250px';
    //$scope.image = $scope.item.thumbnail_images.thumbnail.url;

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };    

  }]);
    
    
    
    // Ratings
    
app.controller("RatingCtrl", function($scope) {
   //$scope.item.custom_fields.average_rating = rating1;
  $scope.rating1 = $scope.item.custom_fields.average_rating;
  $scope.rating2 = 1;
  $scope.isReadonly = true;
  $scope.rateFunction = function(rating) {
    console.log("Rating selected: " + rating);
  };
})
.directive("starRating", function() {
  return {
    restrict : "EA",
    template : "<ul class='rating' ng-class='{readonly: readonly}'>" +
               "  <li ng-repeat='star in stars' ng-class='star' ng-click='toggle($index)'>" +
               "    <i class='fa fa-star'></i>" + //&#9733
               "  </li>" +
               "</ul>",
    scope : {
      ratingValue : "=ngModel",
      max : "=?", //optional: default is 5
      onRatingSelected : "&?",
      readonly: "=?"
    },
    link : function(scope, elem, attrs) {
      if (scope.max === undefined) { scope.max = 5; }
      function updateStars() {
        scope.stars = [];
        for (var i = 0; i < scope.max; i++) {
          scope.stars.push({
            filled : i < scope.ratingValue
          });
        }
      };
      scope.toggle = function(index) {
        if (scope.readonly === undefined || scope.readonly == false){
          scope.ratingValue = index + 1;
          scope.onRatingSelected({
            rating: index + 1
          });
        }
      };
      scope.$watch("ratingValue", function(oldVal, newVal) {
        if (newVal) { updateStars(); }
      });
    }
  };
});
    
    
    
    // Accordian Posts Page
    
    app.controller('MyCtrl', function($scope) {
  $scope.groups = [];
  
  $scope.groups = [
    { name: 'Overview', id: 1, items: [{ subName: 'SubBubbles1', subId: 'Hello1' }, { subName: 'SubBubbles2', subId: '' }]},
    { name: 'Group1', id: 1, items: [{ subName: 'SubGrup1', subId: '1-1' }, { subName: 'SubGrup1', subId: '1-2' }]},
    { name: 'Group1', id: 1, items: [{ subName: 'SubGrup1', subId: '1-1' }, { subName: 'SubGrup1', subId: '1-2' }]},
  ];
  
  
  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  
});
    
    
    
    

  // Map Markers Controller

  var map;

  app.controller('markersController', function($scope, $compile){
    
    $scope.infoWindow = {
      title: 'title',
      content: 'content'
    };

    $scope.markers = [
      {
        'title' : 'Location #1',
        'content' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras a viverra magna',
        'location'  : [40.7112, -74.213]
      }, 
      {
        'title' : 'Location #2',
        'content' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras a viverra magna',
        'location'  : [40.7243, -74.2014]
      }, 
      {
        'title' : 'Location #3',
        'content' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras a viverra magna',
        'location'  : [40.7312, -74.1923]
      }
      ];

      $scope.showMarker = function(event){

        $scope.marker = $scope.markers[this.id];
          $scope.infoWindow = {
          title: $scope.marker.title,
          content: $scope.marker.content
        };
        $scope.$apply();
        $scope.showInfoWindow(event, 'marker-info', this.getPosition());

      }

  });

  app.controller('bookingController', function($scope, $compile, $filter){

    $scope.bookdate = 'Pick Reservation Date';
    $scope.booktime = 'Pick Reservation Time';

    $scope.chooseDate = function(){
      
      var options = {
        date: new Date(),
        mode: 'date'
      };

      datePicker.show(options, function(date){
        
        var day   = date.getDate();
          var month   = date.getMonth() + 1;
          var year  = date.getFullYear();

          $scope.$apply(function(){
            $scope.bookdate = $filter('date')(date, 'MMMM d, yyyy');      
          });

      });

    }

    $scope.chooseTime = function(){
      
      var options = {
        date: new Date(),
        mode: 'time'
      };

      datePicker.show(options, function(time){
          $scope.$apply(function(){
            $scope.booktime = $filter('date')(time, 'hh:mm a');
          });
      });

    }

  });
    
    
//  var app = angular.module('app', ['onsen','ngAudio']);

 
  // Radio Controller
  var radio = null;
  var isPlaying = false;

  app.controller('radioController', function($scope, $sce, ngAudio){
    
//    $scope.radioHost = 'http://192.99.8.192'; // Replace this with your own radio stream URL
//    $scope.radioPort = '3536'; // Replace this with the port of your Radio Stream
    $scope.lastFMKey = '3133f83e6fc1e18b655e9cc08f87a66a';
    $scope.lastFM = 'http://ws.audioscrobbler.com/2.0/?method=track.search&format=json&limit=1&api_key='+$scope.lastFMKey+'&track=';

    $scope.radioURL = $scope.radioHost+':'+$scope.radioPort+'/;';
    $scope.buttonIcon = '<span class="ion-ios-play"></span>';

    $scope.radioOptions = {
      albumArt: 'images/smlogo2.png',
      songName: ''
    };

    // Let's start the Shoutcast plugin to get the Song Name
    $.SHOUTcast({
       host : '192.99.8.192', // Replace this with your own radio stream URL but remove the http
       port : $scope.radioPort,
       interval : 40000, // Refresh interval in miliseconds is equal to 40 seconds.
       stream: 1, // Replace with your stream, default is 1.
       stats : function(){
          var songTitle = this.get('songtitle');
          var albumArt = '';
          
          $.getJSON( $scope.lastFM+encodeURIComponent(songTitle), function( data ) {
            if(data.error){
              //console.log(data.message);
              albumArt = 'images/smlogo2.png';    
            } else {
              //console.log(data); // delete this for production
              if( data.results!== undefined ){
                if(data.results.trackmatches !="\n" ){
                  if(data.results.trackmatches.track.image !== undefined){
                    albumArt = data.results.trackmatches.track.image[3]['#text'];
                  } else {
                    albumArt = 'images/smlogo2.png';
                  }                  
                } else {
                  albumArt = 'images/smlogo2.png'; 
                }
              }
            }

            $scope.$apply(function(){
              $scope.radioOptions.albumArt = albumArt;
            });

          });
          
          $scope.$apply(function(){
            $scope.radioOptions.songName = songTitle;
          });
       }

    }).startStats();

    if (radio!==null) {   
        $scope.radio = radio;
        
        if(isPlaying){
          $scope.buttonIcon = '<span class="ion-ios-pause"></span>';
        } else {
          $scope.buttonIcon = '<span class="ion-ios-play"></span>';
        }
    } else {
      
      isPlaying = false;
        $scope.radio = ngAudio.load($scope.radioURL);
        radio = $scope.radio;
    }

    $scope.renderHtml = function (htmlCode) {
          return $sce.trustAsHtml(htmlCode);
      };

      $scope.startRadio = function(){

        if(!isPlaying){
          // Let's play it
          isPlaying = true;
        $scope.radio.play();

        $scope.buttonIcon = '<span class="ion-ios-pause"></span>';
        $scope.isFetching = true;

        } else {
          // Let's pause it
          isPlaying = false;
        $scope.radio.pause();
        $scope.buttonIcon = '<span class="ion-ios-play"></span>';

        }

      };

      // Check if is Offline
    document.addEventListener("offline", function(){

      isPlaying = false;
      $scope.radio.stop();
      $scope.buttonIcon = '<span class="ion-ios-play"></span>';
      $scope.radio = null;
      modal.show();
      setTimeout('modal.hide()', 8000);       

    }, false);

    document.addEventListener("online", function(){
      $scope.radio = ngAudio.load($scope.radioURL);
      radio = $scope.radio;
    });

  });

  var pad2 = function(number){
    return (number<10 ? '0' : '') + number;
  };

  app.filter('SecondsToTimeString', function() {
    return function(seconds) {
      var s = parseInt(seconds % 60);
      var m = parseInt((seconds / 60) % 60);
      var h = parseInt(((seconds / 60) / 60) % 60);
      if (seconds > 0) {
        return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
      } else {
        return '00:00:00';
      }
    };
  });
    
    
    
    
    
    
    
    
    
    
    
    
    
    

  // Plugins Controller

  app.controller('pluginsController', function($scope, $compile){

    $scope.openWebsite = function(){
      var ref = window.open('http://google.com', '_blank', 'location=yes');
    }

    $scope.openSocialSharing = function(){
      
      window.plugins.socialsharing.share('Message, image and link', null, 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com');

      /*
       *  Social Sharing Examples
       *  For more examples check the documentation: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
   
        window.plugins.socialsharing.share('Message only')
        window.plugins.socialsharing.share('Message and subject', 'The subject')
        window.plugins.socialsharing.share(null, null, null, 'http://www.google.com')
        window.plugins.socialsharing.share('Message and link', null, null, 'http://www.google.com')
        window.plugins.socialsharing.share(null, null, 'https://www.google.com/images/srpr/logo4w.png', null)
        window.plugins.socialsharing.share('Message and image', null, 'https://www.google.com/images/srpr/logo4w.png', null)
        window.plugins.socialsharing.share('Message, image and link', null, 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com')
        window.plugins.socialsharing.share('Message, subject, image and link', 'The subject', 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com')
      *
      */

    }


    $scope.openEmailClient = function(){

      ons.ready(function(){

        cordova.plugins.email.open({
          to:      'han@solo.com',
          subject: 'Hey!',
          body:    'May the <strong>force</strong> be with you',
          isHtml:  true
        });

      });
      
    }

    $scope.getDirectionsApple = function(){
      
      window.location.href = "maps://maps.apple.com/?q=37.774929,-122.419416";

    }

    $scope.getDirectionsGoogle = function(){

      var ref = window.open('http://maps.google.com/maps?q=37.774929,-122.419416', '_system', 'location=yes');

    }

    $scope.getDate = function(){
      
      var options = {
        date: new Date(),
        mode: 'date'
      };

      datePicker.show(options, function(date){
        alert("date result " + date);  
      });

    }

  });

})();