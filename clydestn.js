// ==UserScript==
// @name         Clyde STN
// @namespace    http://stnpdapp.rail.nsw.gov.au:5555/stn
// @version      0.2
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
$("#searchControllerDiv").before("<button class='btn btn-clyde' id='mwsearchbtn'>Search Clyde MW</button>");

$("#mwsearchbtn").click(function(e) {
    e.preventDefault();
    mwsearch();
});

function search_or(repl, keywords) {
    // given a sentence repl and a list of words/array keywords
    // this will return true of the keyword is detected in repl
    for (word in keywords) {
        if (typeof keywords[word] == 'string') {
            if (repl.toLowerCase().includes(keywords[word]))
                return true;
        } else {
            if (search_and(repl, keywords[word]))
                return true;
        }          
    }
    return false;
}

function search_and(repl, keywords) {
    // given a sentence repl and a list of words keywords
    for (word in keywords) {
        if (typeof keywords[word] == 'string') {
            if (!(repl.toLowerCase().includes(keywords[word])))
                return false;
        } else {
            if (!(search_or(repl, keywords[word])))
                return false;
        }  
    }
    return true;
}

const night_shift_numbers = ['08', '09', '12', '24'];
const day_shift_numbers = ['06', '07', '25', '26'];
const weekend_numbers = ['16', '17', '14', '21'];

function filter_response(res) {
  data = [];
  res.forEach(function (stn) {
    if (search_and('MW', night_shift_numbers))
      data.push(stn);
  });
  return data;
}

function todaysDate() {
    var d = new Date(),
    return format_date(d);
}

function nextweekDate() {
    var date = new Date();
    var res = date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    var d = new Date(res);

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

function mwsearch() {
	var url1 = 'SearchSTNController?action=findByLocation&action1=findByCustomer&locationList=&customerList=&startDate=28-03-2022&endDate=03-04-2022&selecteditems=Proforma&searchBoxText=';

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
								data : filter_response(response),
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


};