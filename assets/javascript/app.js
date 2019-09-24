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
 * -Clean up CSS on Filter Parameters
 * -don't allow duplicates
 * -make fully mobile responsive
 * -don't overwrite existing gifs...but add 10 gifs to existing page. 
 * -Add metadata (title, tags, etc)
 * -Integrate with additional apis (omdb, bands in town)
 * -Allow users to add their favorite gifs...use localStorage or cookies to save this.
 *********************************************************/
/* ===============[ 0. GLOBALS ]=========================*/
var defaultTopics = ["games"];
var TOPICS = defaultTopics.slice(0);
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
  if (searchTerm === undefined) { // Just get the most trending GIPHY or run the last query again.
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

  if (limit !== undefined) {
    queryParams.limit = parseInt(limit.trim());
  }

  if (offset !== undefined) {
    queryParams.offset = parseInt(offset.trim());
  }

  if (rating !== undefined) {
    queryParams.rating = String(rating.trim());
  }

  // Combine queryURL with queryParams
  queryURL = queryURL + $.param(queryParams);
  console.log(queryURL);
  lastQuery = queryURL;

  // Search GIPHY API
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(updatePage);

}

function updatePage(response) {
  var Data = response.data;
  console.log(Data);

  var resultsDiv = $("#all-giphs-view");
  resultsDiv.empty();

  for (var i = 0; i < Data.length; i++) {
    var still_image = Data[i].images.original_still.url;
    var animated_image = Data[i].images.original.url;
    var slug = Data[i].slug;
    var rating = $("<p>").addClass("card-text font-weight-bold").text("Rating: " + Data[i].rating.toUpperCase());
    rating = $("<div>").addClass("card-body").html(rating);

    var GIPH = $("<img>").addClass("card-img-top giph").attr("data-still", still_image).attr("data-animated", animated_image).attr("data-state", "still").attr("src", still_image).attr("alt", slug);
    GIPH = $("<div>").addClass("card col-3").html(GIPH);
    GIPH.append(rating);
    resultsDiv.append(GIPH);
  }
}

function renderButtons() {
  $("#giph-buttons").empty();

  for (var i = 0; i < TOPICS.length; i++) {
    var btn = $("<button>").addClass("btn btn-dark giph").attr("data-topic-index", i).text(TOPICS[i]);
    $("#giph-buttons").append(btn);
  }
}

function reset() {
  if($(this).attr("id") === "reset"){
    TOPICS = defaultTopics.slice(0);
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
    TOPICS.push(topic);

    renderButtons();
  });

  $('#reset').on('click', reset);
  $('#clear').on('click', reset);

  // Search Giphs
  $('#giph-buttons').on('click', '.giph.btn', function () {
    var rating = $("#gif-search-form input[name='ratingOption']:checked").val().trim();
    var limit = $("#gif-search-form #limit").val().trim();
    var offset = $("#gif-search-form #offset").val().trim();

    searchGiphy($(this).text().trim(), limit, offset, rating);
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