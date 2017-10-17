///<reference path="../Common/Libs/MiniQuery.ts" />

// (c) 2016 - 2017 - Alain Bertrand
// Entry point of the engine while using the normal site.
// For standalone maker, the standalone_maker.ts is used.

var world: World;
var username: string;
var userRoles: number[];
var selfHosted = false;

var databaseNameRule = new RegExp("[^a-z _01-9\(\)\-]", "gi");

class Main
{
    public static NbCores(): number
    {
        if (window['Worker'] && (!game || Main.CheckNW() || isHtmlStandalone) && (("" + document.location).substr(0, 4) == "http" || Main.CheckNW()))
            return ((<any>navigator).hardwareConcurrency ? (<any>navigator).hardwareConcurrency : 2);
        return 1;
    }

    public static CheckTouch(): boolean
    {
        if (world && world.Id > 1)
            return false;
        return (('ontouchstart' in window)
            || ((<any>navigator).MaxTouchPoints > 0)
            || ((<any>navigator).msMaxTouchPoints > 0));
    }

    public static CheckNW(): boolean
    {
        try
        {
            if (!window)
                return false;
        }
        catch (ex)
        {
            return false;
        }
        if (window["nw"] && window["nw"].App)
            return true;
        return false;
    }

    public static Base64decode(source: string): any
    {
        // Node 5.10+
        if (typeof (window['Buffer']).from === "function")
            return (window['Buffer']).from(source, 'base64');
        // older Node versions
        else
            return new window['Buffer'](source, 'base64');
    }

    public static GameLogin()
    {
        $("#resultText").html("Login in...");
        $("#loginInput").hide();
        $.ajax({
            type: 'POST',
            url: '/backend/Login',
            data: {
                user: $("#loginUser").val(),
                password: $("#loginPassword").val(),
            },
            success: function (msg)
            {
                var data = TryParse(msg);
                if (data && data.token)
                {
                    Framework.ReloadPreferences();
                    framework.Preferences['token'] = data.token;
                    framework.Preferences['user'] = $("#loginUser").val();
                    framework.Preferences['password'] = Main.Encrypt($("#loginUser").val(), $("#loginPassword").val());
                    Framework.SavePreferences();
                    $("#resultText").html("Login succeed...");

                    document.location.reload();
                }
                else
                {
                    $("#resultText").html("Login failed...");
                    $("#loginInput").show();
                    $("#loginUser").focus();
                }
            },
            error: function (msg, textStatus)
            {
                $("#resultText").html("Login failed...");
                $("#loginInput").show();
                $("#loginUser").focus();
            }
        });
    }

