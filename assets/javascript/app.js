/*********************************************************
 * GifTastic JS
 * @package GifTastic
 * @author Christopher Collins
 * @version 2.4.2
 * @license none (public domain)
 * 
 * ===============[ TABLE OF CONTENTS ]===================
 * 0. Globals
 * 1. Functions
 *   1.1 searchGiphy()
 *   1.2 movieSearch()
 *   1.3 moviePlot()
 *   1.4 bandsInTown()
 *   1.5 updatePage()
 *   1.6 renderButtons()
 *   1.7 reset()
 *   1.8 deparam
 *   1.9 formatDate
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
 *     2.2.8 Get artist upcoming events on click
 *     2.2.9 Search Type on Change Show Different Parameters
 * 
 *********************************************************/
/* ===============[ 0. GLOBALS ]=========================*/
var defaultTopics = ["games", "movies", "music", "pokemon", "cartoons", "batman", "sports", "football"];
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
    if (lastQuery !== undefined && lastQuery.split("/").indexOf("api.giphy.com") !== -1) {
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
  // console.log("-----------[ Search Giphy ]------------------------");
  // console.log(queryURL);
  // console.log("---------------------------------------------------");
  lastQuery = queryURL;

  // Search GIPHY API
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(updatePage);
  return;
} // END searchGiphy

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
  } else if (lastQuery !== undefined && lastQuery.split("/").indexOf("www.omdbapi.com") !== -1) {
    queryURL = lastQuery;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(updatePage);

    return;
  } else { return; }

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
  // console.log("---------------[ movieSearch ]-------------------");
  // console.log(queryURL);
  // console.log("-------------------------------------------------");
  lastQuery = queryURL;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(updatePage);
  return;
} // movieSearch

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
  // console.log("-------------[ moviePlot ]-----------------------");
  // console.log(queryURL);
  // console.log("-------------------------------------------------");
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
} // END moviePlot

/**
 * 1.4 bandsInTown
 * Looks up information or events about artist.
 * @param {string} artistName 
 * @param {string} response - can be 'info' or 'events'
 */
function bandsInTown(artistName, response = "info") {
  var APPID = "d53820ee5d2ba59f79645ee08586b438";

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://rest.bandsintown.com/artists/";
  var queryParams = {};
  queryParams.app_id = APPID;

  if (artistName !== undefined && artistName !== "") {
    artistName = encodeURI(artistName.toLowerCase().trim());
    queryURL += artistName;

    if (response === "events") {
      queryURL += "/events?";
    } else {
      queryURL += "?";
    }

  } else if (lastQuery !== undefined && lastQuery.split("/").indexOf("rest.bandsintown.com") !== -1) {
    queryURL = lastQuery;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(updatePage);
    return;

  } else { return; }

  // Combine queryURL with queryParams
  queryURL = queryURL + $.param(queryParams);
  // console.log("--------------[ bandsInTown ]--------------------");
  // console.log(queryURL);
  // console.log("-------------------------------------------------");
  lastQuery = queryURL;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(updatePage);

  return;
} // END bandsInTown

