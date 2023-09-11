// ==UserScript==
// @name         Clyde STN
// @namespace    http://stnpdapp.rail.nsw.gov.au:5555/stn
// @version      1.0
// @description  Load Clyde NWB Maintenance Windows on STN Online
// @author       Jonathan Lam
// @match        http://stnpdapp.rail.nsw.gov.au:5555/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle ( `
.btn-clyde {
  color: #fff;
  background-color: #d63384;
  border-color: #d63384;
}

.btn-clyde:hover {
  color: white !important;
  background-color: #ab296a;
  border-color: #ab296a;
}
` );

window.setTimeout(loopfunc, 1000);

function loopfunc() {
  if ($("#searchControllerDiv").length) {
    run();
  }
}

function run() {
'use strict';


var html_buttons = `
<table style="width: 100%">
  <tr>
  <td>Clyde Night Shift</td>
  <td>Clyde Day Shift</td>
  <td>Clyde Weekends</td>
  </tr>
<tr>
  <td>
    <div class="btn-toolbar" role="toolbar">
    <div class="btn-group" role="group">
    <button id="nightthisbtn" type="button" class="btn btn-clyde">This Week</button>
    <button id="nightnextbtn" type="button" class="btn btn-clyde">Next Week</button>
    </div>
    </div>
  </td>
  <td>
    <div class="btn-toolbar" role="toolbar">
    <div class="btn-group" role="group">
    <button id="daythisbtn" type="button" class="btn btn-clyde">This Week</button>
    <button id="daynextbtn" type="button" class="btn btn-clyde">Next Week</button>
    </div>
    </div>
  </td>
  <td>
    <div class="btn-toolbar" role="toolbar">
    <div class="btn-group" role="group">
    <button id="wethisbtn" type="button" class="btn btn-clyde">This Week</button>
    <button id="wenextbtn" type="button" class="btn btn-clyde">Next Week</button>
    </div>
    </div>
  </td>