    public static Encrypt(username: string, password: string): number[]
    {
        var salt = username.toLowerCase().trim();
        var result: number[] = [];
        for (var i = 0; i < password.length; i++)
            result.push(password.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
        return result;
    }

    public static Decryprt(username: string, crpytedPass: number[]): string
    {
        var salt = username.toLowerCase().trim();
        var result: string = "";
        for (var i = 0; i < crpytedPass.length; i++)
            result += String.fromCharCode(crpytedPass[i] ^ salt.charCodeAt(i % salt.length));
        return result;
    }

    public static ShowRegister()
    {
        $("#loginForm .gamePanelHeader").html("Register:");
        $("#loginForm").height(215);
        $("#loginForm .gamePanelContent").html("<div id='resultText'></div><table id='registerInput'>\n\
                <tr>\n\
                    <td>Username:</td>\n\
                    <td><input type='text' id='registerUser' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Password:</td>\n\
                    <td><input type='password' id='registerPassword' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Confirm:</td>\n\
                    <td><input type='password' id='registerPasswordConfirm' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td>EMail (optional):</td>\n\
                    <td><input type='text' id='registerEmail' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td colspan='2'>\n\
                        <center>\n\
                            <div class='button' onclick='Main.GameRegisterPlayer();'>Register</div>\n\
                            <div class='button' onclick='Main.ShowLogin();'>Cancel</div>\n\
                        </center>\n\
                    </td>\n\
                </tr>\n\
            </table>");
        $("#registerUser").focus();
        $("#resultText").html("");
    }

    public static ShowLogin()
    {
        if (world && world.art && world.art.splashImage)
        {
            $("#loginBackground").css("background", "url('" + world.art.splashImage + "')").css("backgroundSize", "cover");
            $("#branding").css("backgroundColor", "rgba( 255,255,255,0.5)").css("padding", "10px").css("border", "solid 1px black");
        }

        $("#loginForm").height(235);
        $("#loginForm .gamePanelContent").html((world && world.Name ? "<h3>Welcome to " + world.Name.htmlEntities() + "</h3>" : "") + "<div id='resultText'></div>\n\
            <table id='loginInput'>\n\
                <tr>\n\
                    <td>Login:</td>\n\
                    <td><input type='text' id='loginUser' onkeydown='Main.LoginKeyPress(event);' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Password:</td>\n\
                    <td><input type='password' id='loginPassword' onkeydown='Main.LoginKeyPress(event);' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td colspan='2'>\n\
                        <center>\n\
                            <div class='button' onclick='Main.GameLogin();'>Login</div>\n\
                            <div class='button' onclick='Main.ShowRegister();'>Register</div>\n\
                        </center>\n\
                    </td>\n\
                </tr>\n\
            </table>"+ (world ? (world.Description && world.Description.trim() != "" ? "<br>" + Main.TextTransform(world.Description) : "- Please set a description! -") : ""));
        $("#loginForm .gamePanelHeader").html("Login:");
        $("#loginUser").focus();
        $("#resultText").html("");
    }

    public static GameRegisterPlayer()
    {
        var reserved = ["root", "admin", "administrator", "boss", "master", "moderator", "helper"];

        if (!$("#registerUser").val() || $("#registerUser").val().trim() == "" || $("#registerUser").val().trim().length < 5)
        {
            $("#resultText").html("The user name must be at least 5 characters long.");
            $("#registerUser").focus();
            return;
        }
        if ($("#registerUser").val().trim().replace(/[a-z0-9]+/gi, "").length > 0)
        {
            $("#resultText").html("The user name can contain only letters and numbers.");
            $("#registerUser").focus();
            return;
        }
        if (!$("#registerPassword").val() || $("#registerPassword").val().trim() == "" || $("#registerPassword").val().trim().length < 6)
        {
            $("#resultText").html("The password must be at least 6 characters long.");
            $("#registerPassword").focus();
            return;
        }
        if ($("#registerPassword").val() != $("#registerPasswordConfirm").val())
        {
            $("#resultText").html("The confirmation of the password don't match with the first password entry.");
            $("#registerPassword").focus();
            return;
        }

        if (reserved.indexOf($("#registerUser").val().trim().toLowerCase()) != -1)
        {
            $("#resultText").html("Reserved username.");
            return;
        }

        $("#resultText").html("Creating account...");
        $("#registerInput").hide();
        $.ajax({
            type: 'POST',
            url: '/backend/RegisterUser',
            data: {
                user: $("#registerUser").val().trim(),
                password: $("#registerPassword").val().trim(),
                email: $("#registerEmail").val().trim()
            },
            success: function (msg)
            {
                var data = TryParse(msg);
                if (data && data.token)
                {
                    Framework.ReloadPreferences();
                    framework.Preferences['token'] = data.token;
                    framework.Preferences['user'] = $("#registerUser").val();
                    framework.Preferences['password'] = Main.Encrypt($("#registerUser").val(), $("#registerPassword").val());
                    Framework.SavePreferences();
                    $("#resultText").html("Registration and login succeed...");

                    document.location.reload();
                }
                else
                {
                    $("#resultText").html(data.error);
                    $("#registerInput").show();
                }
            },
            error: function (msg, textStatus)
            {
                var data = TryParse(msg);
                if (data && data.error)
                    msg = data.error;
                $("#resultText").html(msg.htmlEntities(false));
                $("#registerInput").show();
                $("#registerUser").focus();
            }
        });
    }

    public static FindId(name: string)
    {
        name = name.replace(/_/g, " ");
        $.ajax({
            type: 'POST',
            url: '/backend/SearchGameByName',
            data: {
                name: name,
            },
            success: function (msg)
            {
                if (msg && msg != "" && msg != "-")
                {
                    window['gameId'] = parseInt(msg.trim());
                    Main.InitGameMaker();
                }
            },
            error: function (msg, textStatus)
            {
                $("#loading").hide();
            }
        });
    }

    public static HideError()
    {
        $("#errorWindow").hide();
    }

    public static AddErrorMessage(message: string)
    {
        var now = new Date();
        $("#errorWindow").show();
        var logElement = $("#errorWindow > div:nth-child(2)");
        var log = logElement.first();
        while (log.childNodes.length > 200)
            log.removeChild(log.childNodes[0]);
        logElement.html(logElement.html() + ("<div>" + now.getHours()).padLeft('0', 2) + ":" + ("" + now.getMinutes()).padLeft('0', 2) + ":" + ("" + now.getSeconds()).padLeft('0', 2) + " " + message.htmlEntities() + "</div>").scrollTop(6000000);
    }

    public static InitGameMaker()
    {
        $("#loadingScreen").hide();
        $(window).bind("error", (error: ErrorEvent, url, lineNumber) =>
        {
            if (("" + error.message).indexOf("__gCrWeb") != -1)
                return true;
            //error.error.stack.toString()
            Main.AddErrorMessage(error.filename + "@" + error.lineno + ": " + error.message);
            return true;
        });

        // Running within NW.JS
        if (Main.CheckNW())
        {
            $("#loginBackground").hide();
            $("#loginForm").hide();
            $("#branding").hide();
            $("#gameNewsDisplay").hide();
            world = new World();
            world.Id = Math.round((new Date()).getTime() / 1000);
            world.Name = "Not existing...";

            world.Init();
            Framework.Init();
            Main.GenerateGameStyle();
            return;
        }

        if (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW())
        {
            $(document).bind('keydown', function (e)
            {
                if (e.ctrlKey && ((e.which || e.keyCode) == 83))
                {
                    e.preventDefault();
                    if (world.ReadyToSave)
                        world.SaveMapChanges();
                    return false;
                }
                else if ((e.which || e.keyCode) == 112 && e.key == "F1")
                {
                    e.preventDefault();
                    window['cancelKeypress'] = true;
                    e.cancelBubble = true;
                    window['event']['keyCode'] = 0;
                    window.open("/Help/welcome.html", "engineHelp");
                    return false;
                }
            });

            $(document).bind('keypress', function (e)
            {
                if ((e.which || e.keyCode) == 112 && e.key == "F1")
                {
                    e.preventDefault();
                    window['cancelKeypress'] = true;
                    e.cancelBubble = true;
                    window['event']['keyCode'] = 0;
                    window.open("/Help/welcome.html", "engineHelp");
                    return false;
                }
            });

            if (window["onhelp"])
            {
                window["onhelp"] = document["onhelp"] = () =>
                {
                    return false;
                };
            }
        }

        Framework.ReloadPreferences();
        var query = Framework.ParseQuery();
        var url = Framework.ParseUrl();
        if (window['gameId'])
            query.id = window['gameId'];

        if (!query.id && query.game)
        {
            Main.FindId(query.game);
            return;
        }

        if ((!framework.Preferences || !framework.Preferences['token']) && query.id != 1 && query.demo != "true")
        {
            if (!query || (!query.id && !query.game))
                document.location.replace("/");
            else
            {
                Main.LoadGame(query.id);
                $("#loginUser").focus();
                Main.ShowLogin();
                Main.LoadNews(query.id);
            }
            return;
        }

        Main.CheckAccess();
    }

    private static CheckAccess()
    {
        Framework.ReloadPreferences();
        var query = Framework.ParseQuery();
        var url = Framework.ParseUrl();
        if (window['gameId'])
            query.id = window['gameId'];

        if (query.demo == "true")
        {
            Main.AfterAccessCheck();
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/backend/GetRoles',
            data: {
                token: framework.Preferences['token'],
                game: query.id
            },
            success: function (msg)
            {
                userRoles = TryParse(msg);

                if (("" + document.location).indexOf("/maker.html") == -1 && (userRoles.indexOf(100) != -1 || userRoles.indexOf(1000) != -1) && selfHosted)
                    document.location.replace("/maker.html");
                else if (("" + document.location).indexOf("/maker.html") == -1)
                {
                    Main.AfterAccessCheck();
                    return;
                }

                $.ajax({
                    type: 'POST',
                    url: '/backend/CanEdit',
                    data: {
                        token: framework.Preferences['token'],
                        game: query.id
                    },
                    success: function (msg)
                    {
                        var res = TryParse(msg);
                        if (res !== true)
                        {
                            delete framework.Preferences['token'];
                            Framework.SavePreferences();

                            document.location.replace("/");
                            return;
                        }
                        Main.AfterAccessCheck();
                    },
                    error: function (msg, textStatus)
                    {
                        //if (("" + document.location).indexOf("dotworld.me") == -1 && ("" + document.location).indexOf("/play.html") == -1)
                        if (("" + document.location).indexOf("maker.html") != -1)
                            Main.ReLogin(Main.CheckAccess);
                        else
                            Main.AfterAccessCheck();
                        return;
                    }
                });
            },
            error: function (msg, textStatus)
            {
                //if (("" + document.location).indexOf("dotworld.me") == -1 && ("" + document.location).indexOf("/play.html") == -1)
                if (("" + document.location).indexOf("maker.html") != -1)
                    Main.ReLogin(Main.CheckAccess);
                else
                    Main.AfterAccessCheck();
                return;
            }
        });
    }

