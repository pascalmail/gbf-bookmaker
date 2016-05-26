document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('form').onsubmit = yo;

  var status = document.getElementById('status');
  var stVal = status.getAttribute('value');

  if (stVal == null) {
   status.setAttribute('value', 'enable');
  }

  var table = document.getElementById("table");
  chrome.storage.local.get("points", function(points) {
    points = points.points;
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

