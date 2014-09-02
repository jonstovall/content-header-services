
(function(){
	jQuery(document).ready( function() { 
		function setupSearchAfterHeaderLoads() {
			setupSearch('rax-support-search','rax-support-search-input','~!@#contentdivid#@!~','~!@#filter#@!~');
		}	
		insertStyle();
		getHeader("~!@#team#@!~",setupSearchAfterHeaderLoads,"~!@#servername#@!~");
		getFooter("~!@#team#@!~","~!@#servername#@!~");
		teliumInitialization("~!@#team#@!~");
		checkApiDocsHref();
		
	});

	//The Header.html's API Documentation tab is hard coded to point to docs.rackspace.com.
	//We can only determine what the API Docs href should be at run time. There are several
	//env's, staging, internal, and internal-staging. Look at the window url, and if it 
	//contains, staging, internal, or internal-staging change the href accordingly	
	function checkApiDocsHref(){
		var serverUrl=window.location.href;

		var index=serverUrl.indexOf("internal");
		if(-1!=index){
			$('#raxhs-api').removeAttr('href');
			
			index=serverUrl.indexOf('staging');
			var theNewUrl='http://docs-internal.rackspace.com';
			if(-1!=index){
				theNewUrl='http://docs-internal-staging.rackspace.com';
			}
			$('#raxhs-api').attr('href',theNewUrl);
		}
		//Now we have to check for staging
		else{
			index=serverUrl.indexOf('staging');
			if(-1!=index){
				$('#raxhs-api').removeAttr('href');
				$('#raxhs-api').attr('href','http://docs-staging.rackspace.com');
			}
		}		
	}
	
	function create_javascript_element(script_src, is_inner_text, id) {
        var script = document.createElement('script');
        if(null!=id && id!=""){
            script.id=id;
        }
        script.type = 'text/javascript';
        
        if(!is_inner_text){
        	script.async = true;
            script.src = script_src;
        }
        else{
        	script.innerText=script_src;
        	script.innerHtml=script_src;
        }
        return script;
	}
	
	function insert_into_dom(element) {
        var s0 = document.getElementsByTagName('script')[0];
        s0.parentNode.insertBefore(element, s0);
        document.getElementsByTagName('script')[0].innerHTML=document.getElementsByTagName('script')[0].innerText;
    }
	
	function teliumInitialization(team){

		var env="~!@#env#@!~";
		var rackId=getCookie("IS_UASrackuid");
		var sessId=getCookie("RackSID");
		
		var pageNameDOM=document.getElementsByTagName('title');
		var pageName=team;
		if(null!=pageName){
			pageName=pageName.trim();
		}
		pageName+=": ";
		if(pageNameDOM!=null && pageNameDOM.length>0){			
			pageName+=pageNameDOM[0].text.trim();
		}
		else{
			pageName+=" NO TITLE url="+document.location.href;
		}
		
		//Create a string instead of creating an Object because the using JSON.stringify results in 
		//errors during the compression
		var uData="var utag_data={"+
			"'channel': '"+ team +
			"', 'environment': '"+ env+
		    "', 'page_name': '"+pageName+
		    "', 'rack_id': '"+ rackId+","+
		    "', 'session_id': '"+ sessId+
		    "', 'site_language': 'en'};";
	
		var element=create_javascript_element("//tags.tiqcdn.com/utag/rackspace/support/prod/utag.js",false,null);		
		insert_into_dom(element);
		
		element=create_javascript_element(uData,true,"racks-first-script");
		insert_into_dom(element);
		
		var inputEnv=document.createElement('input');
		inputEnv.type="hidden";
		inputEnv.id="racks-env";
		inputEnv.value="environment";
		
		var bodyTag=document.getElementsByTagName('body')[0];
		bodyTag.appendChild(inputEnv);			
	}
	
	function insertStyle(){
		var hassCssStyle="~!@#haasstyle#@!~";
		jQuery("<style type='text/css'>"+hassCssStyle+"</style>").appendTo("head");
	}

	function getHeader(team, callback, server){	 
		var theHeader="~!@#headervalue#@!~";
		jQuery("#~!@#headerdivid#@!~").html(theHeader);
		var theTeam=team;
		if(theTeam!=undefined){
			jQuery('.raxhs-tab').removeClass('active');
			if(theTeam==='knowledge'){
				jQuery('#raxhs-knowledge').addClass('active');

			}
			else if(theTeam==='api'){

				jQuery('#raxhs-api').addClass('active');        		
			}
			else if(theTeam==='community'){

				jQuery('#raxhs-community').addClass('active');             		
			}
			else if(theTeam==='support'){
				jQuery('#raxhs-support').addClass('active');          		
			}
		}
		callback();

	}

	function getFooter(team,server){
		var theFooter="~!@#footervalue#@!~";
		jQuery("#~!@#footerdivid#@!~").html(theFooter);   
	}
	
	function getCookie(cookieName){
		var retVal="";
		if(null!=cookieName && cookieName!=""){
			var allcookies = document.cookie;		

			// Get all the cookies pairs in an array
			var cookiearray  = allcookies.split(';');

			// Now take key value pair out of this array
			for(var i=0; i<cookiearray.length; i++){
				var name = cookiearray[i].split('=')[0];
				if(null!=name){
					name=name.trim();
				}
				
				var value = cookiearray[i].split('=')[1];
				if(null!=value){
					value=value.trim();
				}
				if(cookieName==name){
					retVal=value;
					break;
				}
			}	
		}
		return retVal;
	}


	/************Search Stuff**********/


	// returns true if running on IE 9 or previous
	function onIE9() {
	  var version = 0;
	  if (navigator.appName == 'Microsoft Internet Explorer') {
	    var ua = navigator.userAgent;
	    var re = new RegExp("MSIE ([0-9\{1,}[\.0-9]{0,})");
	    if (re.exec(ua) != null)
	      version = parseFloat(RegExp.$1);
	  }
	  return (version > 0 && version < 10);
	}
	var SearchModel = {
	  initialize: function() {
	    this.query = "";
	    this.filter = 'all'; // filter can be all, api_docs, discussions or product_documentation
	    this.page = 1;
	    this.resultsPerPage = 5;
	    this.results = null;
	    this.observers = [];
	    this.isLoading = false;
	    this.isNextSearch = false;
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
	      this.isNextSearch=true;
	      this.processSearch();
	      this.notifyObservers("page",this.filter);
	    }
	  },
	  // This function will call the Google Search API and add the result
	  // to the item with class 'support-content-list' set.
	  processSearch: function(event) {
	    if( this.query == '' ) {
	      this.isNextSearch=false;
	      // Do nothing unless there is something in the search box
	      return;
	    }
	    this.isLoading = true;
	    this.results = null;
	    if( onIE9() ) {
	      this.callGcsIE9();
	    } else {
	      this.callGcs();
	    }
	  },
	  callGcs: function() {
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
	    	this.isNextSearch=false;
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
	  callGcsIE9: function() {
	    var processJsonp = function(jsonResult) {
	      var mockResult = new Object;
	      mockResult.items = new Array;
	      for(var i=0; i < jsonResult.results.length; i++) {
	        var jsonpItem = jsonResult.results[i];
	        mockResult.items.push({
	          title: jsonpItem.titleNoFormatting,
	          link: jsonpItem.url,
	          htmlTitle: jsonpItem.title,
	          snippet: jsonpItem.content,
	          htmlFormattedUrl: jsonpItem.url,
	        });
	      }
	      mockResult.searchInformation = {totalResults: parseInt(jsonResult.cursor.estimatedResultCount)};
	      SearchModel.results = mockResult;
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
	    	this.isNextSearch=false;
	        console.warn('SearchModel.searchIE9 ' + status + ': ' + error);
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
	    var theQuery=this.query;
	    var theResultSize=this.results.searchInformation.totalResults;
	    
		var rackId=getCookie("IS_UASrackuid");
		var sessId=getCookie("RackSID");	    	    
		var env="~!@#env#@!~";
		
		if(!this.isNextSearch){	
		    var team="~!@#team#@!~";
		    var pageName=team;
		    if(null!=pageName){
			    pageName=pageName.trim();
		    }
		    pageName+=": Search Results";
		
		    var viewData={
			    channel: team,
			    environment: env,
			    page_name:pageName,
			    rack_id: rackId,
			    session_id: sessId,
			    site_language: 'en',
			    search_term: theQuery,
			    search_results: theResultSize
		    };			
		    utag.view(viewData);
		}	
	    this.isNextSearch=false;
	    return result;
	  },
	  getNumResults: function() {
	    return this.results.searchInformation.totalResults;
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
	      dataType: "jsonp",
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
	  createLink: function(encloseIn,title,href,contents) {
	    var result = jQuery(encloseIn);
	    var link = jQuery('<a>',{
	      'title': title,
	      'href': href,
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
