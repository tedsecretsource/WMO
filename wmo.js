/*
Copyright (C) 2002 Ted Stresen-Reuter

This program is free software; you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation; either version 2 of the License, or (at your
option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
59 Temple Place, Suite 330, Boston, MA 02111-1307 USA

*/

var wmo_debugData

// simulator for the all property
if ( !document.all )
{
	Node.prototype.__defineGetter__("all", function()
		{
			if ( document.getElementsByTagName("*").length )
			{
				switch ( this.nodeType )
				{
					case 9:
						return document.getElementsByTagName("*")
						break
					case 1:
						return this.getElementsByTagName("*")
						break
				}
			}
			return ""
		})
	Node.prototype.__defineSetter__( "all", function() {} )
}

// pop the copyright
function popCopyright ()
{
	var body = 'WMO version 1, Copyright (C) 2002 Ted Stresen-Reuter comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions; click \'copyright\' for details.'
	this.location = ''
	this.height = 
	this.width = 
	this.align = 
	this.valign = 
	this.onBlur = 
	this.popSizedWindow('')
}

// string trim utility function
function wmo_trim( str )
{
    var space = /^\s+|\s+$/
    var text = str
    
    while ( space.test( text ) )
    {
        text = text.replace(space, "")
    }

    return text
}

function wmo_convertPercentToPixels ( input )
{
    var re = /\%{1}$/   // trap for a % at the end
    var prop = input

    if ( re.test(prop) )
    {
        prop = prop.substring(0, prop.length - 1)
        prop = screen.availWidth * (prop / 100)
        prop = Math.round(prop) - 1    // -1 to round down
    }
	return prop
}

// get properties of an object function
function wmo_getVersion ()
{
	return '1.0.5a'
}

// get properties of an object function
function wmo_getProps ( obj, label )
{
    if ( typeof obj == "object" )
    {
        var props = ''
        for ( var i in obj )
        {
            props += label + '.' + i + ' = ' + obj[i] + '<br />'
        }
    }
    else
    {
        props = 'Passed a non-object to wmo_getProps()'
    }
    return props+'<br />'
}

