"use strict";

//=========== HELPER

// selector is CSS selector, time in ms
function waitForElementToDisplay(selector, time, callback) {
  if (document.querySelector(selector) != null) {
    console.info("selector found");
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


function prettyPrintPoint(points) {
  // console.info("pretty start");
  var s = "";
  var hour = 4;
  var min = 40;
  // console.info("arr len", points.length);
  for(var i=0; i < points.length && hour < 24; ) {
    min = min + 20;
    if (min == 60) {
      min = 0;
      hour = hour + 1;
    }

    var tmps = hour+":"+min;

    var t = new Date(points[i].time);
    var offset = 0-(t.getTimezoneOffset()/60);
    // console.info("heh");

    var th = t.getHours() + (7-offset);
    var tm = Math.floor(t.getMinutes()/20)*20;
    // console.info("point", "loop", i);
    // console.info(th, tm, hour, min, i);
    // console.info(th==hour, tm==min);
    if (hour === th && tm === min) {
      tmps = th+":"+t.getMinutes()+","+tmps;
      for (var j = 0; j < points[i].pts.length; ++j) {
        tmps = tmps + ","+points[i].pts[j];
      }
      i++;
      tmps += "\n";
    }
    else {
      tmps = "-," + tmps + ",-,-,-,-\n";
    }
    s += tmps;
  }
  // console.info("pretty end");
  return s;
}

//=========== MAIN
function hashChanged() {
  var bookmakerHash = "#event/teamraid021/bookmaker";
  var hash = "";

  // set the hash to present hash
  hash = location.hash;
  console.info("found hash: "+location.hash);  

  // jalankan kode jika ada di halaman bookmaker
  if (hash == bookmakerHash) {
    // tunggu sampai halamannya ketemu
    console.info("waiting");
    waitForElementToDisplay(".point", 1000, updatePoints); 

    function waitRefresh() {
      var now = new Date();
      var h = (now.getUTCHours()+7)%24;
      if (h < 5 || h > 22) {
        console.info("wait refresh until ", h, now.getMinutes() + 5);
        setTimeout(function() {
          waitRefresh();
        }, 5*60*1000);
      }
      else {
        console.info("Reload page at ", h, now.getMinutes() + 10);
        setTimeout(function() {location.reload();}, 10*60000);
      }
    };
    waitRefresh();
    // setTimeout(function() {location.reload();}, 10*60000);
  }
  else {
    var loc = location.origin+"/#event/teamraid021/bookmaker";
    console.info("redirect to", loc, "in 1 minute");
    setTimeout(function () {
      console.info("redirect to", loc, "in 1 minute");
      location.assign(loc);
    }, 60*1000);
  }
}

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
      console.info(points);
      // console.info(points[0]);
      // console.info(points[0].time);
      // var ps = points.map(function(obj) { var t = new Date(obj.time); return (t.getHours() + ":" + t.getMinutes() + "," + obj.pts.join()); }).join("\n");
      console.info("New points saved at : ", new Date());
    });

  };

function cleanPoints(points) {
  console.info("start cleaning", points);
  var cleanedPoints = [];
  var j = 0;
  var lastPts;
  for (var i=0; i < points.length; ++i) {
    // remove incomplete data
    // console.info("pts",i, points[i].pts);
    if (points[i].pts == null || points[i].pts == undefined || points[i].pts.length < 4) {
      // console.info("JELEEEK");
    }
    else {
      // check if the points is the same as the point s before
      if (lastPts != null || lastPts != undefined) {
        // console.info("ADA?");
        var tn = new Date(points[i].time);
        var tl = new Date(lastPts.time);
        // console.info("HEY", tn.getHours(), tl.getHours());
        // console.info("HEY", Math.floor(tn.getMinutes()/20), Math.floor(tl.getMinutes()/20));
        if(tn.getHours() == tl.getHours() && Math.floor(tn.getMinutes()/20) == Math.floor(tl.getMinutes()/20)) {
          // console.info("SAMAAMAMA", tn, tl);
        }
        else {
          if (tn.getHours() >=5 || tn.getHours() <=22) {
            cleanedPoints.push(points[i]);
            lastPts = points[i];
          }
        }
      }
      else {
        var tn = new Date(points[i].time);
        if (tn.getHours() >=5 || tn.getHours() <=22) {
          cleanedPoints.push(points[i]);
          lastPts = points[i];
        }
      }
    }
  }

  return cleanedPoints;
};

function processPoints(points) {
  points = points.points;
  console.info("points read from storage", points);

  var newPoint = {
    time: Date.now(),
    pts: Array.prototype.slice.call(document.querySelectorAll(".point")).map(function(obj) {return obj.innerHTML;})
  }
  console.info("points now!!", newPoint.pts);

  var haveNew = false;
  var h = (new Date().getUTCHours() + 7)%24;
  if(points == undefined) {
    points = [];
    if(newPoint.pts.length == 4 && h >= 5 && h <= 22) {
      haveNew = true;
      points.push(newPoint);
    }
  }
  else {
    points = cleanPoints(points);

    var lastPoint = points[points.length - 1];
    // if the last point saved not equals to point now, save it
    var same = true;
    for(var i = 0; i < lastPoint.pts.length; i++) {
      same = same && (lastPoint.pts[i] == newPoint.pts[i]);
    }
    // console.info("is Same ", same);
    if (!same) {
      if(newPoint.pts.length == 4 && h >= 5 && h <= 22) {
        haveNew = true;
        points.push(newPoint);
      }
    }
  }
  var ps = prettyPrintPoint(points);
  console.info("UTC+7,N,W,E,S\n"+ ps);
  if (haveNew) savePoints(points);
};


function updatePoints() {
  
  var t = new Date();
  var h = (t.getUTCHours() + 7)%24;
  var m = t.getMinutes();
  // if (h >=5 && h <=22 ) {
    readPoints(processPoints);
  // }
}

console.info("hash: "+location.hash);  
//register the event when hash location is changed
window.onhashchange = hashChanged;
// window.onload = function() {
//   console.info("onload");
//   hashChanged();
// };

hashChanged();