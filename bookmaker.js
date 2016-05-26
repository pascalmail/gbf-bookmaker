// selector is CSS selector, time in ms
function waitForElementToDisplay(selector, time, callback) {
  if (document.querySelector(selector) != null) {
    // console.info("selector found");
    callback();
    return;
  }
  else {
    // console.info("selector not found");
    setTimeout(function() {
      waitForElementToDisplay(selector, time, callback);
    }, time);
  }
};

function hashChanged() {
  var bookmakerHash = "#event/teamraid021/bookmaker";
  var hash = "";

  // set the hash to present hash
  hash = location.hash;
  console.info("hash: "+location.hash);  

  // jalankan kode jika ada di halaman bookmaker
  if (hash == bookmakerHash) {
    // tunggu sampai halamannya ketemu
    console.info("waiting");
    waitForElementToDisplay(".point", 1000, updatePoints); 
    setTimeout(function() {location.reload();}, 5*60000);
  }
}

function prettyPrintPoint(points) {
  var s = "";
  var hour = 4;
  var min = 40;
  for(i=0; i < points.length;) {
    min = min + 20;
    if (min == 60) {
      min = 0;
      hour = hour + 1;
    }
    s = s + hour+":"+min;

    var t = new Date(points[i].time);
    var offset = 0-(t.getTimezoneOffset()/60);

    var th = t.getHours() + (7-offset);
    var tm = Math.floor(t.getMinutes()/20)*20;
    if (th == hour && tm == min) {
      for (j = 0; j < points[i].pts.length; ++j) {
        s = s + ","+points[i].pts[j];
      }
      i++;
    }
    else {
      s = s + ",-,-,-,-";
    }
    s += "\n"
  }
  return s;
}

function updatePoints() {
  function readPoints(callback) {
    chrome.storage.local.get("points", callback);
  };

  function deletePoints() {
   chrome.storage.local.remove("points", function() {
    console.info("Old points deleted");
   }); 
  };

  function savePoints(points) {
    chrome.storage.local.set({"points": points}, function() {
      console.info("New points saved");
      // console.info(points);
      // console.info(points[0]);
      // console.info(points[0].time);
      // var ps = points.map(function(obj) { var t = new Date(obj.time); return (t.getHours() + ":" + t.getMinutes() + "," + obj.pts.join()); }).join("\n");
      var ps = prettyPrintPoint(points);
      console.info("UTC+7,N,W,E,S\n"+ ps);
    });

  };

  function processPoints(points) {
    points = points.points;

    var newPoint = {
      time: Date.now(),
      pts: Array.prototype.slice.call(document.querySelectorAll(".point")).map(function(obj) {return obj.innerHTML;})
    }

    if(points == undefined) {
      points = [];
      points.push(newPoint);
    }
    else {
      var lastPoint = points[points.length - 1];
      // if the last point saved not equals to point now, save it
      var same = true;
      for(i = 0; i < lastPoint.pts.length; i++) {
        same = same && (lastPoint.pts[i] == newPoint.pts[i]);
      }
      // console.info("is Same ", same);
      if (!same) {
        points.push(newPoint);
      }
    }
    savePoints(points);
  };
  // console.info("jalan");
  readPoints(processPoints);
  // deletePoints();
}


//register the event when hash location is changed
window.onhashchange = hashChanged;
window.onload = window.onhashchange;
