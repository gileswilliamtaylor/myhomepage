var app, 
  categoryListHeight, 
  clearFilterHeight, 
  movies, 
  fourCategories = {
    genre: {name: "genre", arr: [], chosenArr: []},
    director: {name: "director", arr: [], chosenArr: []},
    country: {name: "country", arr: [], chosenArr: []},
    year: {name: "year", arr: [], chosenArr: []}
  };

document.addEventListener("DOMContentLoaded", function() {
  app = document.getElementById("app");
  appendElements();
  getDVDsAndBluRays();
});

// Appends header, refine menu, main, search info, and movie list to app.
function appendElements() {
  // Declare elements
  var loadingPage = document.createElement("div"),
    loader = document.createElement("div"), 
    header = document.createElement("header"),
    h1 = document.createElement("h1"),
    refine = document.createElement("button"),
    refineMenu = document.createElement("div"),
    main = document.createElement("main"),
    searchInfo = document.createElement("div"),
    movieList = document.createElement("ul");
    
  // Set attributes
  loadingPage.id = "loading-page";
  loadingPage.className = "loading";
  loader.className = "loader"; 
  refine.id = "refine";
  refine.className = "refine";
  refineMenu.id = "refine-menu";
  refineMenu.className = "refine-menu"
  main.id = "main";
  searchInfo.id = "search-info";
  searchInfo.className = "search-info";
  movieList.id = "movie-list";
  movieList.className = "movie-list";

  // Set innerHTML
  h1.innerHTML = "Movie Finder";
  refine.innerHTML = "refine";
  
  // Build app
  app.appendChild(loadingPage);
  loadingPage.appendChild(loader);
  app.appendChild(header);
  header.appendChild(h1);
  header.appendChild(refine);
  app.appendChild(refineMenu);
  app.appendChild(main);
  main.appendChild(searchInfo);
  main.appendChild(movieList);
  
  if (window.innerWidth < 768) {
    // Hides refine menu
    refineMenu.classList.add("menu-hidden");
  }
  
  buildRefineMenu(refineMenu);
  setRefineMenu();
  refineButton(refine, refineMenu);
}

// Builds refine menu from fourCategories
function buildRefineMenu(refineMenu) {
  // Declare variables
  var key, 
    name, 
    catgeoryContainer,
    categoryHeading,
    filterCount,
    categorySubcontainer,
    clearFilter,
    categoryList;
    
  for (key in fourCategories) {
    if (fourCategories.hasOwnProperty(key)) {
      name = fourCategories[key].name;
      
      // Create elements in refine menu for each of the four categories
      categoryContainer = document.createElement("div");
      categoryHeading = document.createElement("div");
      filterCount = document.createElement("span");
      categorySubcontainer = document.createElement("div");
      clearFilter = document.createElement("div");
      categoryList = document.createElement("ul");
      
      // Set attributes
      categoryContainer.className = "category-container";
      categoryContainer.id = name + "-container";
      categoryHeading.className = "category-heading";
      categoryHeading.id = name + "-heading";
      filterCount.className = "filter-count";
      filterCount.id = name + "-filter-count";
      categorySubcontainer.className = "category-subcontainer";
      categorySubcontainer.id = name + "-subcontainer";
      clearFilter.className = "clear-filter";
      clearFilter.id = name + "-clear-filter";
      categoryList.className = "category-ul";
      categoryList.id = name + "-ul";
      
      // Set innerHTML
      categoryHeading.innerHTML = name;
      clearFilter.innerHTML = "Clear Filter";
      
      // Build refine menu
      refineMenu.appendChild(categoryContainer);
      categoryContainer.appendChild(categoryHeading);
      categoryHeading.appendChild(filterCount);
      categoryContainer.appendChild(categorySubcontainer);
      categorySubcontainer.appendChild(clearFilter);
      categorySubcontainer.appendChild(categoryList);
    }
  }
}

