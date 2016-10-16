// GLOBAL VARIABLES
var allContentRevealed = false, distanceFromTop, menuOpen, activeNav, stickyNav, sections;


// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', function() {
  menuOpen = false;
  sections = document.querySelectorAll(".section");
  getDistanceFromTop();
});

document.addEventListener("scroll", function() {
  progressReport();
  if (window.innerWidth >= 768 && window.pageYOffset > 65) 
    hideAndRevealNav();
  if (!allContentRevealed) revealContent();
});

document.addEventListener("mousemove", function(e) {
  if (window.innerWidth >= 768 && window.pageYOffset > 25) 
    hideAndRevealNavWithMouse(e);
});

document.addEventListener("mouseover", function(e) {
  var element = e.target;
  if (window.innerWidth >= 768 && (element.classList.contains("project-img") || element.classList.contains("open")) && !element.classList.contains("unselectable")) projectHighlight(element);
});

document.addEventListener("mouseout", function(e) {
  var element = e.target;
  if (window.innerWidth >= 768 && (element.classList.contains("project-img") || element.classList.contains("open")) && !element.classList.contains("unselectable")) projectHighlight(element);
});

document.addEventListener("click", function(e) {
  var element = e.target;
  if (element.classList.contains("anchor-link")) {
    showMenu();
    smoothScroll(findDestination(element));
  } else if (element.classList.contains("nav-button-button")) {
    showMenu();
  } else if (element.classList.contains("external-button")) {
    goExternal(element);
  } else if ((element.classList.contains("project-img") || element.classList.contains("open")) && !element.classList.contains("unselectable")) {
    visitProjects(element);
  }
});

document.addEventListener("touchstart", function(e) {
  var element = e.target;
  if ((element.classList.contains("project-img") || element.classList.contains("open")) && !element.classList.contains("unselectable")) projectHighlight(element);
});

document.addEventListener("touchend", function(e) {
  var element = e.target;
  if ((element.classList.contains("project-img") || element.classList.contains("open")) && !element.classList.contains("unselectable")) projectHighlight(element);
})

// Stores scrollTop to variable when called (used to measure distances scrolled)
function getDistanceFromTop() {
  distanceFromTop = getScrollTop();
}

// Returns scrollTop (cross browser)
function getScrollTop() {
  return (window.scrollTop || document.body.scrollTop || document.documentElement.scrollTop);
}

// Sets width of progress color within progress bar using scrollTop 
function progressReport() {
  var progress = document.getElementById("progress"),
    scrollTop = getScrollTop(),
    fullBody = document.body.offsetHeight - window.innerHeight;
    width = scrollTop / fullBody;
  progress.style.width = 100 * width + "%";
}

// Hides and reveals menu button on scroll down and up
function hideAndRevealNav(instruction) {
  var navigation = document.getElementById("navigation");

  if (getScrollTop() - distanceFromTop > 0 || instruction === "hide") {
    navigation.classList.add("nav-up");
    stickyNav = false;
  } else if (getScrollTop() - distanceFromTop < 0 || instruction === "reveal") {
    navigation.classList.remove("nav-up");
  }
  getDistanceFromTop();
}

// Reveals menu button when mouse nears top of window and hides again when it leaves (overwriting stickyNav)
function hideAndRevealNavWithMouse(e) {
  if (e.pageY <= getScrollTop() + 65) {
    activeNav = true;
    stickyNav = false;
    hideAndRevealNav("reveal");
  } else if (e.pageY > getScrollTop() + 65 && activeNav && !stickyNav && !menuOpen) {
    hideAndRevealNav("hide");
    activeNav = false;
  }
}

// As user scrolls down for first time content is revealed (the added class adjusts opacity and position)
function revealContent() {
  var sections = document.querySelectorAll(".section");
  var top = getScrollTop() + window.innerHeight;
  for (var i = 0; i < sections.length; i++) {
    if (top > sections[i].offsetTop + window.innerHeight/3) {
      var content = sections[i].childNodes;
      for (var j = 0; j < content.length; j++) {
        if (content[j].innerHTML) {
          content[j].classList.add("reveal");
        }
        if (i === sections.length - 1) allContentRevealed = true;
      }
    }
  }
}
 
// When user hovers over either project image or open window image the former fades while the latter increases inside
// Resets on mouseout
function projectHighlight(element) {
  var project = element.parentNode.parentNode.getAttribute("id");
  if (element.classList.contains("project-img")) {
    element.classList.toggle("faded");
    var opens = document.getElementsByClassName("open");
    for (var i = 0; i < opens.length; i++) {
      if (opens[i].parentNode.parentNode.getAttribute("id") == project) {
        opens[i].classList.toggle("bigger");
      }
    }
  } else {
    element.classList.toggle("bigger");
    var projectImgs = document.getElementsByClassName("project-img");
    for (var j = 0; j < projectImgs.length; j++) {
       if (projectImgs[j].parentNode.parentNode.getAttribute("id") == project) {
         projectImgs[j].classList.toggle("faded");
       }
    }
  }
}

// Opens and closes menu, toggles hamburger button appearance, and disables and enables scrolling 
function showMenu() {
  var menu = document.getElementById("menu"),
    navButton = document.getElementById("nav-button");
    menu.classList.toggle("open-menu");
    navButton.classList.toggle("menu-open");
    document.body.classList.toggle("freeze");

  menuOpen = menuOpen == false ? true : false;
}

// Finds distance of section required from top 
function findDestination(element) {
  var value = element.getAttribute("value"),
    destination = (window.innerWidth < 768) 
      ? document.getElementById(value).offsetTop - 55 // Height of progress bar & fixed navbar on mobile
      : document.getElementById(value).offsetTop; 
  
  return destination;
}

// Scrolls smoothly to destination...
function smoothScroll(destination, duration) {
  duration = (typeof duration != "undefined") 
    ?  duration 
    : 500;
  if (duration <= 0) return;
  // ... by finding the distance from scrollTop position to required section...
  var difference = destination - getScrollTop(),
  // ... setting a suitable distance to travel to ensure smoothness...
    perTick = difference / duration * 10,
    milliseconds = window.innerWidth < 768 ? 20 : 10;
  // ..., meanwhile resetting distanceFromTop var for other functions...
  getDistanceFromTop();
  setTimeout(function() {
    // ... identifying where to scroll to...
    var position = getScrollTop() + perTick;
    // and scrolling to it...
    scrollTo(0, position);
    // if we've made it to the section...
    if (window.innerWidth >= 768 && position === destination) {
      // ... hide the navbar...
      hideAndRevealNav("hide");
      // ... and then stop...
      return;
    }
    // ... but otherwise keep going...
    smoothScroll(destination, duration - 10);
  }, milliseconds);
}

// Github and LinkedIn links
function goExternal(element) {
  if (element.getAttribute("id") === "github-button") {
    window.open("https://github.com/gileswilliamtaylor", "_blank");
  } else if (element.getAttribute("id") === "linkedin-button") {
    window.open("https://www.linkedin.com/in/gileswilliamtaylor", "_blank");
  }
}

// Opens project pages
function visitProjects(element) {
  var project = element.parentNode.parentNode.getAttribute("id");
  window.open("/" + project, "_blank");
}