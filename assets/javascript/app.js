/*********************************************************
 * GifTastic JS
 * @package GifTastic
 * @author Christopher Collins
 * @version 2.3
 * @license none (public domain)
 * 
 * ===============[ TABLE OF CONTENTS ]===================
 * 0. Globals
 * 1. Functions
 *   1.1 searchGiphy()
 *   1.2 movieSearch()
 *   1.3 moviePlot()
 *   1.4 updatePage()
 *   1.5 renderButtons()
 *   1.6 reset()
 *   1.7 deparam
 * 
 * 2. Document Ready
 *   2.1 Render Buttons on ready
 *   2.2 Set Up Clickable elements
 *     2.2.1 Add gif Button
 *     2.2.2 Reset and Clear on click
 *     2.2.3 Search gifs on click
 *     2.2.4 Toggle Rating CSS
 *     2.2.5 Toggle Favorite Topic
 *     2.2.6 Toggle Animated gif
 *     2.2.7 Get movie plot on click
 *     2.2.8 Search Type on Change Show Different Parameters
 * 
 * @todo
 * -make fully mobile responsive
 *********************************************************/
/* ===============[ 0. GLOBALS ]=========================*/
var defaultTopics = ["games", "movies"];
var TOPICS = defaultTopics.slice(0);
var FavoriteTopics = (localStorage.getItem("favorites") === null) ? [] : JSON.parse(localStorage.getItem("favorites"));
var lastQuery;

/* ===============[ 1. Functions ]=======================*/
/**
 * 1.1 searchGiphy
 * @param {string} searchTerm - Search query term or phrase. 
 * @param {integer} limit - maximum number of objects to return.
 * @param {integer} offset - Specifies the starting position of the results. 
 * @param {string} rating - Filters results by specified rating.
 */