function wmo_getClient ()
{
    // returns an object with more standard properties for each navigator client
    // used when setting the size and alignment of windows (because some clients don't include chrome in their dimensions)
    // tested on a variety of browsers (IE 5.0, 5.21, 6, Opera 5, iCab 2.8, OmniWeb 4, Mozilla 1, Chimera 0.2, 0.4, Netscape Navigator 6.2, and Navigator 4.51), but mostly on the Macintosh
    
    // objects properties are:
    //      - mozVersion: the first part of the userAgent string, usually Mozilla/4.5
    //      - mozMajorVersion: the '4' in the example above
    //      - mozMinorVersion: the '5' in the example above
    //      - type: NN or MSIE. This is just a shortcut for finding out if we might be dealing with the NN or MSIE rendering engine
    //      - model (object)
    //          - model.name = the name used by people to identify browsers: e.g.: Navigator, iCab, MSIE, Opera, OmniWeb, etc.
    //          - model.majorVersion = the major version number
    //          - model.minorVersion = the revision number, may include periods so be careful when comparing to numbers
    //      - debug: some text output for identifying problems with this script. May be used by calling document.write( nav.debug )
    //
    // Note:    Versions of Netscape Navigator prior to version 6 may be returned as "unknown", but with major and minor versions.
    //          Versions of Mozilla will probably have "Gecko" as the model.name, the year as model.majorVersion, and the month/date as the minorVersion
    
    // get the beginning, middle and end of the userAgent
    var nav = new Object()
    
    nav.re = /(.*)\((.*)\)(.*)/
    nav.debug = ""
    nav.ua = navigator.userAgent
    nav.appName = navigator.appName
    nav.platform = navigator.platform
    if ( nav.re.test( nav.ua ) )
    {
    	// the userAgent is of a "standard" format
		nav.uaParts = nav.ua.match(nav.re)
    }
    else
    {
    	// the userAgent is NOT a standard format and all other tests will fail
    	nav.model = new Object()
    	nav.model.name = "unknown"
    	nav.model.majorVersion = "unknown"
    	nav.model.minorVersion = "unknown"
    	return true
    }
    
    for ( var i = 0; i < nav.ua.length; i++ )
    {
        nav.ua[i] = wmo_trim(nav.ua[i])
        nav.uaParts.i = nav.ua[i]
    }
    
    // set the Mozilla version
    if ( nav.uaParts[1].indexOf('Mozilla') == 0 )
    {
        mozVersion = nav.uaParts[1].split("/")
        nav.mozVersion = mozVersion[1]
        nav.mozMajorVersion = nav.mozVersion.split('.')	// might be necessary if they use commas instead of periods
        nav.mozMinorVersion = nav.mozMajorVersion[1]
        nav.mozMajorVersion = nav.mozMajorVersion[0]
    }
    else
    {
        nav.mozVersion = "-1"
    }
    
    // set the browser type: NN or MSIE
    switch ( nav.appName )
    {
        case "Netscape":
            nav.type = "NN"
            break
        default:
            nav.type = "MSIE"
            break
    }
    
    // set the browser model and browser versions
    
    // look for a recognized model in usParts[2] (in between the parentheses)
    var re = /msie|icab|omniweb/i
    var uaPart2 = nav.uaParts[2].match( re )
    
    setModel: if ( uaPart2 )
    {
        // a match was found
        switch ( uaPart2[0] )
        {
            case "MSIE":
                nav.model = new Object()
                if ( nav.uaParts[3] && nav.uaParts[3].indexOf('Opera') > -1 )	// make sure it's not opera
                {
                    nav.model.name = "Opera"
                }
                else
                {
                    nav.model.name = "MSIE"
                }
                var modelAndVersion = nav.uaParts[2].split('; ')
    
                if ( modelAndVersion && modelAndVersion.length > 0 )
                {
                    for ( var i = 0; i < modelAndVersion.length; i++ )
                    {
                        // trap if browser is Opera
                        if ( modelAndVersion[i].indexOf('MSIE') > -1 && nav.model.name != "Opera" )
                        {
                            // the version follows the model of the browser
                            var mav = modelAndVersion[i].split(' ')
                            if ( mav.length > 0 )
                            {
                                var version = mav[1].split('.')
                                nav.model.minorVersion = version[1]
                                nav.model.majorVersion = version[0]
                                break setModel
                            }
                            else
                            {
                                if ( mav.length == 1 )
                                {
                                    nav.model.majorVersion = mav[i]
                                }
                                else
                                {
                                    nav.model.majorVersion = "unknown"
                                }
                                break setModel
                            }
                        }
                        else if ( nav.model.name == "Opera" )
                        {
                            var uaPart3 = wmo_trim(nav.uaParts[3])
                            uaPart3 = uaPart3.split(' ')
                            var versions = uaPart3[1].split('.')
                            nav.model.majorVersion = versions[0]
                            nav.model.minorVersion = versions.join('.')
                            nav.model.minorVersion = nav.model.minorVersion.substr(2)
                            break setModel
                        }
                    }
                }
                break
            case "iCab":
                nav.model = new Object()
                nav.model.name = "iCab"
                var modelAndVersion = nav.uaParts[2].split('; ')
    
                if ( modelAndVersion && modelAndVersion.length > 0 )
                {
                    for ( var i = 0; i < modelAndVersion.length; i++ )
                    {
                        if ( modelAndVersion[i].indexOf('iCab') > -1 )
                        {
                            modelAndVersion = modelAndVersion[i].split(' ')
                            if ( modelAndVersion.length > 0 )
                            {
                                modelAndVersion = modelAndVersion[1].split('.')
                                nav.model.minorVersion = modelAndVersion.join('.')
                                nav.model.minorVersion = nav.model.minorVersion.substr(2)
                                nav.model.majorVersion = modelAndVersion[0]
                                break setModel
                            }
                            else
                            {
                                if ( modelAndVersion.length == 1 )
                                {
                                    nav.model.majorVersion = modelAndVersion[i]
                                }
                                else
                                {
                                    nav.model.majorVersion = "unknown"
                                }
                            }
                        }
                    }
                }
                break
            case "omniweb":
                nav.model = new Object()
                nav.model.name = "OmniWeb"
                var modelAndVersion = nav.uaParts[2].split('; ')
    
                if ( modelAndVersion && modelAndVersion.length > 0 )
                {
                    for ( var i = 0; i < modelAndVersion.length; i++ )
                    {
                        if ( modelAndVersion[i].indexOf('OmniWeb') > -1 )
                        {
                            modelAndVersion = modelAndVersion[i].split('/')
                            if ( modelAndVersion.length > 0 )
                            {
                                modelAndVersion = modelAndVersion[1].split('.')
                                nav.model.minorVersion = modelAndVersion.join('.')
                                nav.model.minorVersion = nav.model.minorVersion.substr(2)
                                nav.model.majorVersion = modelAndVersion[0]
                                break setModel
                            }
                            else
                            {
                                if ( modelAndVersion.length == 1 )
                                {
                                    nav.model.majorVersion = modelAndVersion[i]
                                }
                                else
                                {
                                    nav.model.majorVersion = "unknown"
                                }
                            }
                        }
                    }
                }
                break
        }
    }
    else
    {
        // no model recognized in uaParts[2], check uaParts[3] for model information
        nav.uaParts[3] = wmo_trim( nav.uaParts[3] )
        re = /\s/g
        
        // split up the remaining parts of userAgent
        var modelParts = nav.uaParts[3].split(re)
        nav.model = new Object()
        
        if ( modelParts && modelParts[0].length > 0 )
        {
            // there is a match for stuff following the parentheses
            var nmp = ""
            
            // inspect each element
            for ( i = 0; i < modelParts.length; i++ )
            {
                nmp = modelParts[i].split('/')
                switch ( nmp[0] )
                {
                    case "Netscape6":
                        nav.model.name = "Navigator"
                        nav.model.majorVersion = nmp[1].substring(0, 1)
                        nav.model.minorVersion = nmp[1].substring(2, nmp[1].length)
                        break setModel
                    default:
                        nav.model.name = nmp[0]
                        nav.model.majorVersion = nmp[1].substring(0, 4)
                        nav.model.minorVersion = nmp[1].substring(4, nmp[1].length)
                        break
                }
            }
        }
        else
        {
            // nothing follows the parentheses
            nav.model.name = 'unknown'
            nav.model.majorVerion = nav.mozMajorVersion
            nav.model.minorVersion = nav.mozMinorVersion
        }
    }
    
    for ( var i in nav )
    {
        if ( i != "debug" )
        {
            nav.debug += 'navigator.' + i + ' = ' + nav[i] + '<br />'
            if ( typeof nav[i] == "object" )
            {
                nav.debug += '<br />' + wmo_getProps( nav[i], '    navigator.'+i )
            }
        }
    }
    return nav
}

