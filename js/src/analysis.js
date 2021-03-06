$(document).ready(function() {

  // Wire up the search button, so that when enter is hit that it executes
  $("#txt_name").keyup(function(event){
      if(event.keyCode == 13){
          $("#search_button").click();
      }
  });


  populate_list_of_executes();
});




function draw_chart(search_title, start_date_ms, data_list){
        if (typeof $('#container').highcharts() != 'undefined') {
          $('#container').highcharts().destroy()
        }

        var chartTitle = 'Time spent in selected windows: ' + search_title + '.'

        $('#container').highcharts({
            chart: {
                zoomType: 'x',
                spacingRight: 20
            },
            title: {
                text: chartTitle
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' :
                    'Drag your finger over the plot to zoom in'
            },
            xAxis: {
                type: 'datetime',
                maxZoom: 14 * 24 * 3600000, // fourteen days
                title: {
                    text: null
                }
            },
            yAxis: {
                title: {
                    text: 'Minutes'
                }
            },
            tooltip: {
                shared: true
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: true
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
    
            series: [{
                type: 'area',
                name: 'Minutes',
                pointInterval: 24 * 3600 * 1000, // 1 day * hr/day * sec/hr * ms/sec 
                pointStart: start_date_ms,
                data: data_list
            }]
        });
    };


function draw_pie_chart(data_list){
  if (typeof $('#pie_container').highcharts() != 'undefined') {
    $('#pie_container').highcharts().destroy()
  }

  $('#pie_container').highcharts({
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
      },
      title: {
          text: 'Your EXEs listed by most frequently brought into focus'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: true,
                  color: '#000000',
                  connectorColor: '#000000',
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %'
              }
          }
      },
      series: [{
          type: 'pie',
          name: 'A list of your most used EXEs',
          data: data_list
      }]
  });

};



function populate_list_of_executes(){
  
  var exeNames = [];
  watchme_data.forEach(function(item) {
    // Filter out redundant entries naturally
    if(item.exe_name !== ""){
      exeNames.push(item.exe_name.toLowerCase());
    }
  });

  var uniqueNames = [];
  $.each(exeNames, function(i, el){
    if($.inArray(el, uniqueNames) === -1){
      uniqueNames.push(el);
    }
  });


  // var pieChartData = [];

  // $.each(uniqueNames, function(i, el){
  //   var data_point = [];
  //   data_point.push(el);

  //   var size = exeNames.slice(0).sort().indexOf(el);
  //   data_point.push(size);

  //   pieChartData.push(data_point);
  // });

  // draw_pie_chart(pieChartData);


  // Append list items to unordered list
  $.each(uniqueNames, function(i, el){
    $("code ul").append("<li>" + el + "</li>");
  });

};


function searchit_simple() {
  query = document.getElementById('txt_name').value;
  // TODO: input validation!! maybe like this: window_title_tokd = JSON.stringify(item.window_title).replace(/\W/g, ' ')
  var matches = {}; // maps javascript date string to amount of time spent in matching windows on that date
  var start_date = 0; // first date in matches
  var end_date = 0; // last date in matches
  var delta = 0;
  watchme_data.forEach(function(item) {
    query.toLowerCase().split(" ").forEach(function(tok) {
      // if any search token is in the window title for this entry, add this entry to matches
      if( item.window_title.toLowerCase().search(tok) != -1) {
        jdate = new Date(item.date);
        
        // get start and end dates for this entry
        if (start_date == 0) {
          start_date = jdate;
        }
        end_date = jdate; // note: will end up being the date for the last entry that matches
        
        jdate_str = jdate.toString('yyyy-MM-dd');
        
        // cacluate time spent in window for this entry
        delta = item.end_time - item.start_time;
        
        // add time for this entry to matches
        if (jdate_str in matches) {
          matches[jdate_str] = matches[jdate_str] + delta;
        } else {
          matches[jdate_str] = delta;
        }
      }
    })
  });
  
  var values = []
  var i_str = ""
  
  // create a list of dates for HighChart
  // iterate through dates -- for each date, if we have time for date in matches, use it, otherwise set time to zero
  var i = new Date(start_date);
  while(i <= end_date) {
    i_str = i.toString('yyyy-MM-dd');
    if (i_str in matches) {
      values.push(matches[i_str]/60); // convert from seconds to minutes for display
    } else {
      values.push(0);
    }
    i.setDate(i.getDate() + 1)
  }
  
  // finally, draw the chart
  var ms = Date.UTC(start_date.getUTCFullYear(), start_date.getUTCMonth(), start_date.getUTCDate());
  draw_chart(query, ms, values);
}
