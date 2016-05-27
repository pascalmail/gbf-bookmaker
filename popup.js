
function cleanPoints(points) {
  var cleanedPoints = [];
  var j = 0;
  for (i=0; i < points.length; ++i) {
    if (points[i].pts == null || points[i].pts == undefined || points[i].pts.length < 4) {

    }
    else {
      cleanedPoints.push(points[i]);
    }
  }

  return cleanedPoints;
};

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('form').onsubmit = yo;

  document.getElementById('form2').onsubmit = saveOld;

  var status = document.getElementById('status');
  var stVal = status.getAttribute('value');

  if (stVal == null) {
   status.setAttribute('value', 'enable');
  }

  chrome.storage.local.get("key", function(points) {
    console.info("oldpoints", points);
  });

  var table = document.getElementById("table");
  chrome.storage.local.get("points", function(points) {

    points = points.points;
    // if 
    console.info(points);
    for(i = 0; i < points.length; ++i) {
      var row = table.insertRow();
      var data = row.insertCell();
      var time = new Date(points[i].time);
      data.innerHTML = time.getHours()+":"+time.getMinutes();
      for(j = 0; j < points[i].pts.length; ++j) {
        data = row.insertCell();
        data.innerHTML = points[i].pts[j];
      }
    }
  });

});

function saveOld() {
  chrome.storage.local.get("points", function(points) {
    var t = new Date(points.points[0]);
    var day = t.getDate() + "-" + t.getMonth() + "-" + t.getHours();
    var key = "points-"+day;
    var pts = {};
    pts[key] = points;
    chrome.storage.local.set(pts);
    chrome.storage.local.remove("points");
  });
}

function yo() {
  var status = document.getElementById('status');
  // window.alert("YO");
  if (status.getAttribute('value') == "enable") {
    console.info("SAMA");
  }
  else {
   console.info("BEDA"); 
  }
  window.alert("YO");
}