</tr>
</table><div id='cout'></div>`;

$("#searchControllerDiv").before(html_buttons);

const night_shift_numbers = [' 08', ' 09', ' 12', ' 24'];
const day_shift_numbers = [' 06', ' 07', ' 25', ' 26'];
const weekend_numbers = [' 16', ' 17', ' 14', ' 21', ' 22', ' 23'];

$("#nightthisbtn").click(function(e) {
    e.preventDefault();
    var url1 = 'SearchSTNController?action=findByLocation&action1=findByCustomer&locationList=&customerList=&startDate='+startdate()+'&endDate='+enddate()+'&selecteditems=Proforma&searchBoxText=';
    mwsearch(url1, night_shift_numbers);
});

$("#daythisbtn").click(function(e) {
    e.preventDefault();
    var url1 = 'SearchSTNController?action=findByLocation&action1=findByCustomer&locationList=&customerList=&startDate='+startdate()+'&endDate='+enddate()+'&selecteditems=Proforma&searchBoxText=';
    mwsearch(url1, day_shift_numbers);
});

$("#wethisbtn").click(function(e) {
    e.preventDefault();
    var url1 = 'SearchSTNController?action=findByLocation&action1=findByCustomer&locationList=&customerList=&startDate='+startdate()+'&endDate='+enddate()+'&selecteditems=Proforma&searchBoxText=';
    mwsearch(url1, weekend_numbers);
});

$("#nightnextbtn").click(function(e) {
    e.preventDefault();
    var url1 = 'SearchSTNController?action=findByLocation&action1=findByCustomer&locationList=&customerList=&startDate='+startdatenextweek()+'&endDate='+enddatenextweek()+'&selecteditems=Proforma&searchBoxText=';
    mwsearch(url1, night_shift_numbers);
});

$("#daynextbtn").click(function(e) {
    e.preventDefault();
    var url1 = 'SearchSTNController?action=findByLocation&action1=findByCustomer&locationList=&customerList=&startDate='+startdatenextweek()+'&endDate='+enddatenextweek()+'&selecteditems=Proforma&searchBoxText=';
    mwsearch(url1, day_shift_numbers);
});

$("#wenextbtn").click(function(e) {
    e.preventDefault();
    var url1 = 'SearchSTNController?action=findByLocation&action1=findByCustomer&locationList=&customerList=&startDate='+startdatenextweek()+'&endDate='+enddatenextweek()+'&selecteditems=Proforma&searchBoxText=';
    mwsearch(url1, weekend_numbers);
});



function searchlist(str, l) {
    if (!(str.includes('MW'))) return false;
    return l.some(function(num) {
        return str.includes(num);
    });
}

function filter_response(res, mw_numbers) {
  var data = [];
  res.forEach(function (stn) {
    if (searchlist(stn.title, mw_numbers))
      data.push(stn);
  });
  return data;
}

function nextDay(x){
    // x=0 is Sunday
    // x=1 is Monday
    var now = new Date();
    var delta = (x+(7-now.getDay())) % 7;
    if (delta == 0) delta = 7;
    now.setDate(now.getDate() + delta);
    return now;
}

function startdate() {
    var d = nextDay(7);
    var res = d.setTime(d.getTime() - (7 * 24 * 60 * 60 * 1000));
    d = new Date(res);
    return format_date(d);
}

function enddate() {
    return format_date(nextDay(7));
}

function startdatenextweek() {
    var d = nextDay(1);
    return format_date(d);
}

function enddatenextweek() {
    var d = nextDay(7);
    var res = d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
    d = new Date(res);
    return format_date(d);
}

function format_date(d) {
    // d is a Date object
    // returns string of the form dd-mm-yyyy
    var month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month, year].join('-');
}

function mwsearch(url1, mw_numbers) {
	$.ajax({
		type : 'post',
		url : url1,
		dataType : "json",
		success : function(response) {
			document.getElementById("filter").style.display = "none";
			document.getElementById("validStart").style.display = "none";
			document.getElementById("NoRecordSTNDiv").style.display = "none";
			document.getElementById("searchControllerDiv").style.display = "block";
			$("#grid1").jqGrid("GridUnload");
			$("#grid1").jqGrid(
							{
								colModel : [
										{
											name : "name",
											label : "STN",
											width : 80,
											formatter : formateLink
										},
										{
											name : "title",
											label : "Title",
											width : 760,
											formatter : formatetitleLink
										},
										{
											name : "contents",
											label : "Contents",
											width : 185
										},
										{
											name : "startDate",
											label : "Start Date",
											width : 80,
											align: "right"
										},
										{
											name : "endDate",
											label : "End Date",
											width : 80,
											align: "right"
										},
										{
											name : "vide",
											label : "Vide",
											width : 80,
											formatter : formateLink1,
											align: "right"
										},

								],
								data : filter_response(response, mw_numbers),
								iconSet : "fontAwesome",
								idPrefix : "g1_",
								rownumbers : true,
								sortname : "invdate",
								sortorder : "desc",
								caption : "Recently Published Daily STN",
								threeStateSort : true,
								sortIconsBeforeText : true,
								headertitles : true,
								toppager : true,
								pager : true,
								width : 1300,
								height : 450,
								shrinkToFit : false,
								rowNum : 20,
							});

		},
		error : function() {
			document.getElementById("searchControllerDiv").style.display = "none";
			document.getElementById("NoRecordSTNDiv").style.display = "block";

		}
	});
}

function filtered_stn_data() {
    var url = 'SearchSTNController?action=findByLocation&action1=findByCustomer&locationList=&customerList=&startDate='+format_date(new Date())+'&endDate=31-12-2023&selecteditems=Proforma&searchBoxText=';
    console.log(url);
    $.ajax({
		type : 'post',
		url : url,
		dataType : "json",
		success : function(response) {
            post_data(response);
        }
    });
}

function post_data(stn_data) {
    //var stn_data = filtered_stn_data();
    console.log(stn_data)

    var url = "https://jonathanlamao.com/stn/new";
    $.ajax({
		type : 'POST',
		url : url,
		dataType : "json",
        contentType: "application/json",
        data: JSON.stringify(stn_data),
		success : function(response) {
            console.log(response);
            upload_stn_list(response);
			//document.getElementById("cout").innerHTML = response;
        },
        error : function(response) {
			//document.getElementById("cout").innerHTML = JSON.stringify(response);
        }
    });
}

function upload_stn_list(stn_list) {
    stn_list.forEach(function(pdffilename) {
        var url_prefetch = "http://stnpdapp.rail.nsw.gov.au:5555/stn//STNServ?documentNo=" + pdffilename.replace(".pdf", "");
        fetch(url_prefetch);
        var url = "http://stnpdapp.rail.nsw.gov.au:5555//stn/pdfs/" + pdffilename;
        console.log(url);
        fetch(url)
          .then(res => res.blob()) // Gets the response and returns it as a blob
          .then(blob => {
            // Here's where you get access to the blob
            // And you can use it for whatever you want
            // Like calling ref().put(blob)
            //console.log(blob);
            var fd = new FormData();
              fd.append('fname', 'test.pdf');
              fd.append('data', blob);
              $.ajax({
                  type: 'POST',
                  url: 'https://jonathanlamao.com/stn/upload?f='+pdffilename,
                  data: fd,
                  processData: false,
                  contentType: false
              }).done(function(data) {
                     console.log(data);
              });
        });
    });
}


filtered_stn_data()
};
