package com.rackspace.header.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.javascript.EvaluatorException;

import com.googlecode.htmlcompressor.compressor.HtmlCompressor;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;

@Path("/service")
public class RaxHeaderService {
	
	private static Logger log = Logger.getLogger(RaxHeaderService.class);
	private static Map<String,String>footersMap;
	private static Map<String, String>headersMap;
	private static Map<String, String>javascriptsMap;
	
	private InputStream headerJsStream;
	private InputStream htmlStream;
	private InputStream styleStream;
	private InputStream footerStream;
	private InputStream latestJQuery;
	private InputStream latestJQueryUI;
	
	//A new comment
	public static final String DATE_DELIMITER_IN_FOOTER_HTML="~~~YYYY~~~";
	
	static{
		RaxHeaderService.footersMap=new HashMap<String, String>();
		RaxHeaderService.headersMap=new HashMap<String, String>();
		RaxHeaderService.javascriptsMap=new HashMap<String, String>();
	}
	
	//Needed for JUnit testing
	public Map<String, String> getJavascriptsMap(){
		return RaxHeaderService.javascriptsMap;
	}
	
	//Needed for JUnit testing
	public Map<String,String> getHeadersMap(){
		return RaxHeaderService.headersMap;
	}
	
	//Needed for JUnit testing
	public Map<String,String> getFootersMap(){
		return RaxHeaderService.footersMap;
	}
	
	//Needed for JUnit testing
	public InputStream getStyleStream(){
		if(this.styleStream==null){
			this.styleStream=RaxHeaderService.class.getResourceAsStream("style.html");
		}
		else{
			try{
				this.styleStream.available();
			}
			catch(IOException e){
				//the stream is closed, open it again
				this.styleStream=RaxHeaderService.class.getResourceAsStream("style.html");
			}			
		}
		return this.styleStream;		
	}
	
	//Needed for JUnit testing
	public void setStyleStream(InputStream inny){
		this.styleStream=inny;
	}
	
	public InputStream getFooterStream(){
		if(this.footerStream==null){
			this.footerStream=RaxHeaderService.class.getResourceAsStream("Footer.html");
		}
		else{
			try{
				this.footerStream.available();
			}
			catch(IOException e){
				//the stream is closed, open it again
				this.footerStream=RaxHeaderService.class.getResourceAsStream("Footer.html");
			}			
		}		
		return this.footerStream;			
	}
	
	//Needed for JUnit testing
	public void setFooterStream(InputStream inny){
		this.footerStream=inny;
	}
	
	public InputStream getHtmlStream(){
		if(this.htmlStream==null){
			this.htmlStream=RaxHeaderService.class.getResourceAsStream("Header.html");
		}
		else{
			try{
				this.htmlStream.available();
			}
			catch(IOException e){
				//the stream is closed, open it again
				this.htmlStream=RaxHeaderService.class.getResourceAsStream("Header.html");
			}

		}
		return this.htmlStream;
	}
	
	//Needed for JUnit testing
	public void setHtmlStream(InputStream inny){
		this.htmlStream=inny;
	}
	
	public InputStream getHeaderJsStream(){
		if(this.headerJsStream==null){
			this.headerJsStream=RaxHeaderService.class.getResourceAsStream("header-service.js");
		}
		else{
			try{
				this.headerJsStream.available();
			}
			catch(IOException e){
				//the stream is closed, open it again
				this.headerJsStream=RaxHeaderService.class.getResourceAsStream("header-service.js");
			}			
		}
		return this.headerJsStream;
	}
	
	//Needed for JUnit testing
	public void setHeaderJsStream(InputStream inny){
		this.headerJsStream=inny;
	}
	
	public InputStream getLatestJQuery(){
		if(this.latestJQuery==null){
			this.latestJQuery=RaxHeaderService.class.getResourceAsStream("latestJQuery.js");
		}
		else{
			try{
				this.latestJQuery.available();
			}
			catch(IOException e){
				//the stream is closed, open it again
				this.latestJQuery=RaxHeaderService.class.getResourceAsStream("latestJQuery.js");
			}			
		}
		return this.latestJQuery;
	}
	