function wmo_getCode()
{
    var re = /wmo_dev_tool\.html$/i
    if ( re.test( location ) )
    {
        var form = document.forms[0]
        
        // prints the code the end user should include in his/her main page to generate the desired window
        var output = "// No attributes have been set.<br>"
        
        // this is the type of window to open
        var method = form.type.options[form.type.selectedIndex].value
        var align = "'" + form.alignment.options[form.alignment.selectedIndex].value + "'"
        this.align = form.alignment.options[form.alignment.selectedIndex].value

        // display options (if necessary) with current myWin values, for selected method
        switch ( method )
        {
            case "maximized":
                document.all.maximizedOptions.style.display = 'block'
                document.all.sizedOptions.style.display = 'none'
                this.width = null
                form.width.value = ''
                this.height = null
                form.height.value = ''
                align = ''
                method = 'popMaxWindow'
                break
            case "sized":
                document.all.maximizedOptions.style.display = 'none'
                document.all.sizedOptions.style.display = 'block'
                
                method = 'popSizedWindow'
                break
            default:
                document.all.maximizedOptions.style.display = 'block'
                document.all.sizedOptions.style.display = 'none'
                break
        }

        // update the location if needed
        if ( form.location.value == "" )
        {
            this.location = '<html>\n<head>\n<title>'+this.title+'<\/title><\/head><body><\/body><\/html>'
        }
        else
        {
            this.location = form.location.value
        }

        // get attributes of myWin and stuff output
        var winAttsStr = new Array()

        output = '//*******************************************************************\n'
        output += '//  This code produced by WMO and copyright 2002 Ted Stresen-Reuter\n'
        output += '//  This code may be used in agreement with the GPL license found\n'
        output += '//  at http://www.tedmasterweb.com/wmo/license.txt\n'
        output += '//  To learn how to use this code in your site, visit\n'
        output += '//  http://www.tedmasterweb.com/wmo/\n'
        output += '//  This code produced by version 1.0.5 of the WMO development tool.\n'
        output += '//  Currently running version ' + this.getVersion() + ' of wmo.js.\n'
        output += '//******************************************************************/\n\r'
        output += '    var myWin = new wmo_window();\n\r'
        for ( var i = 0; i < form.elements.length; i++ )
        {
            // update display of standard window attributes
            if ( form.elements[i] &&
                ( form.elements[i].name != 'widthUnit'
                    && form.elements[i].name != 'heightUnit'
                    && form.elements[i].name != 'type'
                    && form.elements[i].name != 'launchMethod') )
            {
                if ( form.elements[i].name == 'location' )
                {
                    // don't display html if location.value == ""
                    if ( this.location.indexOf('<html') > -1 )
                    {
                        // no need to set this[i] here, it was set above
                        winAttsStr[winAttsStr.length] = form.elements[i].name + " = ''"
                    }
                    else
                    {
                        winAttsStr[winAttsStr.length] = form.elements[i].name + " = '" + form.elements[i].value + "'"
                    }
                }
                else
                {
                    switch ( form.elements[i].type )
                    {
                        case "checkbox":
                            // this is a checkbox, probably a standard window attribute
                            if ( form.elements[i].checked == true)
                            {  
                                // add this property to the object as a property and set it's value
                                this[form.elements[i].name] = '1'
                                
                                // append this property to the output
                                winAttsStr[winAttsStr.length] = form.elements[i].name + " = '1'"
                            }
                            else
                            {
                                // remove this property from the object
                                this[form.elements[i].name] = null
                            }
                            break
                        case "select":
                            // this is a checkbox, probably a standard window attribute
                            this[form.elements[i].name] = form.elements[i].options[form.elements[i].selectedIndex].value
                                
                            // append this property to the output
                            winAttsStr[winAttsStr.length] = form.elements[i].name + " = '"+form.elements[i].options[form.elements[i].selectedIndex].value+"'"
                            break
                        default:
                            if ( form.elements[i].value != '' )
                            {
                                if ( form.elements[i].name == 'width' || form.elements[i].name == 'height' )
                                {
                                    var val
                                    if ( form.elements[i].name == 'width' )
                                    {
                                        if ( form.widthUnit.options[form.widthUnit.selectedIndex].value == 'percent' )
                                        {
                                            val = form.width.value + '%'
                                        }
                                        else
                                        {
                                            val = form.width.value
                                        }
                                        this.width = val
                                    }
                                    else
                                    {
                                        if ( form.heightUnit.options[form.heightUnit.selectedIndex].value == 'percent' )
                                        {
                                            val = form.height.value + '%'
                                        }
                                        else
                                        {
                                            val = form.height.value
                                        }
                                        this.height = val
                                    }
                                    winAttsStr[winAttsStr.length] = form.elements[i].name + " = '" + val + "'"
                                }
                            }
                    }
                }
            }
        }

        var winAtts = winAttsStr.join(";\n    myWin.")
        winAtts = '\n    myWin.' + winAtts + ';\n'
        output += winAtts
        
        // get launch method and write appropriate code
        if ( form.launchMethod.value == 'link' )
        {
            var lm = '&lt;a href="#" onClick="javascript: void( myWin.'+method+'('+align+') );"&gt;Click to launch window&lt;/a&gt;'
            document.all.lmlabel.innerHTML = 'Use the following A tag in your page.'
        }
        else
        {
            var lm = '&lt;body onLoad="myWin.'+method+'('+align+');"&gt;'
            document.all.lmlabel.innerHTML = 'Modify your BODY tag to appear as shown.'
        }
        
        // display output
        document.all.output.innerHTML = output
        document.all.lm.innerHTML = lm
    }
}

