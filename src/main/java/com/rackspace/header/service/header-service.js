
(function(){
	$(document).ready( function() { 
		checkIEAjax();
		function setupSearchAfterHeaderLoads() {
			setupSearch('rax-support-search','rax-support-search-input','~!@#contentdivid#@!~','~!@#filter#@!~');
		}	
		getHeader("~!@#team#@!~",setupSearchAfterHeaderLoads,"~!@#servername#@!~");
		getFooter("~!@#team#@!~","~!@#servername#@!~");

	});

	function getHeader(team, callback, server){	 
		var theServer=server;
		if(null===theServer || theServer===undefined){
			theServer="docs.rackspace.com";
		}
		var url=("~!@#http://#@!~"+theServer+"/rax-headerservice/rest/service/getheader?team="+team);
		$.support.cors = true;
		$.getJSON(url,{"team":team},
				function(data){
			$("#~!@#headerdivid#@!~").html(data.html);
			var theTeam=data.team;
			if(theTeam!=undefined){
				$('.raxhs-tab').removeClass('active');
				if(theTeam==='knowledge'){
					$('#raxhs-knowledge').addClass('active');

				}
				else if(theTeam==='api'){

					$('#raxhs-api').addClass('active');        		
				}
				else if(theTeam==='community'){

					$('#raxhs-community').addClass('active');             		
				}
				else if(theTeam==='support'){
					$('#raxhs-support').addClass('active');          		
				}
			}
			callback();
		}
		);
	}

	function getFooter(team,server){
		var theServer=server;
		if(null===theServer || theServer===undefined){
			theServer="docs.rackspace.com";
		}
		var url=("~!@#http://#@!~"+theServer+"/rax-headerservice/rest/service/getheader?footer=true&team="+team);
		$.support.cors = true; 
		$.getJSON(url,{"team":team,"footer":"true"})
		.done(function(data){
			$("#~!@#footerdivid#@!~").html(data.html);           	
		})
		.fail(function(jqxhr, textStatus, error){
			var failure="true";
			failure+="asdf";
		});	
	}


	function checkIEAjax(){

		if (!$.support.cors && $.ajaxTransport && window.XDomainRequest) {
			var httpRegEx = /^https?:\/\//i;
			var getOrPostRegEx = /^get|post$/i;
			var sameSchemeRegEx = new RegExp('^'+location.protocol, 'i');
			var htmlRegEx = /text\/html/i;
			var jsonRegEx = /\/json/i;
			var xmlRegEx = /\/xml/i;

			// ajaxTransport exists in jQuery 1.5+
			$.ajaxTransport('* text html xml json', function(options, userOptions, jqXHR){
				// XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
				if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(options.url) && sameSchemeRegEx.test(options.url)) {
					var xdr = null;
					var userType = (userOptions.dataType||'').toLowerCase();
					return {
						send: function(headers, complete){
							xdr = new XDomainRequest();
							if (/^\d+$/.test(userOptions.timeout)) {
								xdr.timeout = userOptions.timeout;
							}
							xdr.ontimeout = function(){
								complete(500, 'timeout');
							};
							xdr.onload = function(){
								var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
								var status = {
										code: 200,
										message: 'success'
								};
								var responses = {
										text: xdr.responseText
								};
								try {
									if (userType === 'html' || htmlRegEx.test(xdr.contentType)) {
										responses.html = xdr.responseText;
									} else if (userType === 'json' || (userType !== 'text' && jsonRegEx.test(xdr.contentType))) {
										try {
											responses.json = $.parseJSON(xdr.responseText);
										} catch(e) {
											status.code = 500;
											status.message = 'parseerror';
											//throw 'Invalid JSON: ' + xdr.responseText;
										}
									} else if (userType === 'xml' || (userType !== 'text' && xmlRegEx.test(xdr.contentType))) {
										var doc = new ActiveXObject('Microsoft.XMLDOM');
										doc.async = false;
										try {
											doc.loadXML(xdr.responseText);
										} catch(e) {
											doc = undefined;
										}
										if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
											status.code = 500;
											status.message = 'parseerror';
											throw 'Invalid XML: ' + xdr.responseText;
										}
										responses.xml = doc;
									}
								} catch(parseMessage) {
									throw parseMessage;
								} finally {
									complete(status.code, status.message, responses, allResponseHeaders);
								}
							};
							// set an empty handler for 'onprogress' so requests don't get aborted
							xdr.onprogress = function(){};
							xdr.onerror = function(){
								complete(500, 'error', {
									text: xdr.responseText
								});
							};
							var postData = '';
							if (userOptions.data) {
								postData = ($.type(userOptions.data) === 'string') ? userOptions.data : $.param(userOptions.data);
							}
							xdr.open(options.type, options.url);
							xdr.send(postData);
						},
						abort: function(){
							if (xdr) {
								xdr.abort();
							}
						}
					};
				}
			});
		}	
	}

	/************Search Stuff**********/

	var SearchModel = {
			initialize: function() {
				this.query = "";
				this.filter = 'all'; // filter can be all, api_docs, discussions or product_documentation
				this.page = 1;
				this.resultsPerPage = 5;
				this.results = null;
				this.observers = [];
				this.isLoading = false;
			},
			// observers must implement observe(event)
			addObserver: function(observer) {
				this.observers.push(observer);
			},
			notifyObservers: function(event) {
				this.observers.forEach(function(aObserver) {
					aObserver.observe(event);
				});
			},
			search: function(query) {
				this.query = query;
				this.page = 1;
				this.processSearch();
				this.notifyObservers("search");
			},
			getFilter: function() {
				return this.filter;
			},
			setFilter: function(value) {
				this.filter = value;
				this.page = 1;
				this.processSearch();
				this.notifyObservers("filter",this.filter);
			},
			nextPage: function() {
				if (!this.isLoading && this.hasMorePages()) {
					this.page++;
					this.processSearch();
					this.notifyObservers("page",this.filter);
				}
			},
			// This function will call the Google Search API and add the result
			// to the item with class 'support-content-list' set.
			processSearch: function(event) {
				if( this.query == '' ) {
					// Do nothing unless there is something in the search box
					return;
				}
				this.isLoading = true;
				this.results = null;
				jQuery.ajax({
					type: 'GET',
					url: 'https://www.googleapis.com/customsearch/v1',
					data: {
						// https://developers.google.com/custom-search/json-api/v1/reference/cse/list
						key: 'AIzaSyCMGfdDaSfjqv5zYoS0mTJnOT3e9MURWkU',
						cx: '006605420746493289825:wnrdhyxrou4',
						q: this.getLongQueryString(),
						num: this.resultsPerPage,
						start: (this.page-1) * this.resultsPerPage + 1,
					},
					context: this,
					error: function(xhr, status, error) {
						// do nothing -- this.results is null indicates there was an error
					},
					success: function(result, status, xhr) {
						this.results = result;
					},
					complete: function(xhr, status) {
						this.isLoading = false;
						this.notifyObservers("searchReturned");
					}
				});
			},
			getQueryString: function() { return this.query; },
			getLongQueryString: function() {
				var result = this.query;
				if (this.filter != 'all') {
					result += ' more:' + this.filter;
				}
				return result;
			},
			getResults: function() {
				var result;
				if (this.results && this.results.items) {
					result = this.results.items;
				} else {
					result = new Array();
				}
				return result;
			},
			getNumResults: function() {
				return this.results.searchInformation.totalResults;
			},
			getMaxNumPages: function() {
				try {
					var numPages = Math.ceil(this.results.searchInformation.totalResults / this.resultsPerPage);
					return Math.min(20,numPages);
				} catch (err) {
					return 0;
				}
			},
			hasMorePages: function() {
				return this.page < this.getMaxNumPages();
			},
	};
	var SearchController = {
			initialize: function(searchForm, searchField) {
				this.searchForm = searchForm;
				this.searchField = searchField;
				this.attachToSearchField();
				SearchView.setupSearchFiltersFunction(this.attachSearchFiltersFunction());
			},
			attachToSearchField: function() {
				this.searchForm.on('submit', this.searchFunction());
				if (this.searchField.autocomplete) {
					this.searchField.autocomplete({
						source: this.completeSearch,
						position: { my: "left top", at: "left bottom" },
					});
				} else {
					console.warn('jQuery UI autocomplete not available');
				}
			},
			attachSearchFiltersFunction: function() {
				var SearchController = this;
				return function() {
					jQuery('.filter_all').on('click', SearchController.filterFunction('all'));
					jQuery('.filter_api_docs').on('click', SearchController.filterFunction('api_docs'));
					jQuery('.filter_discussions').on('click', SearchController.filterFunction('discussions'));
					jQuery('.filter_product_documentation').on('click', SearchController.filterFunction('product_documentation'));
				};
			},
			searchFunction: function() {
				return function(event) {
					event.preventDefault();
					var query = SearchController.getQueryString();
					if(query){
						SearchController.blur(); // otherwise autocomplete may still be active
						SearchModel.search(query);
					}
				};
			},
			getQueryString: function() {
				var user_input = this.searchField.val();
				var stripped = jQuery('<div>' + user_input.trim() + '</div>').text(); // strip HTML per security
				return stripped;
			},
			blur: function() {
				this.searchField.blur();
			},
			filterFunction: function(filterValue) {
				var SearchController = this;
				return function(event) {
					event.preventDefault();
					SearchModel.setFilter(filterValue);
				};
			},
			completeSearch: function(request,response) {

				completeSearchCallback = function (jsonResponse) {
					// second element of json response is an array of one-element arrays that we flatten here
					response(jQuery(jsonResponse[1]).map(function(){return this[0];}));
				};
				// Now call for autocomplete terms
				jQuery.ajax({
					dataType: "json",
					url: (window.location.protocol == "https:"?"https":"http") + '://clients1.google.com/complete/search?callback=?',
					data: {
						q: request.term,
						client: 'partner',
						partnerid: '006605420746493289825:wnrdhyxrou4',
						ds: 'cse'
					},
					success: completeSearchCallback
				});
			}
	};
	var SearchView = {
			initialize: function(div, drawSearchCallback) {
				this.div = div;
				SearchModel.addObserver(this);
				this.isFirstTimeRendering = true;
				this.filterFunctionCallback = null;
				this.drawSearchCallback = drawSearchCallback;
			},
			observe: function(event) {
				switch (event) {
				case "filter":
					this.highlightCurrentFilter();
					this.emptyResults();
				case "page":
					jQuery('.support-results-loading').show();
					jQuery('.support-results-more').hide();
					break;
				case "search":
					this.draw();
					break;
				case "searchReturned":
					this.drawResults();
					break;
				default:
					console.error("oops! something went wrong\n  event: " + event);
				}
			},
			emptyResults: function() {
				jQuery('#search-results').empty();
			},
			setupSearchFiltersFunction: function(filterFunctionCallback) {
				this.filterFunctionCallback = filterFunctionCallback;
			},
			draw: function() {
				if (this.isFirstTimeRendering) {
					var skeletonHtml = [
					                    "<div class='support-results-container'>",
					                    "<h4>Search Results</h4>",
					                    "<ul class=\"support-content-filter clearfix\">",
					                    "<li class=\"filter_all\"><a href=\"#\">All Results</a></li>",
					                    "<li class=\"filter_product_documentation\"><a href=\"#\">Knowledge Center</a></li>",
					                    "<li class=\"filter_api_docs\"><a href=\"#\">API Docs</a></li>",
					                    "<li class=\"filter_discussions\"><a href=\"#\">Community</a></li>",
					                    "</ul>",
					                    "<div id=\"search-results\"></div>",
					                    "<i class='spinner support-results-loading'></i>",
					                    "<p class='support-results-more' style='display:none;'><a href='#' id='showMore'> <i class='fa fa-refresh'></i> Load more results</a></p>",
					                    "</div>",
					                    ].join("\n");
					this.div.html(skeletonHtml);
					this.filterFunctionCallback();
					this.highlightCurrentFilter();
					jQuery('#showMore').click(function(e) {
						e.preventDefault();
						SearchModel.nextPage();
					});
					this.isFirstTimeRendering = false;
				} else {
					this.emptyResults();
				}
				if(typeof this.drawSearchCallback != "undefined") this.drawSearchCallback();
			},
			drawResults: function() {
				var div = jQuery('#search-results');
				var results = SearchModel.getResults();
				var createLink = this.createLink;
				if(results.length == 0) {
					// there could be no results because google says so or because an error occurred with the search...
					// either way, we tell the user there are no search results
					div.append('<p class="support-results-none">No search results for &quot;<strong>' + SearchModel.getQueryString() + '</strong>&quot;</p>');
				} else {
					jQuery.each(results, function(index,item){        
						createLink('<h5>',item.title,item.link,item.htmlTitle).appendTo(div);
						jQuery('<p>'+ item.snippet +'</p>').appendTo(div);
						createLink('<p class="meta">',item.htmlFormattedUrl,item.link,item.htmlFormattedUrl).appendTo(div);
					});
				}
				jQuery('.support-results-loading').hide();
				jQuery('.support-results-more')[SearchModel.hasMorePages()?'show':'hide']();
			},
			highlightCurrentFilter: function() {
				var filterValue = SearchModel.getFilter();
				jQuery('ul.support-content-filter li.active').removeClass("active");
				jQuery('ul.support-content-filter li.filter_' + filterValue).addClass("active");
			},
			createLink: function(encloseIn,title,link,contents) {
				var result = jQuery(encloseIn);
				var link = jQuery('<a>',{
					'title': title,
					'href': link,
					'target': '_blank'
				});
				link.append(contents);
				link.appendTo(result);
				return result;
			},
	};
	function setupSearch(searchFormId,searchFieldId,searchResultsDivId,defaultFilter,drawSearchCallback) {
		var searchForm = jQuery('#'+searchFormId);
		var searchField = jQuery("#" + searchFieldId);
		var searchResultsDiv = jQuery("#" + searchResultsDivId);
		if(typeof defaultFilter === "undefined") defaultFilter = "all";
		if (searchForm.length != 1 || searchField.length != 1 || searchResultsDiv.length != 1) {
			console.error("setupSearch failed");
		} else {
			SearchModel.initialize();
			SearchModel.setFilter(defaultFilter);
			SearchView.initialize(searchResultsDiv, drawSearchCallback);
			SearchController.initialize(searchForm, searchField);
		}
	}



})();