// Sets height of refine menu and elements (using window.innerHeight rather than 100vh, allowing for mobile apps)
function setRefineMenu() {
  // Set variables and get nodeLists
  var refine = document.getElementById("refine"),
    refineMenu = document.getElementById("refine-menu"),
    i,
    categorySubcontainers = document.querySelectorAll(".category-subcontainer"),
    clearFilters = document.querySelectorAll(".clear-filter"),
    categoryLists = document.querySelectorAll(".category-ul"),
    // Store window.innerHeight and empty "height" variable
    innerHeight = window.innerHeight,
    innerWidth = window.innerWidth;
  
  if (window.innerWidth < 768) {
    // Sets heights so refine menu fills mobile screen.
    refineMenu.style.height = innerHeight - 130 + "px";
    // Sets height of subcategories (only one subcategory can be viewed at a time on mobile) 
    categoryListHeight = innerHeight - 330 + "px";
    // Sets height for any open clear filter div
    clearFilterHeight = 50 + "px";
    for (i = 0; i < categorySubcontainers.length; i++) {
      // Hide all subcategories
      if (categorySubcontainers[i].style.height === "" || categorySubcontainers[i].style.height === "0px") {
        categorySubcontainers[i].style.height = 0;
      } else { 
        categorySubcontainers[i].style.height = categoryListHeight;
      }
      // maxHeight to enable scrolling inside div
      categoryLists[i].style.maxHeight = categoryListHeight;
    }
    

  } else {
    categoryListHeight = (innerHeight - 80) / categorySubcontainers.length - 30;
    clearFilterHeight = 25 + "px";
    // Menu should always be visible on non-mobile screen
    if (refineMenu && refineMenu.classList.contains("menu-hidden"))
      refineMenu.classList.remove("menu-hidden");
    // Enable scrolling (when window is resized)
    if (document.body.classList.contains("frozen"))
      document.body.classList.remove("frozen");
    // Sets height of subcategories, with all four categories visible at all times
    for (i = 0; i < categorySubcontainers.length; i++) {
      categorySubcontainers[i].style.height = categoryListHeight + "px";
      categorySubcontainers[i].style.display = "inherit";
      categoryLists[i].style.maxHeight = categoryListHeight + "px";
    }
  }
}

// AJAX request to movies.json, containing titles and years
function getDVDsAndBluRays() {
  var xmlhttp = new XMLHttpRequest(),
    url = "movies.json";

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      // Shuffles the parsed list
      var i,
        myMovies = shuffle(JSON.parse(xmlhttp.responseText)),
        myMoviesTitle,
        myMoviesYear;
      
      for (i = 0; i < myMovies.length; i++) {
        myMoviesTitle = myMovies[i].title.toLowerCase().split(" ").join("+");
        myMoviesYear = myMovies[i].year;
        // Third parameter sends boolean to identify last movie in list
        getMovieInfo(myMoviesTitle, myMoviesYear, i, myMovies.length, i === myMovies.length - 1);
        
      }
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

// Fisher-Yates shuffles the movie list
function shuffle(myMovies) {
  var currentIndex = myMovies.length,
    temporaryValue, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = myMovies[currentIndex];
    myMovies[currentIndex] = myMovies[randomIndex];
    myMovies[randomIndex] = temporaryValue;
  }
  return myMovies;
}