function wmo_popSample()
{
    var form = document.forms[0]
    var method = form.type.options[form.type.selectedIndex].value
    switch ( method )
    {
        case "maximized":
            this.popMaxWindow()
            break
        case "sized":
            this.popSizedWindow( this.align )
            break
    }
}

function wmo_doNothing()
{
    return true
}

function wmo_debug()
{
    var debug = ""
    var dobg = false
    var bypassNativeWinProps = false
    var bgstyle = " style='background-color: #EEEEEE;'"
    
    // set the bypass flag so that browsers that don't support the this.winref[i] method don't fail
    // First we test for IE 6 (the sniffer will need to be updated to include platform if Microsoft releases 6 for Macintosh
    if (  this.nav.platform.indexOf('Win') > -1 && this.nav.model.name == 'MSIE' 
            && (parseFloat(this.nav.model.majorVersion) == 5 && parseFloat(this.nav.model.minorVersion) > 4 ||
                parseFloat(this.nav.model.majorVersion) == 6 ) )
    {
        bypassNativeWinProps = true
    }
    else
    {
       bypassNativeWinProps = false
    }
    

    // get the properties, and their values, of the native window object
    if ( this.winref && !this.winref.closed )
    {
        this.printDebug == true ? alert(this.name+".winref = " + !this.winref.closed+". It should be true.") : ""
        debug += "<p style='font-size: 18pt; font-family: Verdana, Arial, Helvetica;'>" + this.name + " Debug<\/p>"
        debug += "<p>" + this.name + " native  properties (accessible via winref):<\/p><p style='padding-left: 24pt;'><table border=1 cellpadding=4 cellspacing=0 width='90%'>"
        debug += "<tr><td style='background-color: #333333; color: #EEEEEE;'>Property<\/td><td style='background-color: #333333; color: #EEEEEE;'>Value<\/td><\/tr>"
        var winObj = this.winref
        this.printDebug == true ? alert("The winObj is " + winObj) : ""
        
        if ( bypassNativeWinProps == false )
        {
            // PROBLEM: IE Windows (Mac just crashes) returns a fatal error when trying to run var i in this.winref.
            //          The error is "No such interface supported". It appears to be a security issue: You cannot enumerate the properties and methods of a window object from another window, even if the second window is child of the first window.
            for ( var i in this.winref )
            {
                this.printDebug == true ? alert("Testing " + i) : ""
                // work around bug in IE, not even sure if this is necessary...
                if (i != "domain")
                {
                    if ( bgstyle.length == 0 )
                    {
                        bgstyle = " style='background-color: #EEEEEE;'"
                    }
                    else
                    {
                        bgstyle = ""
                    }
                
                    debug +=  "<tr><td"+bgstyle+" valign='top'><b>"
                    if ( i != "fullScreen" )
                    {
                        debug += i + "<\/b><\/td><td"+bgstyle+">" + this.winref[i]
                        if ( typeof this.winref[i] == "object" && (i == "menubar" 
                            || i == "toolbar" 
                            || i == "locationbar"
                            || i == "frames"
                            || i == "screen"
                            || i == "content"
                            || i == "personalbar"
                            || i == "statusbar") )
                        {
                            debug += '<br />'
                            var winObj = this.winref[i]
                            for ( var j in winObj )
                            {
                                if ( j != "fullScreen" )
                                {
                                    debug += i+'.'+j+' = '+winObj[j]+'<br />'
                                }
                            }
                        }
                    }
                    else
                    {
                        debug += "fullScreen<\/b><\/td><td"+bgstyle+">Unable to get value. No info available."
                    }
                }
                debug += "<\/td><\/tr>"
            }
        }
        else
        {
            debug += "<tr><td colspan='2'>This browser, "+this.nav.appName+" version "+this.nav.model.majorVersion+"."+this.nav.model.minorVersion+", does not allow this script to inspect the properties of "+this.name+".winref (the native window properties of the new window). Try using another browser or development platform.<\/td><\/tr>"
        }
        debug += "<\/table><\/p>"
    }
    else
    {
        this.printDebug == true ? alert("sized window is closed. winref properties should not be set.") : ""
    }
    
    debug += "<p>" + this.name + " custom properties<\/p><p style='padding-left: 24pt;'><table border=0 cellpadding=4 cellspacing=0 width='90%'>"
    debug += "<tr><td style='background-color: #333333; color: #EEEEEE;'>Property<\/td><td style='background-color: #333333; color: #EEEEEE;'>Value<\/td><\/tr>"
    bgstyle = ""
    counter = 0
    
    // get the properties, and their values, of the meta-object
    this.printDebug == true ? alert("About to walk through the meta-object properties") : ""

    for ( var i in this )
    {
        if ( typeof this[i] != "function" )
        {
            if ( bgstyle.length == 0 )
            {
                bgstyle = " style='background-color: #EEEEEE;'"
            }
            else
            {
                bgstyle = ""
            }
            
            this.debugPrint == true ? alert("The value of " + i + " is " + this[i] + " and typeof is " + typeof this[i]) : ''
            debug += "<tr><td"+bgstyle+" valign='top'>"
            debug += "<b>" + i + ":<\/b><\/td><td"+bgstyle+">" + this[i]
            if ( typeof this[i] == "object" )
            {
                debug += '<br />'
                var winObj = this[i]
                for ( var j in winObj )
                {
                    if ( j != "fullScreen" && i != "debugWin" && i != "winref" && j != "debug")
                    {
                        debug += i+'.'+j+' = '+winObj[j]+'<br />'
                    }
                }
            }
            debug += "<\/td><\/tr>"
        }
    }
    
    debug += "<\/table><\/p>"
    return debug
}

