/*********************************************************
 * GifTastic JS
 * @package GifTastic
 * @author Christopher Collins
 * @version 2.0
 * @license none (public domain)
 * 
 * ===============[ TABLE OF CONTENTS ]===================
 * 0. Globals
 * 1. Functions
 * 2. Document Ready
 * 
 * @todo
 * -make fully mobile responsive
 * -Integrate with additional apis (omdb, bands in town)
 *********************************************************/
/* ===============[ 0. GLOBALS ]=========================*/
var defaultTopics = ["games","movies"];
var TOPICS = defaultTopics.slice(0);
var FavoriteTopics = (localStorage.getItem("favorites") === null ) ? [] : JSON.parse(localStorage.getItem("favorites"));
var lastQuery;

/* ===============[ 0. Functions ]=======================*/
deparam = function (querystring) {
  // remove any preceding url and split
  querystring = querystring.substring(querystring.indexOf('?')+1).split('&');
  var params = {}, pair, d = decodeURIComponent, i;
  // march and parse
  for (i = querystring.length; i > 0;) {
    pair = querystring[--i].split('=');
    params[d(pair[0])] = d(pair[1]);
  }

  return params;
};

function searchGiphy(searchTerm, limit, offset, rating) {
  var APIKEY = "vDNhAtsL0DjaOu02FRzz7DeVLn12EtZD";

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://api.giphy.com/v1/gifs/search?";
  if (searchTerm === undefined || searchTerm="") { // Just get the most trending GIPHY or run the last query again.
    queryURL = "https://api.giphy.com/v1/gifs/trending?";

    // Run the last query again
    if(lastQuery !== undefined){
      queryURL = lastQuery;

      // Search GIPHY API
      $.ajax({
        url: queryURL,
        method: "GET",
      }).then(updatePage);
      return;
    }
  }

  // Create QueryParams
  var queryParams = {
    "api_key": APIKEY
  };
  queryParams.q = String(searchTerm.trim());

  if (limit !== undefined && limit !== "") {
    queryParams.limit = parseInt(limit.trim());
  }

  if (offset !== undefined && offset !== "") {
    queryParams.offset = parseInt(offset.trim());
  }

  if (rating !== undefined && rating !== "") {
    queryParams.rating = String(rating.trim());
  }

  // Combine queryURL with queryParams
  queryURL = queryURL + $.param(queryParams);
  console.log("---------------------------------------------------");
  console.log(queryURL);
  console.log("---------------------------------------------------");
  lastQuery = queryURL;

  // Search GIPHY API
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(updatePage);
}

function updatePage(response) {
  var Data = response.data;
  // console.log(response.data);

  var resultsDiv = $("#all-giphs-view");
  var queryParams = deparam(lastQuery);

  for (var i = 0; i < Data.length; i++) {
    var still_image = Data[i].images.original_still.url;
    var animated_image = Data[i].images.original.url;
    var slug = Data[i].slug;
    var title = Data[i].title;
    title = $("<h5>").addClass("card-title").text(title);
    subtitle = $("<h6>").addClass("card-subtitle mb-2 text-muted").text(queryParams.q);

    var rating = $("<p>").addClass("card-text font-weight-bold").text("Rating: " + Data[i].rating.toUpperCase());
    var card_body = $("<div>").addClass("card-body text-center").append(title, subtitle, rating);

    var GIPH = $("<img>").addClass("card-img-top giph").attr("data-still", still_image).attr("data-animated", animated_image).attr("data-state", "still").attr("src", still_image).attr("alt", slug);
    GIPH = $("<div>").addClass("card col-lg-3 col-md-6 col-sm-12").html(GIPH);
    GIPH.append(card_body);
    resultsDiv.prepend(GIPH);
  }
}

