/// <reference path="../../Common/Libs/MiniQuery.ts"/>

/**
Base framework
*/

interface ModuleDefinition
{
    Name: string;
    Template: string;
}

interface RoutingCallback
{
    (url: any): void;
}

interface BooleanCallback
{
    (response: boolean): void;
}

interface IDisposable
{
    Dispose(): void;
}

class Routing
{
    Action: string;
    Callback: RoutingCallback;

    constructor(action: string, callback: RoutingCallback)
    {
        this.Action = action;
        this.Callback = callback;
    }
}

interface GuiPartCallback
{
    (): string;
}

class GuiPart
{
    Position: number;
    Callback: GuiPartCallback;

    constructor(position: number, callback: GuiPartCallback)
    {
        this.Position = position;
        this.Callback = callback;
    }
}

interface String
{
    /**
    * Escape the string for a "value" attribute.
    */
    htmlEntities(escapeQuotes?: boolean): string;
    /**
    * Fills the string left with the character c.
    */
    padLeft(c, nb): string;
    /**
    * Capitalize the first character of the string.
    */
    capitalize(): string;
    /**
    * Transorms the string into a CSS valid ID
    */
    id(): string;
    /**
    * Adds spaces before a capitle case.
    */
    title(): string;

    endsWith(toCheck: string): boolean;
}

interface Array<T>
{
    contains(toFind: T): boolean;
}

String.prototype.endsWith = function (toCheck: string): boolean
{
    return (this.substr(this.length - toCheck.length) == toCheck);
}

String.prototype.title = function ()
{
    return this.replace(/(\w)([A-Z][a-z])/g, "$1 $2");
}

String.prototype.padLeft = function (c, nb)
{
    if (this.length >= nb)
        return this;
    return Array(nb - this.length + 1).join(c) + this;
}

