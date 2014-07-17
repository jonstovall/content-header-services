package com.rackspace.header.service;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.BDDMockito;
import org.mockito.Mock;
import org.mockito.Mockito;

public class RaxHeaderServiceTest {

	@Mock
	private HttpServletRequest request;
	
	@Mock
	private HttpServletResponse response;
	
	private RaxHeaderService service;
	
	@Before
	public void setUp(){
		this.request=Mockito.mock(HttpServletRequest.class);
		this.response=Mockito.mock(HttpServletResponse.class);
	}
	
	@Test
	public void testRaxHeaderService(){
	    BDDMockito.given(request.getParameter("headerdivid")).willReturn("raxheaderfooterservice-headercontent");
	    BDDMockito.given(request.getParameter("footerdivid")).willReturn("raxheaderfooterservice-footercontent");
	    BDDMockito.given(request.getParameter("contentdivid")).willReturn("content");
	    
	    
	    this.service=new RaxHeaderService();
	    
	    InputStream footerStream=this.getClass().getClassLoader().getResourceAsStream("Footer.html");
	    this.service.setFooterStream(footerStream);
	    
	    InputStream headerServiceStream=this.getClass().getClassLoader().getResourceAsStream("header-service.js");
	    this.service.setHeaderJsStream(headerServiceStream);

	    InputStream styleStream=this.getClass().getClassLoader().getResourceAsStream("style.html");
	    this.service.setStyleStream(styleStream);
	    
	    InputStream headerStream=this.getClass().getClassLoader().getResourceAsStream("Header.html");
	    this.service.setHtmlStream(headerStream);	 
	    
	    InputStream latestJQueryStream=this.getClass().getClassLoader().getResourceAsStream("latestJQuery.js");
	    this.service.setLatestJQuery(latestJQueryStream);	 
	    
	    InputStream latestJQueryUIStream=this.getClass().getClassLoader().getResourceAsStream("latestJQueryUI.js");
	    this.service.setLatestJQueryUI(latestJQueryUIStream);	    
	    
	    
	    this.service.getHeaderJavascript(request, response, "myRaxHeaderContent", "raxheaderfooterservice-footercontent", 
	    		"content", "all", "api", "content-services.rackspace.com", "true", "false", "false", "//");
	    Map<String,String>jsMap=this.service.getJavascriptsMap();
	    
	    Assert.assertNotNull(jsMap);
	    Set<String>keys=jsMap.keySet();
	    
	    Iterator<String>iter=keys.iterator();
	    String firstKey=iter.next();
	    
	    String javaScriptString=jsMap.get(firstKey);
	    
	    //Verify that the text return contains myRaxHeaderContent, which is the header id sent in the call via
	    //service.getHeaderJavascript(request, response, "myRaxHeaderContent", "raxheaderfooterservice-footercontent", 
	    //		"content", "all", "api", "content-services.rackspace.com", "true", "false", "false", "//");
	    Assert.assertNotNull(javaScriptString);
	    
	    int index=javaScriptString.indexOf("#myRaxHeaderContent");
	    Assert.assertNotEquals(index, -1);

	    footerStream=this.getClass().getClassLoader().getResourceAsStream("Footer.html");
	    this.service.setFooterStream(footerStream);
	    
	    headerServiceStream=this.getClass().getClassLoader().getResourceAsStream("header-service.js");
	    this.service.setHeaderJsStream(headerServiceStream);

	    styleStream=this.getClass().getClassLoader().getResourceAsStream("style.html");
	    this.service.setStyleStream(styleStream);
	    
	    headerStream=this.getClass().getClassLoader().getResourceAsStream("Header.html");
	    this.service.setHtmlStream(headerStream);	 
	    
	    latestJQueryStream=this.getClass().getClassLoader().getResourceAsStream("latestJQuery.js");
	    this.service.setLatestJQuery(latestJQueryStream);	 
	    
	    latestJQueryUIStream=this.getClass().getClassLoader().getResourceAsStream("latestJQueryUI.js");
	    this.service.setLatestJQueryUI(latestJQueryUIStream);	    
	    
	    //Get the header
	    String hederStr=this.service.getHeaderOrFooter(request, response, "api", "false", "false");
	    System.out.println("!@#!@#!@#!@#headerStr=");
	    System.out.println(hederStr);
	    //Get the footer
	    
        Map<String,String>headersMap=this.service.getHeadersMap();
        
        //We have only made one request for the header so the headersMap should have a size of 1
        Assert.assertEquals(headersMap.size(), 1);   
        
	    footerStream=this.getClass().getClassLoader().getResourceAsStream("Footer.html");
	    this.service.setFooterStream(footerStream);
	    
	    headerServiceStream=this.getClass().getClassLoader().getResourceAsStream("header-service.js");
	    this.service.setHeaderJsStream(headerServiceStream);

	    styleStream=this.getClass().getClassLoader().getResourceAsStream("style.html");
	    this.service.setStyleStream(styleStream);
	    
	    headerStream=this.getClass().getClassLoader().getResourceAsStream("Header.html");
	    this.service.setHtmlStream(headerStream);	 
	    
	    latestJQueryStream=this.getClass().getClassLoader().getResourceAsStream("latestJQuery.js");
	    this.service.setLatestJQuery(latestJQueryStream);	 
	    
	    latestJQueryUIStream=this.getClass().getClassLoader().getResourceAsStream("latestJQueryUI.js");
	    this.service.setLatestJQueryUI(latestJQueryUIStream);	

	    hederStr=this.service.getHeaderOrFooter(request, response, "api", "false", "false");
	    
	    headersMap=this.service.getHeadersMap();
	    
        //This is the second request for the header but the request is the exact fame team and debug mode, therefore
	    //the headerMap should not have grown in size, and just return the matched key team+debug value
        Assert.assertEquals(headersMap.size(), 1);
	    
	    footerStream=this.getClass().getClassLoader().getResourceAsStream("Footer.html");
	    this.service.setFooterStream(footerStream);
	    
	    headerServiceStream=this.getClass().getClassLoader().getResourceAsStream("header-service.js");
	    this.service.setHeaderJsStream(headerServiceStream);

	    styleStream=this.getClass().getClassLoader().getResourceAsStream("style.html");
	    this.service.setStyleStream(styleStream);
	    
	    headerStream=this.getClass().getClassLoader().getResourceAsStream("Header.html");
	    this.service.setHtmlStream(headerStream);	 
	    
	    latestJQueryStream=this.getClass().getClassLoader().getResourceAsStream("latestJQuery.js");
	    this.service.setLatestJQuery(latestJQueryStream);	 
	    
	    latestJQueryUIStream=this.getClass().getClassLoader().getResourceAsStream("latestJQueryUI.js");
	    this.service.setLatestJQueryUI(latestJQueryUIStream);	

	    hederStr=this.service.getHeaderOrFooter(request, response, "support", "false", "false");
	    
	    headersMap=this.service.getHeadersMap();
        //This is the third request for the header since the team is different from the last request,
	    //the headerMap should increase in size, and just return the matched key team+debug value
        Assert.assertEquals(headersMap.size(), 2);
        
        
	    footerStream=this.getClass().getClassLoader().getResourceAsStream("Footer.html");
	    this.service.setFooterStream(footerStream);
	    
	    headerServiceStream=this.getClass().getClassLoader().getResourceAsStream("header-service.js");
	    this.service.setHeaderJsStream(headerServiceStream);

	    styleStream=this.getClass().getClassLoader().getResourceAsStream("style.html");
	    this.service.setStyleStream(styleStream);
	    
	    headerStream=this.getClass().getClassLoader().getResourceAsStream("Header.html");
	    this.service.setHtmlStream(headerStream);	 
	    
	    latestJQueryStream=this.getClass().getClassLoader().getResourceAsStream("latestJQuery.js");
	    this.service.setLatestJQuery(latestJQueryStream);	 
	    
	    latestJQueryUIStream=this.getClass().getClassLoader().getResourceAsStream("latestJQueryUI.js");
	    this.service.setLatestJQueryUI(latestJQueryUIStream);	
	    
	    
	    BDDMockito.given(request.getHeader("User-Agent")).willReturn("netscape");
	    //Get the footer
	    String footer=this.service.getHeaderOrFooter(request, response, "support", "false", "true");
	    System.out.println("!@#!@#!@#!@#!@#!@#footer=");
	    System.out.println(footer);
	    
	    Map<String,String>footerMap=this.service.getFootersMap();
	    
	    Assert.assertEquals(footerMap.size(), 1);
	    
	    boolean hasKey=footerMap.containsKey("netscape-false");
	    Assert.assertTrue(hasKey);
	    
	    
	}
	
	
	
}