	//Needed for JUnit testing
	public void setLatestJQuery(InputStream latestJQuery){
		this.latestJQuery=latestJQuery;
	}
	
	public InputStream getLatestJQueryUI(){
		if(this.latestJQueryUI==null){
			this.latestJQueryUI=RaxHeaderService.class.getResourceAsStream("latestJQueryUI.js");
		}
		else{
			try{
				this.latestJQueryUI.available();
			}
			catch(IOException e){
				//the stream is closed, open it again
				this.latestJQueryUI=RaxHeaderService.class.getResourceAsStream("latestJQueryUI.js");
			}			
		}
		return this.latestJQueryUI;
	}
	
	//Needed for JUnit testing
	public void setLatestJQueryUI(InputStream latestJQueryUI){
		this.latestJQueryUI=latestJQueryUI;
	}
	
	@GET
	@Produces("application/javascript")
    @Path("/raxheaderservice.js")
	public String getHeaderJavascript(@Context HttpServletRequest request, @Context HttpServletResponse resp,
			@DefaultValue("raxheaderfooterservice-headercontent") @QueryParam("headerdivid")String headerdivid, 
			@DefaultValue("raxheaderfooterservice-footercontent") @QueryParam("footerdivid") String footerdivid,
			@DefaultValue("content") @QueryParam("contentdivid")String contentdivid, 
			@DefaultValue("all") @QueryParam("filter") String filter,
			@DefaultValue("api") @QueryParam("team") String team,
			@DefaultValue("content-services.rackspace.com") @QueryParam("servername") String servername,
			@DefaultValue("false") @QueryParam("debug") String debug,
			@DefaultValue("false") @QueryParam("includejq") String includejq,
			@DefaultValue("false") @QueryParam("includejqui") String includejqui,
			@DefaultValue("//") @QueryParam("protocol") String protocol){
		
		String METHOD_NAME="getHeaderJavascript()";

		String serverName=request.getServerName();
		String env="production";
		
		if(null!=serverName&&serverName.toLowerCase().contains("staging")){
			env="staging";
		}
		
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": START: ");
			log.debug(METHOD_NAME+": headerdivid="+headerdivid);
			log.debug(METHOD_NAME+": footerdivid="+footerdivid);
			log.debug(METHOD_NAME+": contentdivid="+contentdivid);
			log.debug(METHOD_NAME+": filter="+filter);
			log.debug(METHOD_NAME+": team="+team);
			log.debug(METHOD_NAME+": servername="+servername);
			log.debug(METHOD_NAME+": debug="+debug);
			log.debug(METHOD_NAME+": includejq="+includejq);
		    log.debug(METHOD_NAME+": includejqui="+includejqui);
		    log.debug(METHOD_NAME+": protocol="+protocol);
		    log.debug(METHOD_NAME+": env="+env);
		}
		if(protocol.equals("http")){
			protocol="http://";
		}
		else if(protocol.equals("https")){
			protocol="https://";
		}
		else{
			protocol="//";
		}
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": protocol="+protocol);
		}
		String retVal="";
		
		String key=(headerdivid+footerdivid+contentdivid+filter+team+servername+debug+includejq+includejqui+
				    protocol+env);
		String hashKey=""+key.hashCode();
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": key="+key);
			log.debug(METHOD_NAME+": hashKey="+hashKey);
			log.debug(METHOD_NAME+": (!headersMap.containsKey(hashKey))="+(!headersMap.containsKey(hashKey)));
		}
		
		if(!RaxHeaderService.javascriptsMap.containsKey(hashKey)){			
			String retStr="";
		    try {               	  
		    	InputStream jsStream=this.getHeaderJsStream();
		    	retStr=getFileContents(jsStream);
				String replacedContentId=retStr.replaceAll("~!@#contentdivid#@!~", contentdivid);
				String replacedTeam=replacedContentId.replaceAll("~!@#team#@!~", team);
				String replacedHeaderId=replacedTeam.replaceAll("#~!@#headerdivid#@!~", ("#"+headerdivid));
				String replacedFooterId=replacedHeaderId.replaceAll("#~!@#footerdivid#@!~", ("#"+footerdivid));
				String replacedFilter=replacedFooterId.replaceAll("~!@#filter#@!~", filter);  
				
				String replaceEnv=replacedFilter.replaceAll("~!@#env#@!~", env);					
				String replacedServer=replaceEnv.replaceAll("~!@#servername#@!~", servername); 			
				
				//Now get the style.html file
				InputStream styleStream=this.getStyleStream();
				String styleContent=getFileContents(styleStream);
				String replaceStyleContent=replacedServer.replaceAll("~!@#haasstyle#@!~", this.compressHtml(styleContent));
				
				//Now get the Header.html file
				InputStream htmlStream=this.getHtmlStream();
				String insertHeaderContent=getFileContents(htmlStream);
				String replaceHeaderContent=replaceStyleContent.replaceAll("~!@#headervalue#@!~", this.compressHtml(insertHeaderContent));
				
				//Now get the Footer.html file
				InputStream footerStream=this.getFooterStream();
				String insertFooterContent=getFileContents(footerStream);	
				SimpleDateFormat simpleDateFormatter=new SimpleDateFormat("yyyy");
				Date currentYear=new Date(System.currentTimeMillis());
				String year=simpleDateFormatter.format(currentYear);
				insertFooterContent=insertFooterContent.replace("~~~YYYY~~~", year);
				String replaceFooterContent=replaceHeaderContent.replaceAll("~!@#footervalue#@!~", this.compressHtml(insertFooterContent));	
								
				String replacedProtocol=replaceFooterContent.replaceAll("~!@#http://#@!~", protocol); 
				
				if(includejq.equalsIgnoreCase("true")){
					InputStream jqueryStream=this.getLatestJQuery();
					String insertJQStr=getFileContents(jqueryStream);
					
					StringBuffer retStrBuff=new StringBuffer("");
					int startInsertIndex=replacedProtocol.indexOf("(function(){");
					if(-1!=startInsertIndex){
						retStrBuff.append(replacedProtocol.substring(0,(startInsertIndex+"(function(){".length())));
						retStrBuff.append(" ");
						retStrBuff.append(insertJQStr);						
						retStrBuff.append(" ");
						if(includejqui.equalsIgnoreCase("true")){
							InputStream latestJQueryUI=this.getLatestJQueryUI();
							String jqueryUIInsert=getFileContents(latestJQueryUI);
							retStrBuff.append(jqueryUIInsert);
							retStrBuff.append(" ");	 
						}
						retStrBuff.append(replacedProtocol.substring((startInsertIndex+("(function(){".length()))));
						retStrBuff.append("\n");
					}

					replacedProtocol=retStrBuff.toString();					
				}	
				
				if(debug.equals("false")){
					//Compress the javascript
					StringReader strReader=new StringReader(replacedProtocol);
					StringWriter strWriter=new StringWriter();

					//Only compress the javascript at this point, do not call this.compressHtml(String)
					JavaScriptCompressor comp=new JavaScriptCompressor(strReader, new SystemOutErrorReporter());
					comp.compress(strWriter, -1, true, false, false, false);

					retVal=strWriter.toString();
				}
				else{
					retVal=replacedProtocol;
				}
		    } 
		    catch (EvaluatorException e) {
				e.printStackTrace();
			} 
		    catch (IOException e) {
				e.printStackTrace();
			}
			
		    //Double check to make sure that the headerMap doesn't contain the key
		    //We don't care if another thread comes in and adds a value with the same key
		    //our call would just update it, but we don't want to lock the Map object
		    if(!RaxHeaderService.javascriptsMap.containsKey(hashKey)){
		    	RaxHeaderService.javascriptsMap.put(hashKey,retVal);
		    }
		}
		else{
			retVal=RaxHeaderService.javascriptsMap.get(hashKey);
		}
		
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": START");
		}
		return retVal;		
	}

	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getheader")
	public String getHeaderOrFooter(@Context HttpServletRequest request, @Context HttpServletResponse response, 
			@DefaultValue("api") @QueryParam("team")String team,
			@DefaultValue("false") @QueryParam("debug")String debug,
			@DefaultValue("false") @QueryParam("footer")String footerStr){
		String METHOD_NAME="getHeader()";
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": START: team="+team+" debug="+debug+" footerStr="+footerStr);
		}
		String headerOrigin=request.getHeader("Origin");
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": headerOrigin="+headerOrigin);
		}
		String serverName=request.getServerName();
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": serverName="+serverName);				
		}
		if(null!=headerOrigin ){//&& (headerOrigin.toLowerCase()).endsWith("rackspace.com")){
			response.setHeader("Access-Control-Allow-Origin", headerOrigin);
		}
		else{
			response.setHeader("Access-Control-Allow-Origin", serverName);
		}
		//response.setHeader("Access-Control-Allow-Origin", "http://docs-staging.rackspace.com");
		JSONObject retVal=new JSONObject();
		
		log.info(METHOD_NAME+":"+" footerStr="+footerStr);
		
		//This is a header request
		if(null==footerStr||footerStr.equalsIgnoreCase("false")){
			getHeader(retVal,team,debug);
		}
		//This is a footer request
		else if(footerStr.equalsIgnoreCase("true")){
			getFooter(request,retVal,team,debug);
		}
		
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": END:");
		}
		return retVal.toString();
	}

	private void getFooter(HttpServletRequest request, JSONObject jsonObj, String team, String debug){
		String METHOD_NAME="getFooter()";
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": START: team="+team+" debug="+debug);
		}
		//Get the browser id
		String userAgent=request.getHeader("User-Agent");
		String key=userAgent+"-"+debug;
		if(log.isDebugEnabled()){
		    log.debug(METHOD_NAME+":userAgent="+userAgent);
		    log.debug(METHOD_NAME+":key="+key);
		}
		//We only load the footer text if it is null
		if(!RaxHeaderService.footersMap.containsKey(key)){
			String footerDetails=getFooterDetails(userAgent);			
			if(debug.equals("false")){
				//Double check to make sure that the key still does not exist
			    //We don't care if another thread comes in and adds a value with the same key
			    //our call would just update it, but we don't want to lock the Map object
				if(!RaxHeaderService.footersMap.containsKey(key)){
					RaxHeaderService.footersMap.put(key,footerDetails);
				}
			}
			else{
				//Double check to make sure that the key still does not exist
			    //We don't care if another thread comes in and adds a value with the same key
			    //our call would just update it, but we don't want to lock the Map object				
				if(!RaxHeaderService.footersMap.containsKey(key)){
					RaxHeaderService.footersMap.put(key,compressHtml(footerDetails));
				}
			}			
		}
		//By the time we get here the key-value pair should always be in the Map
		try {
			jsonObj.put("html", RaxHeaderService.footersMap.get(key));
			if(null==team){
				team="none";
			}
			jsonObj.put("team", team);
		} 
		catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}	
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": END:");
		}
	}
	
	private String getFooterDetails(String userAgent){
		StringBuffer retVal=new StringBuffer("");
		String METHOD_NAME="getFooterDetails()";
		InputStream inny=this.getFooterStream();//RaxHeaderService.class.getResourceAsStream("Footer.html");
		if(null!=inny){	
			try {				
			    InputStreamReader reader=new InputStreamReader(inny);
			    BufferedReader buffReader=new BufferedReader(reader);
				String readLine=null;
				int lineNumber=1;
				boolean foundYearPart=false;
				boolean foundFireFoxPartPhoneid=false;
				//boolean foundFireFoxpartAfterPhone=false;
				while(null!=(readLine=buffReader.readLine())){
					if(!foundYearPart && lineNumber>100){
						int index=readLine.indexOf(DATE_DELIMITER_IN_FOOTER_HTML);
						if(-1!=index){
							SimpleDateFormat simpleDateFormatter=new SimpleDateFormat("yyyy");
							Date currentYear=new Date(System.currentTimeMillis());
							String year=simpleDateFormatter.format(currentYear);
						    String firstPart=readLine.substring(0,index);
						    String secondPart=readLine.substring((index+(DATE_DELIMITER_IN_FOOTER_HTML.length())));
						    readLine=firstPart+year+secondPart;
							foundYearPart=true;
						}							
					}					
					if(!foundFireFoxPartPhoneid){
						if(readLine.contains("#rax-rug-wrap")){
							if(log.isDebugEnabled()){
							    log.debug(METHOD_NAME+":(null!=userAgent && (userAgent.toLowerCase().contains(\"chrome\")) )="+
							    		(null!=userAgent && (!userAgent.toLowerCase().contains("chrome")) ));
							}
							//This is NOT chrome
							if(null!=userAgent && (!userAgent.toLowerCase().contains("chrome")) ){
								readLine="#rax-rug-wrap{background-color:#335687;border:0;color:#fff;font-family:RobotoLight,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.3em;margin:0;padding:21px 0 12px;}";																		          
							}
							foundFireFoxPartPhoneid=true;
						}						
					}
					retVal.append(readLine);
					retVal.append(" ");
					++lineNumber;
				}			
				buffReader.close();
				reader.close();
				inny.close();
			} 
			catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}		
		return retVal.toString();
	}
	
	private void getHeader(JSONObject jsonObj, String team, String debug){
		String METHOD_NAME="getHeader()";
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": START: team="+team+" debug="+debug);
		}
		String key=team+debug;
		StringBuffer temp=new StringBuffer("");
		if(!RaxHeaderService.headersMap.containsKey(key)){	
			InputStream inny=this.getHeaderJsStream();//RaxHeaderService.class.getResourceAsStream("Header.html");
			if(null!=inny){
				int aChar=-1;
				char aCharChar=' ';
				try {
					while(-1!=(aChar=inny.read())){
						aCharChar=(char)aChar;
						if(aCharChar=='"'){
							aCharChar='\"';
						}
						temp.append(aCharChar);
					}
					inny.close();
					if(debug.equals("false")){
						//Double Check to make sure the key is not in the map
					    //We don't care if another thread comes in and adds a value with the same key
					    //our call would just update it, but we don't want to lock the Map object	
						if(!RaxHeaderService.headersMap.containsKey(key)){
							//Now we need to compress the html												
							RaxHeaderService.headersMap.put(key,compressHtml(temp.toString()));
	
						}
					}
					else{
						//Double Check to make sure the key is not in the map
					    //We don't care if another thread comes in and adds a value with the same key
					    //our call would just update it, but we don't want to lock the Map object	
						if(!RaxHeaderService.headersMap.containsKey(key)){
							RaxHeaderService.headersMap.put(key,temp.toString());
						}
					}
				} 
				catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		else{
			temp=new StringBuffer(RaxHeaderService.headersMap.get(key));
		}
		try {
			jsonObj.put("key", key);
			jsonObj.put("html", temp.toString());
			if(null==team){
				team="api";
			}
			jsonObj.put("team", team);
		} 
		catch (JSONException e) {
			e.printStackTrace();
		}	
		if(log.isDebugEnabled()){
			log.debug(METHOD_NAME+": END:");
		}
	}
	
	private String compressHtml(String html){
		String retVal="";
		if(null!=html){
			HtmlCompressor compressor=new HtmlCompressor();
			compressor.setEnabled(true);
			compressor.setRemoveComments(true);
			compressor.setRemoveMultiSpaces(true);
			compressor.setRemoveIntertagSpaces(true);
			compressor.setCompressCss(true);
			compressor.setCompressJavaScript(true);		

			retVal=compressor.compress(html);
		}
		return retVal;
	}
	
	
	private String getFileContents(InputStream inny)throws IOException{
	    String retVal="";
	    if(null!=inny){
	    	int readInt=-1;
	    	char readChar;
	    	StringBuffer tempBuff=new StringBuffer("");
	    	while(-1!=(readInt=inny.read())){
	    		readChar=(char)readInt;
	    		if(readChar=='"'){
	    			//must use tempBuff.append("\""); instead of tempBuff.append('"');
	    			tempBuff.append("\"");
	    		}
	    		else{
	    			tempBuff.append(readChar);
	    		}
	    	}
	    	inny.close();
	    	retVal=tempBuff.toString();
	    }
		return retVal;
	}
}