function wmo_popDebug ()
{
    this.printDebug == true ? alert("Entered popDebug()") : ""
    
    // 1: create the debug window if not already open
    if ( !this.debugWin || this.debugWin.winref.closed ) // debugWin doesn't already exist
    {
        this.printDebug == true ? alert("debugWin doesn't already exist, creating window") : ""
        this.debugWin = new wmo_window()
        this.debugWin.scrollbars = "1"
        this.debugWin.resizable = "1"
        this.debugWin.dependent = "1"
        this.debugWin.status = "1"
        this.debugWin.width = Math.round(screen.availWidth / 3)
        this.debugWin.height = screen.availHeight
        this.debugWin.popSizedWindow( "right" )
        this.debugWin.winref.moveTo(this.debugWin.left, this.top)
        this.debugWin.winref.resizeTo(this.debugWin.width,window.screen.availHeight)
    }
    else
    {
        this.printDebug == true ? alert("Debug window already exists.") : ""
    }
    
    this.printDebug == true ? alert("Debug window created. About to fill with html.") : ""
    // Ideally the rest of the function would be broken out into a separate function
    // but I can't figure out how to properly set this next line so that it works
    // this.debugWin.winref.setTimeout("popDebugPart2", 50)
    var head = "<html><head><title>Debug<\/title><\/head><body>"
    var tail = "<\/body><\/html>"
    var debugWinStyle = "<style>p{font-family: Arial, Helvetica, 'sans serif'; font-size: 9pt;}td{font-family: Arial, Helvetica, 'sans serif'; font-size: 8pt;}<\/style>"
    this.debugWin.winref.document.open()
    this.debugWin.winref.document.write(head + debugWinStyle + "<div id='debugBody'>Gathering data...<\/div>" + tail)
    this.debugWin.winref.document.close()
    
    // alter this to document.all so that the code is compatible with IE 4
    if ( this.debugWin.winref.document.getElementById("debugBody") )
    {
    	// since document.all is not redefined for the debug window (just for this one) this is the workaround
		var debugValue = this.debugWin.winref.document.getElementById("debugBody")
    }
    else
    {
		var debugValue = this.debugWin.winref.document.all.debugBody
    }
    this.printDebug == true ? alert("This should be the value of debugValue.innerHTML: \n" + debugValue.innerHTML) : ""
    debugValue.innerHTML = this.debug()
}