// Gets movie info from omdbapi.com (info lifted from IMDb)
function getMovieInfo(myMoviesTitle, myMoviesYear, i, length, isLast) {
  var xmlhttp = new XMLHttpRequest(),
    // myMoviesTitle and myMoviesYear can be empty
    url = "http://www.omdbapi.com/?i&t=" + myMoviesTitle + "&y=" + myMoviesYear + "&plot=short&r=json";

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      var movieInfo = JSON.parse(xmlhttp.responseText);
      // Movies not recognised by omdbapi.com throw error
      if (!movieInfo.Error) { 
        // Initiate movie list build. Store genres, dirs, countries, and years in temp variable for setFilters function
        makeMovieList(myMoviesTitle, movieInfo);
        fourCategories.genre.temp = movieInfo.Genre;
        fourCategories.director.temp = movieInfo.Director;
        fourCategories.country.temp = movieInfo.Country;
        fourCategories.year.temp = movieInfo.Year;
        setFilters();
      }

      if (isLast) {
        /* When the last film is called sets the var 'movies', populates
        the refine menu, enables clicking, and sets the inital state for
        the search-info div.*/
        movies = document.getElementsByClassName("movie");
        populateRefineMenu();
        updateSearchInfo();
        removeLoadingPage();
      }
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

// Update movie list with movies
function makeMovieList(myMoviesTitle, movieInfo) {
  // Declare elements and get movieList
  var movie = document.createElement("li"), // li containing individual movies
    thumbnailContainer = document.createElement("div"),
    thumbnail = document.createElement("img"), 
    info = document.createElement("div"), // contains all info
    title = document.createElement("h2"),
    plot = document.createElement("p"),
    details = document.createElement("div"), // contains details
    director = document.createElement("span"),
    country = document.createElement("span"),
    year = document.createElement("span"),
    genre = document.createElement("span"),
    runtime = document.createElement("span"),
    imdbLink = document.createElement("span"),
    imdbA = document.createElement("a"),
    clearFix = document.createElement("div"),
    movieList = document.getElementById("movie-list");
    
  // Set attributes
  movie.className = "movie";
  thumbnailContainer.className = "thumbnail-container";
  thumbnail.className = "thumbnail";
  info.className = "info";
  title.className = "title";
  plot.className = "plot";
  details.className = "details";
  director.className = "director";
  country.className = "country";
  year.className = "year";
  genre.className = "genre";
  runtime.className = "runtime";
  imdbLink.className = "imdbLink";
  imdbA.className = "imdbA";
  imdbA.setAttribute("target", "_blank");
  clearFix.className = "clearfix";
  
  // Set innerHTML
  title.innerHTML = movieInfo.Title;
  plot.innerHTML = movieInfo.Plot !== "N/A" ? movieInfo.Plot : "No plot details available";
  director.innerHTML = movieInfo.Director;
  country.innerHTML = movieInfo.Country;
  year.innerHTML = movieInfo.Year;
  genre.innerHTML = movieInfo.Genre;
  runtime.innerHTML = movieInfo.Runtime;
  imdbA.innerHTML = "IMDB Page";
  
  // Set img
  thumbnail.src = "images/" + myMoviesTitle.replace(/\W+/g, "") + ".jpg";
  
  // Set href
  imdbA.href = "https://www.imdb.com/title/" + movieInfo.imdbID;
  
  // build movielist, one li at a time
  movieList.appendChild(movie);
  movie.appendChild(thumbnailContainer);
  movie.appendChild(info);
  movie.appendChild(clearFix);
  thumbnailContainer.appendChild(thumbnail);
  info.appendChild(title);
  info.appendChild(plot);
  info.appendChild(details);
  details.appendChild(director);
  details.appendChild(country);
  details.appendChild(year);
  details.appendChild(genre);
  details.appendChild(runtime);
  details.appendChild(imdbLink);
  imdbLink.appendChild(imdbA);
}

// Sets filter values, rejecting repetition
function setFilters() {
  var key,
    temp,
    i;
  for (key in fourCategories) {
    if (fourCategories.hasOwnProperty(key)) {
      temp = fourCategories[key].temp.trim().split(", ");
      for (i = 0; i < temp.length; i++) {
        if (fourCategories[key].arr.indexOf(temp[i]) === -1)
          fourCategories[key].arr.push(temp[i]);
      }
    }
  }
}

function removeLoadingPage() {
  var loadingPage = loadingPage = document.getElementById("loading-page");
  loadingPage.style.display = "none";
}

// Organises categories by name and populates refine menu ULs
function populateRefineMenu() {
  var key,
    arr,
    name,
    i,
    list,
    listItem;
    
  for (key in fourCategories) {
    if (fourCategories.hasOwnProperty(key)) {
      arr = fourCategories[key].arr;
      name = fourCategories[key].name;
      name === "director" ? sortDirectorsByLastName(arr) : arr.sort();

      for (i = 0; i < arr.length; i++) {
        list = document.getElementById(name + "-ul");
        listItem = document.createElement("li");
        
        listItem.className = "selection " + name + "-selection";
        listItem.innerHTML = arr[i];
        list.appendChild(listItem);
      }
    }
  }
  enableRefineMenu();
}

// Alphabetises director by surname (following rule that surnames are not alphabetised by prefixes)
function sortDirectorsByLastName(arr) {
  arr.sort(function(a, b) {
    return a.split(" ").pop().localeCompare(b.split(" ").pop());
  });
}

// Opens and closes refine menu
function refineButton(refine, refineMenu) {
  refine.addEventListener("click", function() {
    if (refineMenu.classList.contains("menu-hidden")) {
      refineMenu.classList.remove("menu-hidden");
      document.body.classList.add("frozen");
      app.style.height = window.innerHeight + "px";
      //setTimeout(function() {
        //main.style.display = "none";
      //}, 500);
      refine.innerHTML = "Close";
    } else {
      refineMenu.classList.add("menu-hidden");
      document.body.classList.remove("frozen");
      window.scrollTo(0, 0);
      refine.innerHTML = "Refine";
      closeSubcontainers();
    }
  });
}

// Closes open subcontainer when refine menu closes 
function closeSubcontainers() {
  var i,
    categorySubcontainers = document.querySelectorAll(".category-subcontainer");
    
  for (i = 0; i < categorySubcontainers.length; i++) {
    if (categorySubcontainers[i].style.height !== 0)
     categorySubcontainers[i].style.height = 0;
  }
}

// Enables refine menu to function
function enableRefineMenu() {
  var i,
    j,
    k,
    categoryHeadings = document.querySelectorAll(".category-heading"),
    selections = document.querySelectorAll(".selection"),
    clearFilters = document.querySelectorAll(".clear-filter");
  
  for (i = 0; i < categoryHeadings.length; i++) {
    categoryHeadingOnClick(categoryHeadings[i]);
  }
  for (j = 0; j < selections.length; j++) {
    selectionsOnClick(selections[j]);
  }
  
  for (k = 0; k < clearFilters.length; k++) {
    clearFilterOnClick(clearFilters[k]);
  }
}

// Shows and hides category subcontainers on mobile screens
function categoryHeadingOnClick(categoryHeading) {
  categoryHeading.addEventListener("click", function(event) {
    if (window.innerWidth < 768) {
      var i,
        element = event.target,
        name = element.getAttribute("id").replace(/-heading/g, ""),
        subcontainer = document.getElementById(name + "-subcontainer"),
        subs = document.querySelectorAll(".category-subcontainer");
      for (i = 0; i < subs.length; i++) {
        // Accordion
        subcontainer === subs[i] 
          ? subcontainer.style.height === categoryListHeight 
            ? subcontainer.style.height = 0 
            : subcontainer.style.height = categoryListHeight 
          : subs[i].style.height = 0;
      }
    }
  });
}

// Identifies selection
function selectionsOnClick(selection) {
  selection.addEventListener("click", function(event) {
    var element = event.target,
      keyword = element.innerHTML,
      key,
      name,
      arr,
      chosenArr,
      i;
    for (key in fourCategories) {
      if (fourCategories.hasOwnProperty(key)) {
        name = fourCategories[key].name;
        arr = fourCategories[key].arr;
        chosenArr = fourCategories[key].chosenArr;
        // Toggle selection's presence in chosenArr
        if (arr.indexOf(keyword) !== -1) {
          i = chosenArr.indexOf(keyword);
          i === -1 ? chosenArr.push(keyword): chosenArr.splice(i, 1);
          selection.classList.toggle("selected");
          adjustCategoriesHeight(name, chosenArr);
          updateFilterCount(name, chosenArr);
          break; // Category found, break loop
        }
      }
    }
    filterMovies();
  });
}

// Clears filters on specific categories
function clearFilterOnClick(clearFilter) {
  clearFilter.addEventListener("click", function(event) {
    var element = event.target,
      whichFilter = element.getAttribute("id").replace(/-clear-filter/g, ""),
      key,
      name,
      chosenArr,
      selections;
    for (key in fourCategories) {
      if (fourCategories.hasOwnProperty(key)) {
        name = fourCategories[key].name;
        if (whichFilter === name) {
          chosenArr = fourCategories[key].chosenArr;
          selections = document.getElementsByClassName(name + "-selection selected");
          chosenArr.splice(0, chosenArr.length);
          while (selections.length) {
            selections[0].classList.remove("selected");
          }
          adjustCategoriesHeight(name, chosenArr, clearFilter);
          updateFilterCount(name, chosenArr);
          break;
        }
      }
    }
    filterMovies();
  });
}

// Adjusts height for category containers (height decreases when clearFilter is visible)
function adjustCategoriesHeight(name, chosenArr, clearFilter) {
  if (clearFilter !== "undefined") clearFilter = document.getElementById(name + '-clear-filter');
  var categoryList = document.getElementById(name + "-ul");
  
  if (chosenArr.length !== 0) {
    clearFilter.style.height = clearFilterHeight;
    categoryList.style.maxHeight = parseFloat(categoryListHeight) - parseFloat(clearFilterHeight) + "px";
  } else {
    clearFilter.style.height = 0;
    categoryList.style.maxHeight = parseFloat(categoryListHeight) + "px";
  }
}

// Updates filter count for each category (appears in category heading)
function updateFilterCount(name, chosenArr) {
  var filterCount = document.getElementById(name + "-filter-count");
  filterCount.innerHTML = chosenArr.length !== 0 ? "(" + chosenArr.length + ")" : "";
}

// Shows movie only if it matches EVERY selection
function filterMovies() {
  var i,
    key,
    match,
    chosenArr,
    name,
    details;
  for (i = 0; i < movies.length; i++) {
    for (key in fourCategories) {
      if (fourCategories.hasOwnProperty(key)) {
        chosenArr = fourCategories[key].chosenArr;
        name = fourCategories[key].name;
        details = movies[i].querySelector('.' + name).innerHTML;
        match = chosenArr.every(isItAMatch(details));

        if (!match) {
          movies[i].style.display = "none";
          break;
        }
      }
    }
    if (match) movies[i].style.display = "inherit";
  }
  updateSearchInfo();
  updateSideBar();
}

// Checks if the movie is a match based on categories and selections
function isItAMatch(details) {
  return function(element) {
    return details.indexOf(element) !== -1;
  };
}

// Updates text as selections change and search results increase/decrease
function updateSearchInfo() {
  var results = [].slice.call(movies).filter(isItDisplayed),
    genreSelection = fourCategories.genre.chosenArr,
    directorSelection = fourCategories.director.chosenArr,
    countrySelection = fourCategories.country.chosenArr,
    yearSelection = fourCategories.year.chosenArr,
    genreResults = genreSelection.length ? genreSelection.map(function(value) {
      return value.toLowerCase();
    }).sort().join("-") + " " : "",
    directorResults = directorSelection.length ? " by " + commaAnd(directorSelection) : "",
    countryResults = countrySelection.length ? " from " + commaAnd(countrySelection) : "",
    yearResults = yearSelection.length ? " made in " + commaAnd(yearSelection) : "",
    searchInfo = document.getElementById("search-info");

  searchInfo.innerHTML = "Showing " +
    results.length + " " +
    genreResults +
    (results.length === 1 ? "film " : "films ") +
    directorResults +
    countryResults +
    yearResults;
}

// Combines arrays, inserting commas and conjunction (avoiding Oxford commas)
function commaAnd(arr) {
  arr.sort();
  switch (arr.length) {
    case 1:
      return arr.toString();
    case 2:
      return arr.join(" and ");
    default:
      var str = arr.join(", "),
        n = str.lastIndexOf(",");
      str = str.slice(0, n) + str.slice(n, str.length).replace(",", " and");
      return str;
  }
}

// Identifies which filters will still provide a positive number of results
function updateSideBar() {
  var key,
    myNodeList,
    everyPossibleSelection,
    sidebarElements,
    i,
    option;
  for (key in fourCategories) {
    if (fourCategories.hasOwnProperty(key)) {
      // Find every genre, director, country, and year
      everyPossibleSelection = document.querySelectorAll("." + fourCategories[key].name);
      // See what selections are available
      availableSelections = 
        // Create new array, iterate through NodeList, filter for displayed movies only, flatten, and remove repetition.
        [].slice.call(everyPossibleSelection)
          .filter(isItDisplayed)
            .map(fetchInnerHTML)
              .join(", ")
                .split(", ")
                  .filter(noRepetition);
    }
    sidebarElements = document.querySelectorAll("." + fourCategories[key].name + '-selection');
    for (i = 0; i < sidebarElements.length; i++) {
      option = sidebarElements[i].innerHTML;
      availableSelections.indexOf(option) === -1 
        ? sidebarElements[i].classList.add("unselectable") 
        : sidebarElements[i].classList.remove("unselectable");
    }
  }
}

// Checks to see if element is displayed on screen
function isItDisplayed(element) {
  return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
}

// Replaces element with its innerHTML
function fetchInnerHTML(element) {
  return element.innerHTML;
}

// Checks for repetition in array
function noRepetition(item, position, element) {
  return element.indexOf(item) === position;
}

// Resets refine menu
window.addEventListener("resize", function() {
  setRefineMenu();

  // Closes refine menu categories for mobile display, only if more than one is open
  if (window.innerWidth < 768) {
    var i,
      categorySubcontainers = document.querySelectorAll(".category-subcontainer"),
      noOfCategorySubcontainersOpen = 0,
      refineMenu = document.getElementById("refine-menu"),
      key,
      name,
      chosenArr;
      
    for (i = 0; i < categorySubcontainers.length; i++) {
      if (categorySubcontainers[i].style.height !== "0px") {
        noOfCategorySubcontainersOpen += 1;
        if (noOfCategorySubcontainersOpen === 2) {
          closeSubcontainers();

          refineMenu.classList.add("menu-hidden");
          return;
        }
      }
    }
  }

  for (key in fourCategories) {
    if (fourCategories.hasOwnProperty(key)) {
      name = fourCategories[key].name,
      chosenArr = fourCategories[key].chosenArr;
      adjustCategoriesHeight(name, chosenArr);
    }
  }
});