function renderButtons() {
  $("#favorite-giph-buttons").empty();
  $("#giph-buttons").empty();

  if(FavoriteTopics.length > 0 ){
    $("#favorite-giph-buttons").show();
    var favTitle = $("<i>").addClass("far fa-star");
    favTitle = $("<h4>").append(favTitle," Favorites");
    $("#favorite-giph-buttons").append(favTitle);
    for (var i = 0; i < FavoriteTopics.length; i++) {
      var btn = $("<button>").addClass("btn btn-dark giph").attr("data-topic-index", i).text(FavoriteTopics[i]);
      $("#favorite-giph-buttons").append(btn);
    }
  }else{
    $("#favorite-giph-buttons").hide();
  }

  for (var i = 0; i < TOPICS.length; i++) {
    var btn = $("<button>").addClass("btn btn-dark giph").attr("data-topic-index", i).text(TOPICS[i]);
    $("#giph-buttons").append(btn);
  }

  // Save to LocalStorage
  localStorage.setItem("favorites",JSON.stringify(FavoriteTopics));

  // console.log("Favorites",FavoriteTopics);
  // console.log("Topics",TOPICS);
}

function reset() {
  if($(this).attr("id") === "reset"){
    TOPICS = defaultTopics.slice(0);
    FavoriteTopics = [];
  }

  renderButtons();
  $("#all-giphs-view").empty();
}

/**===============[ 3. Document Ready ]==================== 
 * NOTE: $(function(){ === $(document).ready(function() {
 * it's the shorthand version of document ready. 
 *********************************************************/
$(function () {
  renderButtons();

  // Add Giph Button
  $('#add-topic').on('click', function (e) {
    e.preventDefault();

    var topic = $('#search-input').val().trim();
    $('#search-input').val("");

    var favorite = parseInt($("#favorite").data('toggled'));
    if(favorite === 1 ){
      if(FavoriteTopics.indexOf(topic) === -1){
        FavoriteTopics.push(topic);
      }
      $("#favorite").click();
    }else{
      if(TOPICS.indexOf(topic) === -1){
        TOPICS.push(topic);
      }
    }
    
    renderButtons();
  });

  $('#reset').on('click', reset);
  $('#clear').on('click', reset);

  // Search Giphs
  $('#button-section').on('click', '.giph.btn', function () {
    var searchTerm = $(this).text();
    searchTerm = (searchTerm !== undefined) ? searchTerm.trim() : "";

    var rating = $("#gif-search-form input[name='ratingOption']:checked").val();
    rating = (rating !== undefined) ? rating.trim() : "";

    var limit = $("#gif-search-form #limit").val();
    limit = (limit !== undefined) ? limit.trim() : "";

    var offset = $("#gif-search-form #offset").val();
    offset = (offset !== undefined) ? offset.trim() : "";
    
    searchGiphy(searchTerm, limit, offset, rating);
  });

  // Toggle Rating CSS
  $("#gif-search-form .form-check-input[type=radio]").click(function(){
    var Toggled = parseInt($(this).data('toggled'));
    
    if(Toggled === 0){
      $(this).data('toggled',1);
      $(".form-check-label").css({'color':'#F0F5F9','font-weight':'normal'});
      $(this).next().css({'color':'#0092CA','font-weight':'bold'});
    }else{
      $(this).data('toggled',0);
      $(this).next().css({'color':'#F0F5F9','font-weight':'normal'});
    }
    
  });

  // Toggle Favorite 
  $("#favorite").click(function(){
    var Toggled = parseInt($(this).data('toggled'));
    var unfavorite = $("<i>").addClass("far fa-star");
    var favorite = $("<i>").addClass("fas fa-star");
    
    if(Toggled === 0){
      $(this).data('toggled',1);
      $(this).html("");
      $(this).append(favorite," Favorite");
      $(this).removeClass("btn-primary");
      $(this).addClass("btn-dark");
    }else{
      $(this).data('toggled',0);
      $(this).html("");
      $(this).append(unfavorite," Favorite");
      $(this).removeClass("btn-dark");
      $(this).addClass("btn-primary");
    }

  });

  // Toggle Aninimated Giph
  $('#all-giphs-view').on('click', '.giph.card-img-top', function () {
    var state = $(this).attr('data-state');

    if (state === "still") {
      $(this).attr("src", $(this).attr("data-animated"));
      $(this).attr("data-state", "animate");
    } else {
      $(this).attr("src", $(this).attr("data-still"));
      $(this).attr("data-state", "still");
    }
  });

});