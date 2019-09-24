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
  var queryParams = {};
  queryParams.api_key = APIKEY;
  
  if(searchTerm !== undefined && searchTerm !== ""){
    queryParams.q = String(searchTerm.trim());
  } else if (searchTerm === undefined || searchTerm === "") { // Just get the most trending GIPHY or run the last query again.
    queryURL = "https://api.giphy.com/v1/gifs/trending?";

    // Run the last query again
    if(lastQuery !== undefined){
      if(lastQuery.split("/").indexOf("api.giphy.com") === -1 ){ return; }
      queryURL = lastQuery;

      // Search GIPHY API
      $.ajax({
        url: queryURL,
        method: "GET",
      }).then(updatePage);
      return;
    }
  }

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
  return;
}

function movieSearch(movie, _type, _year, _pageNumber){
  var APIKEY = "9533d959";

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://www.omdbapi.com/?"
  var queryParams = {};
  queryParams.apikey = APIKEY;

  if(movie !== undefined && movie !== ""){
    queryParams.s = movie.trim();
  }else if (lastQuery !== undefined ){
    if(lastQuery.split("/").indexOf("www.omdbapi.com") === -1 ){ return; }
    queryURL = lastQuery;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(updatePage);

    return;
  }else { return; }

  if(_type !== undefined && _type !== ""){
    queryParams.type = _type.trim();
  }

  if(_year !== undefined && _year !== ""){
    queryParams.y = parseInt(_year.trim());
  }

  if(_pageNumber !== undefined && _pageNumber !== ""){
    queryParams.page = parseInt(_pageNumber.trim());
  }

  // Combine queryURL with queryParams
  queryURL = queryURL + $.param(queryParams);
  console.log("-------------------------------------------------");
  console.log(queryURL);
  console.log("-------------------------------------------------");
  lastQuery = queryURL;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(updatePage);
  return;
}

function updatePage(response) {
  var resultsDiv = $("#all-giphs-view");
  var queryParams = deparam(lastQuery);

  if(lastQuery.split("/").indexOf("api.giphy.com") !== -1) {
    // Update Page for GIPHY
    var Data = response.data;

    // Detect False Response
    if(Data.length === 0 ){
      alert("Giph not found!");
      return;
    }
    
    for (var i = Data.length - 1; i >= 0; i--) {
      var still_image = Data[i].images.original_still.url;
      var animated_image = Data[i].images.original.url;
      var slug = Data[i].slug;
      var title = Data[i].title;
      title = $("<h5>").addClass("card-title").text(title);
      subtitle = $("<h6>").addClass("card-subtitle mb-2 text-muted").text(queryParams.q);
      
      var rating = $("<p>").addClass("card-text font-weight-bold").text("Rating: " + Data[i].rating.toUpperCase());
      var card_body = $("<div>").addClass("card-body text-center").append(title, subtitle, rating);

      var GIPH = $("<img>").addClass("card-img-top giph").attr("data-still", still_image).attr("data-animated", animated_image).attr("data-state", "still").attr("src", still_image).attr("alt", slug);
      GIPH = $("<div>").addClass("card col-lg-3 col-md-6 col-sm-12").append(GIPH, card_body);
      resultsDiv.prepend(GIPH);
    }
    
  }else if(lastQuery.split("/").indexOf("www.omdbapi.com") !== -1) {
    // Update Page for Movies
    // Detect False Response
    if(response.Response === "False"){
      alert(response.Error);
      return;
    }

    var Data = response.Search;
    
    for (var i = Data.length - 1; i >= 0; i--){
      var poster = (Data[i].Poster !== "N/A") ? Data[i].Poster : "https://placehold.it/250";
      var title = Data[i].Title;
      var subtitle = queryParams.s + " - " + Data[i].Type;
      var year = Data[i].Year;
      
      title = $("<h5>").addClass("card-title").text(title)
      subtitle = $("<h6>").addClass("card-subtitle mb-2 text-muted").text(subtitle);
      year = $("<p>").addClass("card-text font-weight-bold").text("Year: " + year);
      var card_body = $("<div>").addClass("card-body text-center").append(title, subtitle, year);

      var MOVIE = $("<img>").addClass("card-img-top movie").attr("data-id", Data[i].imdbID).attr("src",poster).attr("alt", Data[i].Title);
      MOVIE = $("<div>").addClass("card col-lg-3 col-md-6 col-sm-12").append(MOVIE, card_body);
      resultsDiv.prepend(MOVIE);
    }

  }

  return;
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
  return;
}

function reset(e) {
  e.preventDefault();
  if($(this).attr("id") === "reset"){
    TOPICS = defaultTopics.slice(0);
    FavoriteTopics = [];
  }

  renderButtons();
  $("#all-giphs-view").empty();
  return;
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
  $('#button-section').on('click', '.giph.btn', function (e) {
    e.preventDefault();

    var searchType = $("#search-type").children("option:selected").val();
    var searchTerm = $(this).text();
    searchTerm = (searchTerm !== undefined) ? searchTerm.trim() : "";

    // GIPHY PARAMETERS
    var rating = $("#gif-search-form input[name='ratingOption']:checked").val();
    rating = (rating !== undefined) ? rating.trim() : "";
    
    var limit = $("#gif-search-form #limit").val();
    limit = (limit !== undefined) ? limit.trim() : "";
    
    var offset = $("#gif-search-form #offset").val();
    offset = (offset !== undefined) ? offset.trim() : "";
    
    // MOVIE PARAMETERS
    var movieType = $("#movieType").children("option:selected").val();
    movieType = (movieType !== undefined) ? movieType.trim() : "";
    
    var movieYear = $("movieYear").val();
    movieYear = (movieYear !== undefined) ? movieYear.trim() : "";

    var pageNumber = $("moviePage").val();
    pageNumber = (pageNumber !== undefined) ? pageNumber.trim() : "";

    switch (searchType) {
      case "giph":
        searchGiphy(searchTerm, limit, offset, rating);
        break;
    
      case "movie":
        movieSearch(searchTerm, movieType, movieYear, pageNumber);
        
        break;
    
      default:
        searchGiphy(searchTerm, limit, offset, rating);
        break;
    }

  });

  // Toggle Rating CSS
  $("#gif-search-form .form-check-input[type=radio]").click(function(e){
    e.preventDefault();
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
  $("#favorite").click(function(e){
    e.preventDefault();

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

  // Search Type on Change Show Different Parameters
  $("#search-type").change(function(){
    var searchType = $(this).children("option:selected").val();
    
    switch (searchType) {
      case "giph":
        $("#movie-search-form").slideUp();
        $("#gif-search-form").slideDown("slow");
        break;

      case "movie":
        $("#gif-search-form").slideUp();
        $("#movie-search-form").slideDown("slow");
        break;
    
      default:
        $("#movie-search-form").slideUp();
        $("#gif-search-form").slideDown("slow");
        break;
    }
  }).change(); // Trigger initial change on page load.

});