function wmo_getWidgetSize( widget )
{
    // deferred
}

function wmo_getWinAtts ()
{
    var newWinAtts = new Array()
	// walk through each window attribute and if set, include it in newWinAtts
	for ( var i in this )
	{
	    if ( typeof this[i] != "function" && typeof this[i] != "object" )
	    {
            switch ( i )
            {
                case "channelmode":
                    newWinAtts[newWinAtts.length] = Array("channelmode", this[i] )
                    break;
                case "copyhistory":
                    newWinAtts[newWinAtts.length] = Array("copyhistory", this[i] )
                    break;
                case "dependent":
                    newWinAtts[newWinAtts.length] = Array("dependent", this[i] )
                    break;
                case "directories":
                    newWinAtts[newWinAtts.length] = Array("directories", this[i] )
                    break;
                case "fullscreen":
                    newWinAtts[newWinAtts.length] = Array("fullscreen", this[i] )
                    break;
                case "height":
                    newWinAtts[newWinAtts.length] = Array("height", this[i] )
                    break;
                case "hotkeys":
                    newWinAtts[newWinAtts.length] = Array("hotkeys", this[i] )
                    break;
                case "left":
                    newWinAtts[newWinAtts.length] = Array("left", this[i] )
                    break;
                // note that this attribute of open() is oridinarily just "location"
                // we've changed it to locationbar to differentiate it from the window.location property,
                // which is the first parameter in the window.open method
                case "locationbar":
                    newWinAtts[newWinAtts.length] = Array("locationbar", this[i] )
                    break;
                case "menubar":
                    newWinAtts[newWinAtts.length] = Array("menubar", this[i] )
                    break;
                case "outerHeight":
                    newWinAtts[newWinAtts.length] = Array("outerHeight", this[i] )
                    break;
                case "outerWidth":
                    newWinAtts[newWinAtts.length] = Array("outerWidth", this[i] )
                    break;
                case "resizable":
                    newWinAtts[newWinAtts.length] = Array("resizable", this[i] )
                    break;
                case "screenX":
                    newWinAtts[newWinAtts.length] = Array("screenX", this[i] )
                    break;
                case "screenY":
                    newWinAtts[newWinAtts.length] = Array("screenY", this[i] )
                    break;
                case "scrollbars":
                    newWinAtts[newWinAtts.length] = Array("scrollbars", this[i] )
                    break;
                case "status":
                    newWinAtts[newWinAtts.length] = Array("status", this[i] )
                    break;
                case "title":
                    newWinAtts[newWinAtts.length] = Array("title", this[i] )
                    break;
                case "toolbar":
                    newWinAtts[newWinAtts.length] = Array("toolbar", this[i] )
                    break;
                case "top":
                    newWinAtts[newWinAtts.length] = Array("top", this[i] )
                    break;
                case "width":
                    newWinAtts[newWinAtts.length] = Array("width", this[i] )
                    break;
                case "name":
                    newWinAtts[newWinAtts.length] = Array("name", this[i] )
                    break
                case "location":
                    newWinAtts[newWinAtts.length] = Array("location", this[i] )
                    break
                case "align":
                    newWinAtts[newWinAtts.length] = Array("align", this[i] )
                    break
            }
		}
	}
	return newWinAtts
}

