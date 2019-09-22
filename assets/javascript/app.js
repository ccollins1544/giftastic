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
 *********************************************************/
/* ===============[ 0. GLOBALS ]=========================*/
var TOPICS = ["games"];

/* ===============[ 0. Functions ]=======================*/
function searchGiphy(searchTerm, limit, offset, rating){
  var APIKEY = "vDNhAtsL0DjaOu02FRzz7DeVLn12EtZD";
  
  // -------------[ Build Query URL ]----------------
  var queryURL = "https://api.giphy.com/v1/gifs/search?";
  if(searchTerm === undefined ){ // Just get the most trending GIPHY
    queryURL = "https://api.giphy.com/v1/gifs/trending?";
  }
  
  // Create QueryParams
  var queryParams = { "api_key" : APIKEY };
  queryParams.q = String(searchTerm.trim());
  
  if(limit !== undefined){
    queryParams.limit = parseInt(limit.trim());
  }

  if(offset !== undefined){
    queryParams.offset = parseInt(offset.trim());
  }

  if(rating !== undefined){
    queryParams.rating = String(rating.trim());
  }

  // Combine queryURL with queryParams
  queryURL = queryURL + $.param(queryParams);

  // Search GIPHY API
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(updatePage);

}

function updatePage(response){
  var Data = response.data;

  var resultsDiv = $("#all-giphs-view");
  resultsDiv.empty();

  for(var i=0; i < Data.length; i++){
    var still_image = Data[i].images.original_still.url;
    var animated_image = Data[i].images.original.url;
    var slug = Data[i].slug;
    var rating = $("<p>").addClass("card-text font-weight-bold").text("Rating: " + Data[i].rating);
    rating = $("<div>").addClass("card-body").html(rating);
    
    var GIPH = $("<img>").addClass("card-img-top giph").attr("data-still",still_image).attr("data-animated",animated_image).attr("data-state","still").attr("src",still_image).attr("alt",slug);
    GIPH = $("<div>").addClass("card col-3").html(GIPH);
    GIPH.append(rating);
    resultsDiv.append(GIPH);
  }

}

function renderButtons(){
  $("#giph-buttons").empty();
  
  for(var i=0; i < TOPICS.length; i++){
    var btn = $("<button>").addClass("btn btn-dark giph").attr("data-topic-index",i).text(TOPICS[i]);
    $("#giph-buttons").append(btn);
  }
}

/**===============[ 3. Document Ready ]==================== 
 * NOTE: $(function(){ === $(document).ready(function() {
 * it's the shorthand version of document ready. 
 *********************************************************/
$(function(){
  renderButtons();

  $('#add-topic').on('click', function(e){
    e.preventDefault();

    var topic = $('#search-input').val().trim();
    TOPICS.push(topic);

    renderButtons();
  });

  $('.giph.btn').on('click',function(){
    searchGiphy( $(this).text().trim() );
  });

  $('#all-giphs-view').on('click', '.giph.card-img-top', function() {
    console.log(this);
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