String.prototype.htmlEntities = function (escapeQuotes: boolean = true)
{
    if (!escapeQuotes)
        return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
    return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

String.prototype.capitalize = function ()
{
    return this.charAt(0).toUpperCase() + this.substr(1);
}

/**
* Transorms the string into a CSS valid ID
*/
String.prototype.id = function ()
{
    return this.replace(/ /g, "_").replace(/\//g, "_").replace(/#/g, "_").replace(/\./g, "_").replace(/</g, "_")
        .replace(/:/g, "_").replace(/\+/g, "_").replace(/\*/g, "_").replace(/\-/g, "_").replace(/\\/g, "_")
        .replace(/\(/g, "_").replace(/\)/g, "_").replace(/\&/g, "_").replace(/,/g, "_").replace(/\=/g, "_").replace(/\'/g, "_");
}

Array.prototype.contains = function (toFind): boolean
{
    for (var i = 0; i < this.length; i++)
        if (this[i] == toFind)
            return true;
    return false;
}

function FirstItem(dictionary: any): string
{
    for (var item in dictionary)
        return item;
    return null;
}

function Keys(dictionary: any): string[]
{
    var keys: string[] = [];
    for (var item in dictionary)
        keys.push(item);
    return keys;
}

function isString(variable)
{
    return (typeof variable == 'string' || variable instanceof String);
}

function IsNull(value)
{
    return (value === null || value === undefined);
}

function IfIsNull(value, defaultValue)
{
    return ((value === null || value === undefined) ? defaultValue : value);
}


/**
 * Don't use static properties as it may trigger Typescript bugs. Therefore an instance of an anonymous class
 * containting the needed values is the current solution.
 * Sadly with this solution we loose the visibility of the properties.
 *
 * https://github.com/Microsoft/TypeScript/issues/5549
 *
 */
var framework = new (class
{
    public DefaultModule: string = "Play";
    public Routing: Routing[] = [];
    public HandleUrl: boolean = true;
    public LastRoute: string = null;
    public CurrentHandler: string = null;
    public Preferences = {};
    public eventRouteCall = null;
    public cachedTemplates = [];
    public CurrentUrl: any = {};
    public GuiParts: GuiPart[] = [];
    public MessageTimeout: number;

    public Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    public WeekDays = ["M", "T", "W", "T", "F", "S", "S"];
    public MonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    public keyPressed = [];
    public specialKeyHandling: any[] = [];

    public yesCallback: any;
    public noCallback: any;
    public isPrompt: boolean = false;

    public RoutePrefix = "/Engine/Module/";
});

/**
 * Base framework class
 * 
 * Page sections must implement: 
 * static Recover(url)
 * The function will receive an "url" object (dictionary) containing all the URL parameters.
 * 
 * Any class can implement the following function which will be called during the framework initialization:
 * static InitFunction(): void
 * The framework will need a corresponding Templates/XXX.html or
 * an <script id="XXX" type="text/html"> tag in the index.html where XXX is the name of the typescript class.
 * 
 */
class Framework
{
    /**
     * Calculates an MD5 of a given string
     */
    static MD5(source: string): string
    {
        return <string>window["md5"](source);
    }

    /**
     * Parse the URL and returns an object (dictionary) of the parsed URL.
     * @param url the string of the url (the # part of the url is the important piece).
     */
    static ParseUrl(url: string = null): any
    {
        if (!url)
        {
            url = ("" + document.location);
            if (url.indexOf("#") == -1)
                url = "";
            else
                url = url.substr(url.indexOf("#") + 1);
        }
        else
            url = url.substr(url.indexOf("#") + 1);


        var parts = url.split("&");
        var result = {};
        parts.forEach(row => result[row.split("=")[0]] = decodeURIComponent(row.split("=")[1]));
        return result;
    }

    static ParseQuery(url: string = null): any
    {
        if (!url)
        {
            url = ("" + document.location);
            if (url.indexOf("?") == -1)
                url = "";
            else
                url = url.substr(url.indexOf("?") + 1);
        }
        else
            url = url.substr(url.indexOf("?") + 1);
        if (url.indexOf('#') != -1)
            url = url.substr(0, url.indexOf('#'));

        var parts = url.split("&");
        var result = {};
        parts.forEach(row => result[row.split("=")[0]] = decodeURIComponent(row.split("=")[1]));
        return result;
    }

    /**
    * Re-execute the routing
    */
    public static Recall()
    {
        Framework.ExecuteRoute();
    }

    /**
     * Internal function used to re-route the URL to the right class and passing the parsed URL to the callback.
     */
    private static ExecuteRoute(reload: boolean = false)
    {
        if (!framework.HandleUrl)
            return;
        var url = Framework.ParseUrl();
        if (!url["action"])
            url["action"] = framework.DefaultModule;
        framework.CurrentUrl = url;
        var found = false;
        for (var i = 0; i < framework.Routing.length; i++)
        {
            if (framework.Routing[i].Action == url["action"])
            {
                found = true;
                break;
            }
        }
        if (!found)
            url["action"] = framework.DefaultModule;
        Framework.RoutePage(url["action"], reload);
    }

    public static Rerun()
    {
        Framework.ExecuteRoute(true);
    }

    static RoutePage(page: string, reload: boolean = false)
    {
        for (var i = 0; i < framework.Routing.length; i++)
        {
            if (framework.Routing[i].Action == page)
            {
                var isReady = true;
                if (framework.LastRoute != page || reload === true)
                {
                    if (framework.LastRoute != null)
                    {
                        try
                        {
                            (<any>window[framework.LastRoute]).Dispose();
                        }
                        catch (ex)
                        {
                            //alert(ex);
                        }
                    }
                    if ($("#" + framework.Routing[i].Action).length)
                    {
                        $("#contentArea").html($("#" + framework.Routing[i].Action).html());
                        framework.LastRoute = page;
                    }
                    else if (framework.cachedTemplates[framework.Routing[i].Action])
                    {
                        $("#contentArea").html(framework.cachedTemplates[framework.Routing[i].Action]);
                        framework.LastRoute = page;
                    }
                    else
                    {
                        isReady = false;
                        $.ajax({
                            type: "GET",
                            url: framework.RoutePrefix + framework.Routing[i].Action + "/Template.html",
                            success: function (msg: string)
                            {
                                if (msg.toLocaleLowerCase().indexOf("<body>"))
                                {
                                    var m = msg.match(/\<body\>((.|\n|\r)*)\<\/body\>/i);
                                    if (m && m[1])
                                        msg = m[1];
                                }
                                framework.cachedTemplates[framework.Routing[i].Action] = msg;
                                $("#contentArea").html(msg);
                                if (selfHosted && $("#helpLink").length != 0)
                                {
                                    var helpLink=<string>($("#helpLink").prop("href"));
                                    helpLink=helpLink.substr(helpLink.indexOf("/Help"));
                                    $("#helpLink").prop("href", "https://www.dotworldmaker.com" + helpLink);
                                }
                                framework.LastRoute = page;
                                framework.CurrentHandler = page;
                                framework.Routing[i].Callback(framework.CurrentUrl);
                                document.dispatchEvent(framework.eventRouteCall);
                            }
                        });
                    }
                }
                if (isReady)
                {
                    framework.CurrentHandler = page;
                    if (selfHosted && $("#helpLink").length != 0)
                    {
                        var helpLink=<string>($("#helpLink").prop("href"));
                        helpLink=helpLink.substr(helpLink.indexOf("/Help"));
                        $("#helpLink").prop("href", "https://www.dotworldmaker.com" + helpLink);
                    }
                    framework.Routing[i].Callback(framework.CurrentUrl);
                    document.dispatchEvent(framework.eventRouteCall);
                }
                return;
            }
        }
    }

    /**
     * Changes the title of the page
     * @param title component added to the page title
     */
    static SetTitle(title: string)
    {
        if (!title || title == "")
            document.title = "Dot World Maker";
        else
            document.title = "Dot World Maker - " + title;
    }

    static MakeUrl(newData: any)
    {
        var s = "";
        var props = [];
        for (var i in newData)
            props.push(i);
        props.sort();

        for (var j = 0; j < props.length; j++)
        {
            if (!newData[props[j]] || newData[props[j]] == "")
                continue;
            if (s != "")
                s += "&";
            s += props[j] + "=" + encodeURIComponent(newData[props[j]]);
        }
        return s;
    }


    /**
     * Change the URL
     * @param newData should be a dictionary which will build hash part of the URL
     * @skipHandler will avoid to call the routing (by default it's true)
     */
    static SetLocation(newData: any, skipHandler = true, replace = false)
    {
        // We need to compose it ourself
        if (isString(newData))
            newData = JSON.parse(newData);
        if (!newData['action'])
            newData['action'] = framework.CurrentHandler;

        framework.CurrentUrl = newData;

        newData = Framework.MakeUrl(newData);

        var oldUrl = "" + document.location;
        var url = ("" + document.location);
        if (url.indexOf("#") != -1)
            url = url.substr(0, url.indexOf("#"));
        if (skipHandler)
            framework.HandleUrl = false;
        url += "#" + newData
        if (replace)
            document.location.replace(url);
        else
            document.location.assign(url);
        if (skipHandler)
        {
            setTimeout(function ()
            {
                framework.HandleUrl = true;
            }, 100);
        }
        else if (oldUrl == url)
            Framework.ExecuteRoute();
    }

    /**
     * Set a callback in case the routing change
     */
    static OnRouteCall(callback)
    {
        document.addEventListener("RouteCall", callback, false);
    }

    /**
     * Save the preference object to local storage
     */
    static SavePreferences()
    {
        localStorage.setItem("preferences", JSON.stringify(framework.Preferences));
    }

    /**
     * Store the routings
     */
    private static AutoLinkRoutes()
    {
        for (var i in window)
        {
            try
            {
                if (i.substr(0, 3) != "web" && window[i] && (<any>window[i]).Recover)
                {
                    if (!((<any>window[i]).IsAccessible && (<any>window[i]).IsAccessible() == false))
                        framework.Routing.push(new Routing(i, (<any>window[i]).Recover));
                }
            }
            catch (ex)
            {
            }
        }
    }

    /**
     * Store the gui parts
     */
    private static AutoLinkGuiParts()
    {
        for (var i in window)
        {
            try
            {
                if (i.substr(0, 3) != "web" && window[i] && (<any>window[i]).GuiPart)
                {
                    var p = (<any>window[i]).GuiPart();
                    if (p)
                        framework.GuiParts.push(p);
                }
            }
            catch (ex)
            {
            }
        }

        framework.GuiParts.sort((a, b) => { return a.Position - b.Position; });
    }

    static FixObjectDates(source: any)
    {
        var dest = JSON.parse(JSON.stringify(source));
        for (var i in dest)
        {
            if (source[i] instanceof Date)
                dest[i] = Framework.FullDateFormat(source[i]);
        }
        return dest;
    }

    static NetDate(source: Date)
    {
        return "/Date(" + source.getTime() + ")/";
    }

    static DateFormat(source: Date)
    {
        if (!source)
            return "";
        return source.getFullYear() + "/" + ("" + (source.getMonth() + 1)).padLeft("0", 2) + "/" + ("" + source.getDate()).padLeft("0", 2);
        //return ("" + source.getDate()).padLeft("0", 2) + "/" + ("" + (source.getMonth() + 1)).padLeft("0", 2) + "/" + source.getFullYear();
    }

    static FullDateFormat(source: Date)
    {
        if (!source)
            return "";
        return source.getFullYear() + "/" + ("" + (source.getMonth() + 1)).padLeft("0", 2) + "/" + ("" + source.getDate()).padLeft("0", 2) + " " +
            ("" + source.getHours()).padLeft("0", 2) + ":" + ("" + source.getMinutes()).padLeft("0", 2) + ":" + ("" + source.getSeconds()).padLeft("0", 2);
        /*return ("" + source.getDate()).padLeft("0", 2) + "/" + ("" + (source.getMonth() + 1)).padLeft("0", 2) + "/" + source.getFullYear() + " " +
            ("" + source.getHours()).padLeft("0", 2) + ":" + ("" + source.getMinutes()).padLeft("0", 2) + ":" + ("" + source.getSeconds()).padLeft("0", 2);*/
    }

    static ParseDate(source: string)
    {
        if (!source || source == "")
            return null;
        if (source.charAt(source.length - 1) == "Z")
            return new Date(source);
        source = source.replace(/\./g, "/").replace(/\-/g, "/");
        if (source.charAt(2) == "/")
        {
            return new Date(parseInt(source.substr(6, 4)), parseInt(source.substr(3, 2)) - 1, parseInt(source.substr(0, 2)));
        }
        else if (source.charAt(4) == "/")
        {
            return new Date(parseInt(source.substr(0, 4)), parseInt(source.substr(5, 2)) - 1, parseInt(source.substr(8, 2)));
        }
        return new Date(parseInt(source));
    }

    /**
     * Calls all the InitFunction
     */
    private static CallInits()
    {
        for (var i in window)
        {
            try
            {
                if (i.substr(0, 3) != "web" && window[i] && (<any>window[i]).InitFunction)
                {
                    (<any>window[i]).InitFunction();
                }
            }
            catch (ex)
            {
            }
        }
    }

    public static HandleError(returnedError): string
    {
        if (returnedError.status == 0)
            return "";
        try
        {
            var err = JSON.parse(returnedError.responseText);
            if (err.ExceptionType == "IV4.Backend.IvException")
            {
                var msg: string = err.Message;
                return msg.substr(msg.indexOf(":") + 1);
            }
            else
            {
                /*Framework.RoutePage("ErrorHandling");
                ErrorHandling.SetError(err.Message + "\n" + err.ExceptionType + "\n" + err.StackTrace);*/
                return "";
            }
        }
        catch (ex)
        {
            /*Framework.RoutePage("ErrorHandling");
            ErrorHandling.SetError(returnedError.responseText);*/
            return "";
        }
    }

    static IsKeyPressed(code)
    {
        if (framework.keyPressed[code] === true)
            return true;
        return false;
    }

    public static RegisterKey(keyCode: number, callback: any)
    {
        framework.specialKeyHandling[keyCode] = callback;
    }

    private static keyDown(e)
    {
        e = e ? e : event;

        framework.keyPressed[e.keyCode] = true;
        //console.log(e.keyCode);

        if (framework.specialKeyHandling[e.keyCode])
        {
            if (framework.specialKeyHandling[e.keyCode](e.keyCode) === true)
            {
                // Firefox
                try
                {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                catch (er)
                {
                }
                // IE
                try
                {
                    e.cancelBubble = true;
                    e.returnValue = false;
                }
                catch (er)
                {
                }
                return false;
            }

        }
        else
            return true;
    }

    private static keyUp(e)
    {
        e = e ? e : event;
        framework.keyPressed[e.keyCode] = false;

        if (framework.specialKeyHandling[e.keyCode])
        {
            // Firefox
            try
            {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            catch (er)
            {
            }
            // IE
            try
            {
                e.cancelBubble = true;
                e.returnValue = false;
            }
            catch (er)
            {
            }
            return false;
        }
        else
            return true;
    }

    public static Confirm(displayQuestion: string, yesCallback: any, noCallback: any = null)
    {
        framework.isPrompt = false;
        $("#backgroundConfirm").show();
        $("#confirmDialog").show();
        $("#confirmOk").hide();
        $("#confirmYes").show().html("Yes");
        $("#confirmNo").show().html("No");
        $("#confirmLabel").html(displayQuestion);
        //$("#confirmDialog").css("top", "0px");
        $("#confirmDialog").animate({
            top: ($(window).height() / 2 - 50) + "px"
        }, 200);

        framework.yesCallback = yesCallback;
        framework.noCallback = noCallback;
    }

    public static Prompt(displayQuestion: string, defaultValue: string, yesCallback: any, noCallback: any = null, confirmLabel: string = "Confirm", cancelLabel: string = "Cancel")
    {
        framework.isPrompt = true;
        $("#backgroundConfirm").show();
        $("#confirmDialog").show();
        $("#confirmOk").hide();
        $("#confirmYes").show().html(confirmLabel);
        $("#confirmNo").show().html(cancelLabel);
        $("#confirmLabel").html(displayQuestion + "<br><input type='text' id='promptField' value='" + (defaultValue ? defaultValue.htmlEntities() : "") + "'>");
        //$("#confirmDialog").css("top", "0px");
        $("#confirmDialog").animate({
            top: ($(window).height() / 2 - 50) + "px"
        }, 200, () =>
            {
                $("#promptField").focus();
            });
        $("#promptField").focus();

        framework.yesCallback = yesCallback;
        framework.noCallback = noCallback;
    }

    public static Alert(displayLabel: string, okCallback: any = null)
    {
        framework.isPrompt = false;
        $("#backgroundConfirm").show();
        $("#confirmDialog").show();
        $("#confirmOk").show();
        $("#confirmYes").hide();
        $("#confirmNo").hide();
        $("#confirmLabel").html(displayLabel);
        $("#backgroundConfirm").bind("click", Framework.ConfirmOk);
        //$("#confirmDialog").css("top", "0px");
        try
        {
            $("#confirmDialog").animate({
                top: ($(window).height() / 2 - 50) + "px"
            }, 200);
        }
        catch (ex)
        {
        }

        framework.yesCallback = okCallback;
    }

    public static ShowMessage(displayText: string)
    {
        if (framework.MessageTimeout)
            clearTimeout(framework.MessageTimeout);

        $("#displayMessage").show().first().className = "displayMessageVisible";
        $("#displayMessageContent").html(displayText);
        framework.MessageTimeout = setTimeout(() =>
        {
            $("#displayMessage").first().className = "displayMessageHidden";
            framework.MessageTimeout = setTimeout(() =>
            {
                $("#displayMessage").hide();
                framework.MessageTimeout = null;
            }, 500);
        }, 5000);
    }

    private static ConfirmOk()
    {
        $("#backgroundConfirm").unbind("click", Framework.ConfirmOk);
        $("#backgroundConfirm").hide();
        $("#confirmDialog").hide();

        if (framework.yesCallback)
            framework.yesCallback();
    }

    private static ConfirmYes()
    {
        $("#backgroundConfirm").hide();
        $("#confirmDialog").hide();

        if (framework.isPrompt && framework.yesCallback)
            framework.yesCallback($("#promptField").val());
        else if (framework.yesCallback)
            framework.yesCallback();
    }

    private static ConfirmNo()
    {
        $("#backgroundConfirm").hide();
        $("#confirmDialog").hide();

        if (framework.noCallback)
            framework.noCallback();
    }

    public static ReloadPreferences()
    {
        framework.Preferences = {};
        if (localStorage.getItem("preferences") != null && localStorage.getItem("preferences") != undefined)
            framework.Preferences = JSON.parse(localStorage.getItem("preferences"));
    }

    static SetRoutePrefix(prefix: string)
    {
        framework.RoutePrefix = prefix;
    }

    /**
     * Initialization of the framework.
     */
    static Init(withExecuteRoute: boolean = true)
    {
        $(document).bind("keydown", Framework.keyDown);
        $(document).bind("keyup", Framework.keyUp);

        // Used to place the debugger at the start
        //alert("init");
        if (localStorage.getItem("preferences") != null && localStorage.getItem("preferences") != undefined)
            framework.Preferences = JSON.parse(localStorage.getItem("preferences"));
        framework.eventRouteCall = document.createEvent("Event");
        framework.eventRouteCall.initEvent("RouteCall", true, true);

        Framework.CallInits();
        Framework.AutoLinkRoutes();
        Framework.AutoLinkGuiParts();
        if (withExecuteRoute)
            Framework.ExecuteRoute();
        window.addEventListener("hashchange", () =>
        {
            Framework.ExecuteRoute();
        });
    }
}