function wmo_setWinAtts ()
{
	var newWinAtts = new Array()
	
	// walk through each window attribute and if set, include it in newWinAtts
	for ( var i in this )
	{
	    if ( typeof this[i] != "function" && typeof this[i] != "object" )
	    {
            switch ( i )
            {
                case "channelmode":
                    newWinAtts[newWinAtts.length] = "channelmode=" + this[i]
                    this.channelmoe = this[i]
                    break;
                case "copyhistory":
                    newWinAtts[newWinAtts.length] = "copyhistory=" + this[i]
                    this.copyhistory = this[i]
                    break;
                case "dependent":
                    newWinAtts[newWinAtts.length] = "dependent=" + this[i]
                    this.dependent = this[i]
                    break;
                case "directories":
                    newWinAtts[newWinAtts.length] = "directories=" + this[i]
                    this.directories = this[i]
                    break;
                case "fullscreen":
                    newWinAtts[newWinAtts.length] = "fullscreen=" + this[i]
                    this.fullscreen = this[i]
                    break;
                case "height":
                    var re = /\%{1}$/   // trap for a % at the end
                    var prop = this[i]
                    if ( re.test(prop) )
                    {
                        prop = this[i].substring(0, this[i].length - 1)
                        prop = screen.availHeight * (prop / 100)
                        prop = Math.round(prop) - 1    // -1 to round down
                        newWinAtts[newWinAtts.length] = "height=" + prop
                    }
                    else
                    {
                        newWinAtts[newWinAtts.length] = "height=" + prop
                    }
                    this.height = prop
                    break;
                case "hotkeys":
                    newWinAtts[newWinAtts.length] = "hotkeys=" + this[i]
                    this.hotkeys = this[i]
                    break;
                case "left":
                    newWinAtts[newWinAtts.length] = "left=" + this[i]
                    this.left = this[i]
                    break;
                // note that this attribute of open() is oridinarily just "location"
                // we've changed it to locationbar to differentiate it from the window.location property,
                // which is the first parameter in the window.open method
                case "locationbar":
                    newWinAtts[newWinAtts.length] = "location=" + this[i]
                    this.locationbar = this[i]
                    break;
                case "menubar":
                    newWinAtts[newWinAtts.length] = "menubar=" + this[i]
                    this.menubar = this[i]
                    break;
                case "outerHeight":
                    newWinAtts[newWinAtts.length] = "outerHeight=" + this[i]
                    this.outerHeight = this[i]
                    break;
                case "outerWidth":
                    newWinAtts[newWinAtts.length] = "outerWidth=" + this[i]
                    this.outerWidth = this[i]
                    break;
                case "resizable":
                    newWinAtts[newWinAtts.length] = "resizable=" + this[i]
                    this.resizable = this[i]
                    break;
                case "screenX":
                    newWinAtts[newWinAtts.length] = "screenX=" + this[i]
                    this.screenX = this[i]
                    break;
                case "screenY":
                    newWinAtts[newWinAtts.length] = "screenY=" + this[i]
                    this.screenY = this[i]
                    break;
                case "scrollbars":
                    newWinAtts[newWinAtts.length] = "scrollbars=" + this[i]
                    this.scrollbars = this[i]
                    break;
                case "status":
                    newWinAtts[newWinAtts.length] = "status=" + this[i]
                    this.status = this[i]
                    break;
                case "title":
                    newWinAtts[newWinAtts.length] = "title=" + this[i]
                    this.title = this[i]
                    break;
                case "toolbar":
                    newWinAtts[newWinAtts.length] = "toolbar=" + this[i]
                    this.toolbar = this[i]
                    break;
                case "top":
                    newWinAtts[newWinAtts.length] = "top=" + this[i]
                    this.top = this[i]
                    break;
                case "width":
                    var re = /\%{1}$/   // trap for a % at the end
                    var prop = this[i]
                    if ( re.test(prop) )
                    {
                        prop = this[i].substring(0, this[i].length - 1)
                        prop = screen.availWidth * (prop / 100)
                        prop = Math.round(prop) - 1    // -1 to round down
                    }
                    newWinAtts[newWinAtts.length] = "width=" + prop
                    this.width = prop
                    break;
            }
		}
	}

	if ( newWinAtts.length > 0 )
	{
		newWinAtts = newWinAtts.join(",")
	}
	else
	{
		newWinAtts = ""
	}

	return newWinAtts
}

function wmo_alignWin ( alignment )
{
	if ( !this.width )
	{
		this.width = (window.outerWidth > 0 ? window.outerWidth : "400")
	}

    this.width = this.convertPercentToPixels( this.width )

	switch ( alignment )
	{
		case 'right':
			// there is a minimum window size for browsers
			// the right alignment is wrong for windows whose width is set to less than the minimum
			// same is true for center
			// IE Mac min width = 336, min height = 226
			// IE 6.0 Win 98 min width = 100, min height = 100
			// Mozilla Mac min width = 100, min height = 100
			// iCab  min width = 100, min height = 100
			// Opera 5 Mac min width = 10, min height = 10
			switch ( this.nav.model.name.toLowerCase() )
			{
				case "msie":
					if ( this.nav.platform.indexOf('Mac') > -1 )
					{
						if ( this.convertPercentToPixels( this.width ) < 336 )
						{
							this.left = screen.availWidth - 336
						}
						else
						{
							this.left = screen.availWidth - this.width
						}
					}
					else
					{
						if ( this.convertPercentToPixels( this.width ) < 100 )
						{
							this.left = screen.availWidth - 100
						}
						else
						{
							this.left = screen.availWidth - this.width
						}
					}
					break
				default:
					if ( this.width < 100 )
					{
						this.left = screen.availWidth - 100
					}
					else
					{
						this.left = screen.availWidth - this.width
					}
					break
			}
			this.top = 0
			this.align = 'right'
			break
		case 'center':
			switch ( this.nav.model.name.toLowerCase() )
			{
				case "msie":
					if ( this.nav.platform.indexOf('Mac') > -1 )
					{
						if ( this.convertPercentToPixels( this.width ) < 336 )
						{
							this.left = Math.round((screen.availWidth - 336) / 2)
						}
						else
						{
							this.left = Math.round((screen.availWidth - this.width) / 2)
						}
					}
					else
					{
						if ( this.width < 100 )
						{
							this.left = Math.round((screen.availWidth - 100) / 2)
						}
						else
						{
							this.left = Math.round((screen.availWidth - this.width) / 2)
						}
					}
					break
				default:
					if ( this.width < 100 )
					{
						this.left = Math.round((screen.availWidth - 100) / 2)
					}
					else
					{
						this.left = Math.round((screen.availWidth - this.width) / 2)
					}
					break
			}
			this.top = 0
			this.align = 'center'
			break
		default:    // left
			this.left = 0
			this.top = 0
			this.align = 'left'
			break
	}
    if ( this.winref && !this.winref.closed )
    {
        this.winref.moveTo( this.left, this.top )
    }
}