/**
 * 1.5 updatePage
 * This can accept JSON response form api.giphy.com or www.omdbapi.com.
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

    // reverse loop so most recent content shows up first when we do prepend
    for (var i = Data.length - 1; i >= 0; i--) {
      if (i < Data.length - 2 && Data[i].id === Data[i + 1].id) {
        continue; // prevents doubles from showing up
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

  } else if (lastQuery.split("/").indexOf("rest.bandsintown.com") !== -1) {
    // detect empty response
    if (response === "") { alert("band not found!"); return; }

    if (lastQuery.split("/").pop().includes("events")) {

      if (response.length > 0) {
        var artistID = response[0].artist_id;
        var eventsTableBody = $("<tbody>");

        var nextFive = (response.length > 5) ? 5 : response.length;
        for (var i = 0; i < nextFive; i++) {
          var eventsRow = $("<tr>");

          // COLUMN 1
          var eventDate = $("<strong>").text(formatDate(response[i].datetime,"long",false));
          var venueName = $("<p>").text(response[i].venue.name);
          eventDate = $("<td>").append(eventDate, venueName);

          // COLUMN 2
          var venueLocation = $("<td>").attr("data-lat", response[i].venue.latitude).attr("data-long", response[i].venue.longitude).text(response[i].venue.city + ", " + response[i].venue.country);

          // COLUMN 3
          var availableTickets = $("<td>");
          if (response[i].offers.length > 0) {
            for (var j = 0; j < response[i].offers.length; j++) {
              var tickets = $("<button>").addClass("btn btn-secondary btn-sm").attr("onclick", "window.open('" + response[i].offers[j].url + "','_blank')").text(response[i].offers[j].type);
              availableTickets.append(tickets);
            }
          } // END availableTickets loop

          eventsRow.append(eventDate, venueLocation, availableTickets);
          eventsTableBody.append(eventsRow);
        } // END response for loop

        eventsTableHead = $("<th>").addClass("text-center").attr("colspan", 3).text("Tour Dates");
        eventsTableHead = $("<tr>").append(eventsTableHead);
        eventsTableHead = $("<thead>").append(eventsTableHead);

        var eventsTable = $("<table>").addClass("table table-sm table-dark").append(eventsTableHead, eventsTableBody);
        $("#" + artistID).closest('.card').find('.card-text').empty();
        $("#" + artistID).closest('.card').find('.card-text').append(eventsTable);

      } // END if(response.length > 0 ){
      return;
    } // END band events table

    var artistImage = $("<img>").addClass("card-img-top band").attr("id", response.id).attr("data-id", response.id).attr("src", response.thumb_url).attr("alt", response.name);
    artistName = $("<a>").attr("href", response.url).attr("target", "_blank").append(artistName);
    var artistName = $("<h5>").addClass("card-title").text(response.name);
    var fansTracking = $("<h6>").addClass("card-subtitle mb-2 text-muted").text(response.tracker_count + " fans tracking this artist");
    var upcomingEventCount = $("<p>").addClass("card-text font-weight-bold").text(response.upcoming_event_count + " upcoming events");

    var card_body = $("<div>").addClass("card-body text-center").append(artistName, fansTracking, upcomingEventCount);
    var ARTIST = $("<div>").addClass("card col-lg-6 col-sm-12").append(artistImage, card_body);
    resultsDiv.prepend(ARTIST);
  } // END all possible api response results 

  return;
} // END updatePage

/**
 * 1.6 renderButtons
 * Renders buttons from both FavoriteTopics array and TOPICS array. 
 * FavoriteTopics array is saved to localStorage to persist the data. 
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
} // END renderButtons

/**
 * 1.7 reset()
 * If trigger from #reset id then both TOPICS and FavoriteTopics arrays will be reset. 
 * Otherwise only the gif cards will be removed from the page. 
 */
function reset() {
  var searchType = $("#search-type").children("option:selected").val();

  if ($(this).attr("id") === "reset") {
    TOPICS = defaultTopics.slice(0);
    FavoriteTopics = [];
  }

  renderButtons();
  $("#all-gifs-view").empty();

  // revert back to what the user had selected.
  setTimeout(function () {
    $("#search-type").val(searchType);
  }, 150);
  return;
} // END reset()

/**
 * 1.8 deparam
 * returns the reverse of $.param
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
}; // END deparam

/**
 * 1.9 formatDate
 * @param {string} datetime
 * @param {string} format - long or short
 * @return {string} formatedDate
 */
formatDate = function(unformatedDate, format="long", time=true){
  const monthNamesLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

  var unformatedDate = new Date(unformatedDate);
  var day = unformatedDate.getDate();
  var month = (format === "long") ? monthNamesLong[unformatedDate.getMonth()] : monthNamesShort[unformatedDate.getMonth()];
  var year = unformatedDate.getFullYear();

  var hours = unformatedDate.getHours();
  var ampm = "AM";
  if( hours > 12 ){ hours -= 12; ampm = "PM"; }
  
  var minutes = unformatedDate.getMinutes();
  if(minutes < 10 ){ minutes = "0" + minutes; }
  
  var formatedDate = (format === "long") ? month + " " + day + ", " + year : month + "/" + day + "/" + year;

  if(time){
    formatedDate += " [" + hours + ":" + minutes + " " + ampm + "]";
  }

  return formatedDate;
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

      case "band":
        bandsInTown(searchTerm);

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

  // 2.2.8 Get artist upcoming events on click
  $('#all-gifs-view').on('click', '.band.card-img-top', function () {
    var artist = $(this).attr("alt");
    bandsInTown(artist, "events");
  });

  // 2.2.9 Search Type on Change Show Different Parameters
  $("#search-type").change(function () {
    var searchType = $(this).children("option:selected").val();

    switch (searchType) {
      case "gif":
        $("#movie-search-form").slideUp("slow");
        $(".navbar-brand").slideDown(1000);
        $("#gif-search-form").slideDown();
        break;

      case "movie":
        $("#gif-search-form").slideUp("slow");
        $(".navbar-brand").slideDown(1000);
        $("#movie-search-form").slideDown();
        break;

      case "band":
        $("#gif-search-form").slideUp();
        $("#movie-search-form").slideUp();
        $(".navbar-brand").slideUp();
        break;

      default:
        $("#movie-search-form").slideUp("slow");
        $(".navbar-brand").slideDown(1000);
        $("#gif-search-form").slideDown();
        break;
    }
  }).change(); // Trigger initial change on page load.

}); // END $(document).ready(function())