function searchGiphy(searchTerm, limit, offset, rating) {
  var APIKEY = "vDNhAtsL0DjaOu02FRzz7DeVLn12EtZD";

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://api.giphy.com/v1/gifs/search?";
  var queryParams = {};
  queryParams.api_key = APIKEY;

  if (searchTerm !== undefined && searchTerm !== "") {
    queryParams.q = String(searchTerm.trim());
  } else if (searchTerm === undefined || searchTerm === "") { // Just get the most trending GIPHY or run the last query again.
    queryURL = "https://api.giphy.com/v1/gifs/trending?";

    // Run the last query again
    if (lastQuery !== undefined) {
      if (lastQuery.split("/").indexOf("api.giphy.com") === -1) {
        return;
      }
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
    queryParams.rating = rating.trim();
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

/**
 * 1.2 movieSearch
 * @param {string} movie - Movie title to search for.
 * @param {string} _type - movie, series, episode. 
 * @param {integer} _year - Year of release.
 * @param {integer} _pageNumber - Page number to return. 
 */
function movieSearch(movie, _type, _year, _pageNumber) {
  var APIKEY = "9533d959";

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://www.omdbapi.com/?"
  var queryParams = {};
  queryParams.apikey = APIKEY;

  if (movie !== undefined && movie !== "") {
    queryParams.s = movie.trim();
  } else if (lastQuery !== undefined) {
    if (lastQuery.split("/").indexOf("www.omdbapi.com") === -1) {
      return;
    }
    queryURL = lastQuery;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(updatePage);

    return;
  } else {
    return;
  }

  if (_type !== undefined && _type !== "") {
    queryParams.type = _type.trim();
  }

  if (_year !== undefined && _year !== "") {
    queryParams.y = parseInt(_year.trim());
  }

  if (_pageNumber !== undefined && _pageNumber !== "") {
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

/**
 * 1.3 moviePlot
 * @param {integer} id - A valid IMDb ID.
 * @param {string} movie - Movie title to search for.
 * @param {string} plot - short, long
 */
function moviePlot(id, movie, plot = "short") {
  var APIKEY = "9533d959";

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://www.omdbapi.com/?"
  var queryParams = {};
  queryParams.apikey = APIKEY;

  if (id === undefined && id === "" && movie === undefined && movie === "") {
    return;
  }
  if (id !== undefined && id !== "") {
    queryParams.i = id.trim();
  }

  if (movie !== undefined && movie !== "") {
    queryParams.t = movie.trim();
  }

  if (plot !== undefined && plot !== "") {
    queryParams.plot = plot.trim();
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
  }).then(function (response) {
    if (response.Response === "False") {
      alert(response.Error);
      return;
    }

    var imdbID = response.imdbID;
    var moviePlot = $("<p>").text(response.Plot);
    var movieYear = $("<p>").text("Year: " + response.Year);
    var movieRated = $("<p>").addClass("font-weight-bold").text("Rated: " + response.Rated);
    var movieReleased = $("<p>").text("Released: " + response.Released);
    var movieRuntime = $("<p>").text("Runtime: " + response.Runtime);
    $("#" + imdbID).closest('.card').find('.card-text').empty();
    $("#" + imdbID).closest('.card').find('.card-text').append(moviePlot, movieYear, movieRated, movieReleased, movieRuntime);
  });
}

/**
 * 1.4 updatePage
 * @param {JSON} response
 */
function updatePage(response) {
  var resultsDiv = $("#all-gifs-view");
  var queryParams = deparam(lastQuery);

  if (lastQuery.split("/").indexOf("api.giphy.com") !== -1) {
    // Update Page for gif
    var Data = response.data;

    // Detect False Response
    if (Data.length === 0) {
      alert("gif not found!");
      return;
    }

    for (var i = Data.length - 1; i >= 0; i--) {
      if (i < Data.length - 2 && Data[i].id === Data[i + 1].id) {
        continue; // prevents doubles from showing
      }

      var still_image = Data[i].images.original_still.url;
      var animated_image = Data[i].images.original.url;
      var slug = Data[i].slug;
      var title = Data[i].title;
      title = $("<h5>").addClass("card-title").text(title);
      subtitle = $("<h6>").addClass("card-subtitle mb-2 text-muted").text(queryParams.q);

      var rating = $("<p>").addClass("card-text font-weight-bold").text("Rating: " + Data[i].rating.toUpperCase());
      var card_body = $("<div>").addClass("card-body text-center").append(title, subtitle, rating);

      var GIF = $("<img>").addClass("card-img-top gif").attr("id", Data[i].id).attr("data-id", Data[i].id).attr("data-still", still_image).attr("data-animated", animated_image).attr("data-state", "still").attr("src", still_image).attr("alt", slug);
      GIF = $("<div>").addClass("card col-lg-3 col-md-6 col-sm-12").append(GIF, card_body);
      resultsDiv.prepend(GIF);
    }

  } else if (lastQuery.split("/").indexOf("www.omdbapi.com") !== -1) {
    // Update Page for Movies
    // Detect False Response
    if (response.Response === "False") {
      alert(response.Error);
      return;
    }

    var Data = response.Search;

    for (var i = Data.length - 1; i >= 0; i--) {
      if (i < Data.length - 2 && Data[i].imdbID === Data[i + 1].imdbID) {
        continue; // prevents doubles from showing
      }

      var poster = (Data[i].Poster !== "N/A") ? Data[i].Poster : "https://placehold.it/250";
      var title = Data[i].Title;
      var subtitle = queryParams.s + " - " + Data[i].Type;
      var year = Data[i].Year;

      title = $("<h5>").addClass("card-title").text(title)
      subtitle = $("<h6>").addClass("card-subtitle mb-2 text-muted").text(subtitle);
      year = $("<p>").addClass("card-text font-weight-bold").text("Year: " + year);
      var card_body = $("<div>").addClass("card-body text-center").append(title, subtitle, year);

      var MOVIE = $("<img>").addClass("card-img-top movie").attr("id", Data[i].imdbID).attr("data-id", Data[i].imdbID).attr("src", poster).attr("alt", Data[i].Title);
      MOVIE = $("<div>").addClass("card col-lg-3 col-md-6 col-sm-12").append(MOVIE, card_body);
      resultsDiv.prepend(MOVIE);
    }

  }

  return;
}

/**
 * 1.5 renderButtons
 */
function renderButtons() {
  $("#favorite-gif-buttons").empty();
  $("#gif-buttons").empty();

  if (FavoriteTopics.length > 0) {
    $("#favorite-gif-buttons").show();
    var favTitle = $("<i>").addClass("far fa-star");
    favTitle = $("<h4>").append(favTitle, " Favorites");
    $("#favorite-gif-buttons").append(favTitle);
    for (var i = 0; i < FavoriteTopics.length; i++) {
      var btn = $("<button>").addClass("btn btn-dark gif").attr("data-topic-index", i).text(FavoriteTopics[i]);
      $("#favorite-gif-buttons").append(btn);
    }
  } else {
    $("#favorite-gif-buttons").hide();
  }

  for (var i = 0; i < TOPICS.length; i++) {
    var btn = $("<button>").addClass("btn btn-dark gif").attr("data-topic-index", i).text(TOPICS[i]);
    $("#gif-buttons").append(btn);
  }

  // Save to LocalStorage
  localStorage.setItem("favorites", JSON.stringify(FavoriteTopics));
  return;
}

/**
 * reset()
 */
function reset() {
  if ($(this).attr("id") === "reset") {
    TOPICS = defaultTopics.slice(0);
    FavoriteTopics = [];
  }

  renderButtons();
  $("#all-gifs-view").empty();
  return;
}


/**
 * deparam
 */
deparam = function (querystring) {
  // remove any preceding url and split
  querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
  var params = {},
    pair, d = decodeURIComponent,
    i;
  // march and parse
  for (i = querystring.length; i > 0;) {
    pair = querystring[--i].split('=');
    params[d(pair[0])] = d(pair[1]);
  }

  return params;
};

/**===============[ 2. Document Ready ]==================== 
 * NOTE: $(function(){ === $(document).ready(function() {
 * it's the shorthand version of document ready. 
 *********************************************************/
$(function () {
  // 2.1 Render Buttons on ready
  renderButtons();

  // 2.2 Set Up Clickable elements
  // 2.2.1 Add gif Button
  $('#add-topic').on('click', function (e) {
    e.preventDefault();

    var topic = $('#search-input').val().trim();
    $('#search-input').val("");

    var favorite = parseInt($("#favorite").data('toggled'));
    if (favorite === 1) {
      if (FavoriteTopics.indexOf(topic) === -1) {
        FavoriteTopics.push(topic);
      }
      $("#favorite").click();
    } else {
      if (TOPICS.indexOf(topic) === -1) {
        TOPICS.push(topic);
      }
    }

    renderButtons();
  });

  // 2.2.2 Reset and Clear on click buttons
  $('#reset').on('click', reset);
  $('#clear').on('click', reset);

  // 2.2.3 Search gifs on click
  $('#button-section').on('click', '.gif.btn', function () {
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
      case "gif":
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

  // 2.2.4 Toggle Rating CSS
  $("#gif-search-form .form-check-input[type=radio]").click(function () {
    var Toggled = parseInt($(this).data('toggled'));

    if (Toggled === 0) {
      $(this).data('toggled', 1);
      $(".form-check-label").css({
        'color': '#F0F5F9',
        'font-weight': 'normal'
      });
      $(this).next().css({
        'color': '#0092CA',
        'font-weight': 'bold'
      });
    } else {
      $(this).data('toggled', 0);
      $(this).next().css({
        'color': '#F0F5F9',
        'font-weight': 'normal'
      });
    }

  });

  // 2.2.5 Toggle Favorite Topic
  $("#favorite").click(function (e) {
    e.preventDefault();

    var Toggled = parseInt($(this).data('toggled'));
    var unfavorite = $("<i>").addClass("far fa-star");
    var favorite = $("<i>").addClass("fas fa-star");

    if (Toggled === 0) {
      $(this).data('toggled', 1);
      $(this).html("");
      $(this).append(favorite, " Favorite");
      $(this).removeClass("btn-primary");
      $(this).addClass("btn-dark");
    } else {
      $(this).data('toggled', 0);
      $(this).html("");
      $(this).append(unfavorite, " Favorite");
      $(this).removeClass("btn-dark");
      $(this).addClass("btn-primary");
    }

  });

  // 2.2.6 Toggle Animated gif
  $('#all-gifs-view').on('click', '.gif.card-img-top', function () {
    var state = $(this).attr('data-state');

    if (state === "still") {
      $(this).attr("src", $(this).attr("data-animated"));
      $(this).attr("data-state", "animate");
    } else {
      $(this).attr("src", $(this).attr("data-still"));
      $(this).attr("data-state", "still");
    }
  });

  // 2.2.7 Get movie plot on click
  $('#all-gifs-view').on('click', '.movie.card-img-top', function () {
    var imdbID = $(this).data("id");
    moviePlot(imdbID);
  });

  // 2.2.8 Search Type on Change Show Different Parameters
  $("#search-type").change(function () {
    var searchType = $(this).children("option:selected").val();

    switch (searchType) {
      case "gif":
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