function wmo_resize( width, height )
{
    // resizes the window to the new values
    if (this.winref && !this.winref.closed)
    {
    	// we could add some domain checking code here to make sure the new window is on the same domain
        this.width = (width != '' ? width : this.width)
        this.height = (height != '' ? height : this.height)
        this.winref.resizeTo( width, height )
    }
}

function wmo_setWinLocation ()
{
    // by setting location after window is open, we avoid Access Denied errors in IE 5.5 and 6 for windows whose location is on a different domain
	var re = /^http\:\/\/[a-z0-9\-\.]{2,}(\:[0-9]+)|(\.[a-z]{2,3}).*/i
	if ( re.test( this.location ) )
	{
		this.winref.location = this.location
	}
	else
	{
		setTimeout( 'this.writeLocationHMTL', 50 )
	}
}

function wmo_wirteLocationHTML ()
{
	this.winref.document.open()
	this.winref.document.write(this.location)
	this.winref.document.close()
}

function wmo_popMaxWindow ()
{
    // to use this function, create a new window object then call this function
    // opens a new window and returns a reference to that window
    /*
    IE Mac simply maximizes the window if the height is set beyond the available screen height.
    It appears that the maximum width and height is relative to the x and y coordinates of the window. Thus
    there needs to be a resizeTo() method following the moveTo(0,0)
    */
    this.width = screen.availWidth
    this.height = screen.availHeight
    this.outerWidth = screen.availWidth
    this.outerHeight = screen.availHeight
    this.top = 0
    this.left = 0
    this.screenX = 0
    this.screenY = 0
    
    newWinAtts = this.setWinAtts()

    // pop the window
    if ( this.location )
    {
        this.popWindow('', (this.name ? this.name : ""), newWinAtts)
    }
    else
    {
        alert("No location has been specified for this window object.")
    }
    this.winref.moveTo(this.convertPercentToPixels(this.left), this.convertPercentToPixels(this.top))
    this.winref.resizeTo(this.convertPercentToPixels( this.width ), this.convertPercentToPixels( this.height ))
    // by setting location after window is open, we avoid Access Denied errors in IE 5.5 and 6 for windows whose location is on a different domain
    this.setWinLocation()
}

function wmo_popSizedWindow ( align )
{
    // opens a new window and returns a reference to that window
    this.alignWin( align )
    this.popWindow('', (this.name ? this.name : ""), this.setWinAtts())
    this.winref.moveTo(this.convertPercentToPixels(this.left), this.convertPercentToPixels(this.top))
    this.winref.resizeTo(this.convertPercentToPixels( this.width ), this.convertPercentToPixels( this.height ))
	this.setWinLocation()
}

function wmo_popWindow ( src, name, atts )
{
	this.winref = window.open( '', (name ? name : ""), atts)
    this.visible = true
}

function wmo_close ()
{
    this.visible = false
    this.close()
}

// define the constructor
function wmo_window( loc )
{
    if ( Object )   // version 4+ browsers only beyond this point
    {
        // set the parameters and methods
//      var newWin = new Object()
        
        // set some screen attributes, used when popping windows
        this.visible = false
        this.printDebug = false
        this.winref = null
        
        // set the window properties to the current window object
        this.location = loc
        
        this.getWidgetSize = wmo_getWidgetSize
        this.setWinAtts = wmo_setWinAtts
        this.getWinAtts = wmo_getWinAtts
        this.alignWin = wmo_alignWin
        this.popMaxWindow = wmo_popMaxWindow
        this.popSizedWindow = wmo_popSizedWindow
        this.resize = wmo_resize
        this.popWindow = wmo_popWindow
        this.close = wmo_close
        this.debug = wmo_debug
        this.popDebug = wmo_popDebug
        this.getClient = wmo_getClient
        this.getCode = wmo_getCode
        this.popSample = wmo_popSample
        this.wirteLocationHTML = wmo_wirteLocationHTML
        this.convertPercentToPixels = wmo_convertPercentToPixels
        this.setWinLocation = wmo_setWinLocation
        this.getVersion = wmo_getVersion
        
        // init the client information
        this.nav = this.getClient()

        return this
    }
    else
    {
        alert("Your browser is unable to handle Objects");
        return null
    }
}