    static LoadNews(gameId: number)
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GameNews',
            data: {
                game: gameId
            },
            success: (msg) =>
            {
                var data: any[] = TryParse(msg);
                if (!data || data.length == 0)
                {
                    $("#gameNewsDisplay").hide();
                    return;
                }

                var html = "";
                for (var i = 0; i < data.length && i < 10; i++)
                {
                    if (i != 0)
                        html += "<br><br>";
                    var dt = new Date(data[i].postedOn);
                    html += "<b>" + dt.getFullYear() + "/" + ("" + (dt.getMonth() + 1)).padLeft("0", 2) + "/" + ("" + dt.getDate()).padLeft("0", 2) + ":</b><br>";
                    html += Main.TextTransform("By " + data[i].username + ": " + data[i].news);
                }
                $("#gameNewsDisplay .gamePanelContent").html(html);
            },
            error: function (msg, textStatus)
            {
            }
        });
    }

    static AfterAccessCheck()
    {
        Framework.ReloadPreferences();
        var query = Framework.ParseQuery();
        var url = Framework.ParseUrl();
        if (window['gameId'])
            query.id = window['gameId'];

        if (query.id == 1 && query.demo == "true")
        {
            framework.Preferences['token'] = "demo";
            Framework.SavePreferences();
            Main.LoadGame(query.id);
            username = "demo_" + Math.floor(Number.MAX_VALUE * Math.random());
            $("#loginBackground").hide();
            $("#loginForm").hide();
            $("#branding").hide();
            $("#gameNewsDisplay").hide();
            return;
        }
        else if (!framework.Preferences || !framework.Preferences['token'])
        {
            if (!query || !query.id)
                document.location.replace("/");
            else
            {
                Main.LoadGame(query.id);
                $("#loginUser").focus();
                Main.ShowLogin();
                Main.LoadNews(query.id);
            }
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/backend/VerifyToken',
            data: {
                token: framework.Preferences['token']
            },
            success: function (msg)
            {
                var data = TryParse(msg);
                if (data && data.valid !== true)
                {
                    delete framework.Preferences['token'];
                    Framework.SavePreferences();

                    if (!query || !query.id)
                        document.location.replace("/");
                    else
                    {
                        Main.LoadGame(query.id);
                        $("#loginUser").focus();
                    }
                    return;
                }
                username = data.username;
                $("#loginBackground").hide();
                $("#loginForm").hide();
                $("#branding").hide();
                $("#gameNewsDisplay").hide();

                if (query && query.id !== null && query.id !== undefined)
                {
                    if (url && url.action == "GameList")
                        document.location.replace("?id=" + query.id + "#");
                    else
                        Main.LoadGame(query.id);
                }
                else
                {
                    if (url.action != "GameList")
                        document.location.replace("/play.html#action=GameList");
                    Framework.Init();
                }
            },
            error: function (msg, textStatus)
            {
                delete framework.Preferences['token'];
                Framework.SavePreferences();

                document.location.replace("/");
                return;
            }
        });

        if (!Main.CheckNW())
        {
            setTimeout(Main.CheckDebugger, 100);
            setInterval(Main.RefreshToken, 30000);
        }
    }

    static CheckDebugger()
    {
        if (game || Main.CheckNW())
            return;

        var start = new Date();
        if (play.devTools == false && ("" + document.location).indexOf("localhost") == -1)
            debugger;
        var end = new Date();
        var diff = end.getTime() - start.getTime();
        if (diff > 50)
            play.devTools = true;

        if (!play.devTools)
            setTimeout(Main.CheckDebugger, 100);
    }

    public static RefreshToken()
    {
        if (framework.Preferences['token'] == "demo" && world.Id == 1)
        {
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/backend/VerifyToken',
            data: {
                token: framework.Preferences['token']
            },
            success: function (msg)
            {
                var data = TryParse(msg);
                if (!data || data.valid !== true)
                    Main.ReLogin();
            },
            error: function (msg, textStatus)
            {
                Main.ReLogin();
            }
        });
    }

    public static ReLogin(callback?: () => void)
    {
        Framework.ReloadPreferences();
        if (!framework.Preferences['user'] || !framework.Preferences['password'])
        {
            delete framework.Preferences['token'];
            Framework.SavePreferences();
            document.location.replace("/");
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/backend/Login',
            data: {
                user: framework.Preferences['user'],
                password: Main.Decryprt(framework.Preferences['user'], framework.Preferences['password']),
            },
            success: function (msg)
            {
                var data = TryParse(msg);
                if (data && data.token)
                {
                    Framework.ReloadPreferences();
                    framework.Preferences['token'] = data.token;
                    Framework.SavePreferences();
                    if (callback)
                        callback();
                }
                else
                {
                    delete framework.Preferences['token'];
                    Framework.SavePreferences();
                    document.location.replace("/");
                    return;
                }
            },
            error: function (msg, textStatus)
            {
                setTimeout(() =>
                {
                    Main.ReLogin(callback);
                }, 10000);
            }
        });
    }

    public static LoginKeyPress(evt: KeyboardEvent)
    {
        if (evt.keyCode == 13)
        {
            Main.GameLogin();
        }
    }

    public static LoadGame(id: number)
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GetWorld',
            data: {
                game: id
            },
            success: function (msg)
            {
                world = null;
                var data = null;
                if (msg != "" && msg != null)
                    data = TryParse(msg);
                if (data)
                {
                    if (data.data && data.data != "")
                    {
                        try
                        {
                            world = World.Rebuild(data.data);
                            world.Id = id;
                            world.Name = data.name;
                            world.Edition = (data.edition == "s" ? EditorEdition.Standard : EditorEdition.Demo);
                        }
                        catch (ex)
                        {
                            world = null;
                            Framework.Alert("Error while rebuilding the world...");
                        }
                    }
                    else
                    {
                        world = new World();
                        world.Id = id;
                        world.Name = data.name;
                        world.Edition = (data.edition == "s" ? EditorEdition.Standard : EditorEdition.Demo);
                    }
                }
                if (world == null)
                {
                    world = new World();
                    world.Id = id;
                    if (data && data.name)
                        world.Name = data.name;
                    else
                        world.Name = "Not existing...";
                }

                if (!framework.Preferences['token'])
                {
                    Main.ShowLogin();
                    Main.LoadNews(id);
                }

                world.Init();
                Framework.Init();
                Main.GenerateGameStyle();
                Chat.Init();
            },
            error: function (msg)
            {
            }
        });
    }

    public static EnsureColor(color: string): string
    {
        var m = ("" + color).match(/^\#[0-9abcdef]{6}$/i);
        if (!m)
            return "#000000";
        return "" + color;
    }

    public static ExtractImagePart(source: HTMLImageElement, x: number, y: number, width: number, height: number): string
    {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
        try
        {
            return canvas.toDataURL();
        }
        catch (ex)
        {
            return "";
        }
    }

    public static GenerateGameStyle()
    {
        var source = new Image();
        source.src = world.art.panelStyle.file;
        source.onload = () =>
        {

            var html = ".gamePanel { }\n\
.gamePanelTopBorder {\n\
width: calc(100% - "+ (parseInt("" + world.art.panelStyle.leftBorder) + parseInt("" + world.art.panelStyle.rightBorder)) + "px);\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, 0, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), world.art.panelStyle.topBorder) + "');\n\
height: "+ parseInt("" + world.art.panelStyle.topBorder) + "px;\n\
margin-left: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
}\n\
.gamePanelTopBorder:before {\n\
display: inline-block;\n\
position: absolute;\n\
margin-left: -"+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, 0, world.art.panelStyle.leftBorder, world.art.panelStyle.topBorder) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: "+ parseInt("" + world.art.panelStyle.topBorder) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelTopBorder:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, 0, world.art.panelStyle.rightBorder, world.art.panelStyle.topBorder) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: "+ parseInt("" + world.art.panelStyle.topBorder) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelHeader {\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, world.art.panelStyle.topBorder, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), world.art.panelStyle.header) + "');\n\
color: "+ Main.EnsureColor(world.art.panelStyle.headerColor) + ";\n\
font-weight: bold;\n\
text-align: center;\n\
width: calc(100% - "+ (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder) + "px);\n\
margin-left: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
height: " + parseInt("" + world.art.panelStyle.header) + "px;\n\
vertical-align: top;\n\
}\n\
.gamePanelHeader:before {\n\
display: inline-block;\n\
position: absolute;\n\
left: 0px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, world.art.panelStyle.topBorder, world.art.panelStyle.leftBorder, world.art.panelStyle.header) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: "+ parseInt("" + world.art.panelStyle.header) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelHeader:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, world.art.panelStyle.topBorder, world.art.panelStyle.rightBorder, world.art.panelStyle.header) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: "+ parseInt("" + world.art.panelStyle.header) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelContent {\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, world.art.panelStyle.topBorder + world.art.panelStyle.header, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
color: "+ Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
overflow-y: auto;\n\
height: calc(100% - "+ (world.art.panelStyle.header + world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder) + "px);\n\
margin-left: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
}\n\
.gamePanelContent a {\n\
color: "+ Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
font-weight: bold;\n\
}\n\
.gamePanelContent:before {\n\
display: inline-block;\n\
position: absolute;\n\
margin-left: -"+ world.art.panelStyle.leftBorder + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, world.art.panelStyle.topBorder + world.art.panelStyle.header, world.art.panelStyle.leftBorder, source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: calc(100% - "+ (parseInt("" + world.art.panelStyle.header) + parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
overflow: hidden;\n\
}\n\
.gamePanelContent:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
top: "+ (parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.header)) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, world.art.panelStyle.topBorder + world.art.panelStyle.header, world.art.panelStyle.rightBorder, source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: calc(100% - "+ (parseInt("" + world.art.panelStyle.header) + parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
overflow: hidden;\n\
}\n\
.gamePanelContentNoHeader {\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, world.art.panelStyle.topBorder + world.art.panelStyle.header, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
color: "+ Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
overflow-y: auto;\n\
height: calc(100% - "+ (parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
margin-left: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
}\n\
.gamePanelContentNoHeader:before {\n\
display: inline-block;\n\
position: absolute;\n\
margin-left: -"+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, world.art.panelStyle.topBorder + world.art.panelStyle.header, world.art.panelStyle.leftBorder, source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: calc(100% - "+ (parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
overflow: hidden;\n\
}\n\
.gamePanelContentNoHeader:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
top: "+ (parseInt("" + world.art.panelStyle.topBorder)) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, world.art.panelStyle.topBorder + world.art.panelStyle.header, world.art.panelStyle.rightBorder, source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: calc(100% - "+ (parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
overflow: hidden;\n\
}\n\
.gamePanelBottomBorder {\n\
width: calc(100% - "+ (parseInt("" + world.art.panelStyle.leftBorder) + parseInt("" + world.art.panelStyle.rightBorder)) + "px);\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, source.height - world.art.panelStyle.bottomBorder, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), world.art.panelStyle.bottomBorder) + "');\n\
height: "+ parseInt("" + world.art.panelStyle.bottomBorder) + "px;\n\
margin-left: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
}\n\
.gamePanelBottomBorder:before {\n\
display: inline-block;\n\
position: absolute;\n\
margin-left: -"+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, source.height - world.art.panelStyle.bottomBorder, world.art.panelStyle.leftBorder, world.art.panelStyle.bottomBorder) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: "+ parseInt("" + world.art.panelStyle.bottomBorder) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelBottomBorder:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, source.height - world.art.panelStyle.bottomBorder, world.art.panelStyle.rightBorder, world.art.panelStyle.bottomBorder) + "');\n\
width: "+ parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: "+ parseInt("" + world.art.panelStyle.bottomBorder) + "px;\n\
overflow: hidden;\n\
}\n\
.gameButton {\n\
border: solid 1px "+ Main.EnsureColor("" + world.art.panelStyle.buttonBorder) + ";\n\
background-color: "+ world.art.panelStyle.buttonBackground + ";\n\
color: "+ Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
font-weight: bold;\n\
padding: 2px;\n\
cursor: pointer;\n\
display: inline-block;\n\
margin: 2px;\n\
}\n\
.gameButton:hover {\n\
background-color: "+ Main.EnsureColor(world.art.panelStyle.buttonBackgroundHover) + ";\n\
}\n\
#mapLoadingPage {\n\
background-color: "+ Main.EnsureColor(world.art.panelStyle.buttonBackground) + ";\n\
color: "+ Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
}\n\
#chatLine { border: solid 1px "+ Main.EnsureColor("" + world.art.panelStyle.buttonBorder) + ";}\n\
.panelContentTableWithHeader {\n\
width: 100%;\n\
border-collapse: collapse;\n\
}\n\
.panelContentTableWithHeader thead td {\n\
background-color: "+ Main.EnsureColor(world.art.panelStyle.contentHeaderBackgroundColor) + ";\n\
color: "+ Main.EnsureColor(world.art.panelStyle.contentHeaderColor) + ";\n\
font-weight: bold;\n\
}\n\
.panelContentSelected {\n\
background-color: "+ Main.EnsureColor(world.art.panelStyle.contentSelectedColor) + ";\n\
}\n\
";
            if (world.art.panelStyle.chatPlaceholderColor)
            {
                html += "#chatLine::-webkit-input-placeholder { color: " + Main.EnsureColor(world.art.panelStyle.chatPlaceholderColor) + "}\n";
                html += "#chatLine:-moz-placeholder { color: " + Main.EnsureColor(world.art.panelStyle.chatPlaceholderColor) + "}\n";
                html += "#chatLine::-moz-placeholder { color: " + Main.EnsureColor(world.art.panelStyle.chatPlaceholderColor) + "}\n";
                html += "#chatLine:-ms-input-placeholder { color: " + Main.EnsureColor(world.art.panelStyle.chatPlaceholderColor) + "}\n";
            }

            if (world.art.panelStyle.chatNormalColor)
            {
                html += "#chatScroll div { color: " + Main.EnsureColor(world.art.panelStyle.chatNormalColor) + "; }\n";
                html += "#chatLine { color: " + Main.EnsureColor(world.art.panelStyle.chatNormalColor) + "; }\n";
                html += "#chatLine a { color: " + Main.EnsureColor(world.art.panelStyle.chatNormalColor) + "; }\n";
            }

            if (world.art.panelStyle.chatSeparatorColor)
            {
                html += "#chatScroll > div { border-bottom: dashed 1px " + Main.EnsureColor(world.art.panelStyle.chatSeparatorColor) + "; }\n";
            }

            if (world.art.panelStyle.chatSystemMessageColor)
            {
                html += "#chatScroll .chatSystemMessage {color: " + Main.EnsureColor(world.art.panelStyle.chatSystemMessageColor) + "; }\n";
            }

            for (var i in window)
            {
                if (i.indexOf("webkit") == 0)
                    continue;
                try
                {
                    if (window[i]['AdditionalCSS'] && typeof window[i]['AdditionalCSS'] == "function")
                        html += window[i]['AdditionalCSS']();
                }
                catch (ex)
                {
                }
            }

            $("#gameStyle").html(html);
        }
    }

    public static FormatDate(source: any): string
    {
        var dt: Date = null;
        if (typeof source == "string")
            dt = new Date(source);
        else
            dt = source;
        return dt.getFullYear() + "." +
            ("" + (dt.getMonth() + 1)).padLeft("0", 2) +
            "." + ("" + dt.getDate()).padLeft("0", 2);
    }

    public static FormatDateTime(source: any): string
    {
        var dt: Date = null;
        if (typeof source == "string")
            dt = new Date(source);
        else
            dt = source;
        return dt.getFullYear() + "." +
            ("" + (dt.getMonth() + 1)).padLeft("0", 2) +
            "." + ("" + dt.getDate()).padLeft("0", 2) +
            " " + ("" + dt.getHours()).padLeft("0", 2) +
            ":" + ("" + dt.getMinutes()).padLeft("0", 2);
    }

    public static TextTransform(source: string, transformUserInfo: boolean = false): string
    {
        source = source.replace(/&/g, "&amp;");
        source = source.replace(/</g, "&lt;");
        source = source.replace(/>/g, "&gt;");
        if (transformUserInfo && world && world.Player && world.Player.Username)
            source = source.replace(/@name@/gi, world.Player.Username.htmlEntities());
        else
            source = source.replace(/@name@/gi, "Player");
        source = source.replace(/\n/g, "<br>\n");
        source = source.replace(/\[big\]/gi, "<span style='font-size: 20px;'>");
        source = source.replace(/\[\/big\]/gi, "</span>");
        source = source.replace(/\[red\]/gi, "<span style='color: red;'>");
        source = source.replace(/\[\/red\]/gi, "</span>");
        source = source.replace(/\[blue\](.*)\[\/blue\]/gi, "<span style='color: blue;'>");
        source = source.replace(/\[\/blue\]/gi, "</span>");
        source = source.replace(/\[green\]/gi, "<span style='color: green;'>");
        source = source.replace(/\[\/green\]/gi, "</span>");
        source = source.replace(/\[yellow\](.*)\[\/yellow\]/gi, "<span style='color: yellow;'>");
        source = source.replace(/\[\/yellow\]/gi, "</span>");
        source = source.replace(/\[white\](.*)\[\/white\]/gi, "<span style='color: white;'>");
        source = source.replace(/\[\/white\]/gi, "</span>");
        source = source.replace(/\[black\](.*)\[\/black\]/gi, "<span style='color: black;'>");
        source = source.replace(/\[\/black\]/gi, "</span>");
        source = source.replace(/\[pink\](.*)\[\/pink\]/gi, "<span style='color: pink;'>");
        source = source.replace(/\[\/pink\]/gi, "</span>");
        source = source.replace(/\[b\]/gi, "<b>");
        source = source.replace(/\[\/b\]/gi, "</b>");
        source = source.replace(/\[hr\]/gi, "<hr>");
        source = source.replace(/\[i\]/gi, "<i>");
        source = source.replace(/\[\/i\]/gi, "</i>");
        source = source.replace(/([ \t\n\r]*\*[ \t]*)(.*)([ \t\n\r]*)/gi, "<li>$2</li>");
        source = source.replace(/\[list\]((.|\n|\r)*)\[\/list\]/gi, "<ul>$1</ul>");
        return source;
    }
}