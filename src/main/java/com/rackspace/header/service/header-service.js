
(function(){
	$(document).ready( function() { 
		function setupSearchAfterHeaderLoads() {
			setupSearch('rax-support-search','rax-support-search-input','~!@#contentdivid#@!~','~!@#filter#@!~');
		}	
		insertStyle();
		getHeader("~!@#team#@!~",setupSearchAfterHeaderLoads,"~!@#servername#@!~");
		getFooter("~!@#team#@!~","~!@#servername#@!~");

	});
	
	function insertStyle(){
		var hassCssStyle="~!@#haasstyle#@!~";
		$("<style type='text/css'>"+hassCssStyle+"</style>").appendTo("head");
	}

	function getHeader(team, callback, server){	 
		var theHeader="~!@#headervalue#@!~";
		$("#~!@#headerdivid#@!~").html(theHeader);
		var theTeam=team;
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

	function getFooter(team,server){
		var theFooter="~!@#footervalue#@!~";
		$("#~!@#footerdivid#@!~").html(theFooter);   
	}


	/************Search Stuff**********/

	var SearchModel = {
			initialize: function() {
				this.query = "";
				this.filter = 'all'; // filter can be all, api_docs, discussions or product_documentation
				this.page = 1;
				this.resultsPerPage = 5;
				this.jsonpResult = null;
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
				this.jsonpResult = null;

				processJsonp = function (jsonResponse) {
					SearchModel.jsonpResult = jsonResponse;
				};

				jQuery.ajax({
					dataType:'jsonp',
					url:'https://www.googleapis.com/customsearch/v1element?callback=?',
					data: {
						key: 'AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY',
						cx: '006605420746493289825:wnrdhyxrou4',
						q: this.getLongQueryString(),
						num: this.resultsPerPage,
						start: (this.page - 1) * this.resultsPerPage + 1,
					},
					context: this,
					success: processJsonp,
					error: function(xhr, status, error) {
						console.warn('SearchModel.processSearch ' + status + ': ' + error);
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
				if (this.jsonpResult && this.jsonpResult.results)
					return this.jsonpResult.results;
				return new Array();
			},
			getNumResults: function() {
				try {
					return parseInt(this.jsonpResult.cursor.estimatedResultCount);
				} catch(err) {
					return 0;
				}
			},
			getMaxNumPages: function() {
				try {
					var numPages = Math.ceil(this.getNumResults() / this.resultsPerPage);
					return Math.min(20,numPages);
				} catch (err) {
					return 0;
				}
			},
			hasMorePages: function() {
				return this.page < this.getMaxNumPages();
			},
			isFirstPage: function() {
				return this.page == 1;
			}
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
			      if (query) {
			        SearchController.blur(); // otherwise autocomplete may still be active
			        SearchModel.search(query);
			      }
			    };
			  },
			  getQueryString: function() {
			    var user_input = this.searchField.val();
			    var stripped = user_input.replace(/<[^>]*>?/g, "");
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
			      console.warn("oops! something went wrong\n  event: " + event);
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
			      if (SearchModel.isFirstPage()) {
			        // there could be no results because google says so or because an error occurred with the search...
			        // either way, we tell the user there are no search results
			        div.append('<p class="support-results-none">No search results for &quot;<strong>' + SearchModel.getQueryString() + '</strong>&quot;</p>');
			      } // else it's just the end of the search results, do nothing
			    } else {
			      jQuery.each(results, function(index,item){
			        createLink('<h5>',item.titleNoFormatting,item.url,item.title).appendTo(div);
			        jQuery('<p>'+ item.content +'</p>').appendTo(div);
			        createLink('<p class="meta">',item.url,item.url,item.url).appendTo(div);
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
			    console.warn("setupSearch failed");
			  } else {
			    SearchModel.initialize();
			    SearchModel.setFilter(defaultFilter);
			    SearchView.initialize(searchResultsDiv, drawSearchCallback);
			    SearchController.initialize(searchForm, searchField);
			  }
			}



})();
