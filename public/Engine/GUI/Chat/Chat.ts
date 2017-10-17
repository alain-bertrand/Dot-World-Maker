interface Smilie
{
    regexp: RegExp;
    html: string;
}

var chat = new (class
{
    public chatInterval: number;
    public intervalCounter: number = 0;
    public chatNewMessage: boolean = false;
    public socket;
    public wasHidden: boolean = false;
    public onMapChat: boolean = false;
    public smiliesDb: Smilie[];
    public channels: ChatChannels = {};
    public currentChannel: string;
    public smilies_txt: [string[]] = [[":-)", ":)"], [":-P", ":P", ":-p", ":p"], [":O", ":o", ":-o", ":-O"], [":-(", ":("], [":-/"], [";-)",
        ";)"], [":D", ":-D"], ["8)", "8-)"], ["B)", "B-)"], ["XD", "xD", "X-D"], ["T.T"], ["^^'", "^.^'"], ["^^", "^.^"], ["O.O", "o.o"],
        ["8|", "8-|"], ["\M/"], ["&gt;.&lt;"], ["XP", "X-P"], ["oO", "o.O", "o0", "o.0"], ["-.-"], ["(:&lt;"], ["'W'"], [":S", ":-S"],
        ["*.*"], [":X"], ["X.X", "x.x"], ["$.$"], ["o@@o"], ["9.9"], ["O:&lt;"], ["B|"], ["B("], ["B0"], ["@.@"], ["^**^"], ["9.6"],
        ["/.O"], ["d.b"], ["&gt;.&gt;"], ["=^_^="]];
});

interface ChatChannels
{
    [s: string]: ChatChannel;
}

interface ChatChannel
{
    newMessage: boolean;
    messages: ChatMessage[];
    users: string[];
}

interface ChatMessage
{
    sender: string;
    message: string;
}

class Chat
{
    public static AdditionalCSS(): string
    {
        var r = parseInt(Main.EnsureColor(world.art.panelStyle.buttonBackground).substr(1, 2), 16);
        var g = parseInt(Main.EnsureColor(world.art.panelStyle.buttonBackground).substr(3, 2), 16);
        var b = parseInt(Main.EnsureColor(world.art.panelStyle.buttonBackground).substr(5, 2), 16);
        return "#chatEntry\n\
{\n\
    width: calc(100% - "+ (95 + world.art.panelStyle.leftBorder) + "px);\n\
    top: "+ (("" + document.location).indexOf("maker.html") != -1 ? "35px" : "5px") + ";\n\
}\n\
#chatEntryLine {\n\
    background-color: rgba("+ r + "," + g + "," + b + ",0.6);\n\
    color: "+ Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
    border: solid 1px "+ Main.EnsureColor(world.art.panelStyle.buttonBorder) + ";\n\
}\n\
#chatContainer {\n\
    width: calc(100% - 95px);\n\
    top: "+ (("" + document.location).indexOf("maker.html") != -1 ? "65px" : "35px") + ";\n\
}\n\
@media (min-width: 1000px)\n\
{\n\
    #chatContainer {\n\
        left: calc(50% + "+ (parseInt("" + world.art.quickslotStyle.width) / 2 + 5) + "px);\n\
        top: auto;\n\
        bottom: 40px;\n\
        width: auto;\n\
    }\n\
    #chatEntry\n\
    {\n\
        left: calc(50% + "+ (parseInt("" + world.art.quickslotStyle.width) / 2 + 5) + "px);\n\
        width: auto;\n\
        top: auto;\n\
        bottom: 5px;\n\
    }\n\
}\n\
#chatChannels div {\n\
    border: solid 1px "+ Main.EnsureColor(world.art.panelStyle.buttonBorder) + ";\n\
}\n\
.selectedChannel {\n\
    background-color: "+ Main.EnsureColor(world.art.panelStyle.buttonBorder) + ";\n\
}";
    }

    static Init()
    {
        if (!framework.Preferences['token'] || world.Edition == EditorEdition.Demo || framework.Preferences['token'] == "demo" || window['io'] == undefined || window['io'] == null || world.ChatEnabled === false)
        {
            $("#chatEntry").hide();
            return;
        }
        if (world.Player.ChatBannedTill && typeof world.Player.ChatBannedTill == "string")
            world.Player.ChatBannedTill = new Date(<any>world.Player.ChatBannedTill);
        if (world.Player.ChatMutedTill && typeof world.Player.ChatMutedTill == "string")
            world.Player.ChatMutedTill = new Date(<any>world.Player.ChatMutedTill);

        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() < (new Date()).getTime())
            world.Player.ChatBannedTill = null;
        if (world.Player.ChatMutedTill && world.Player.ChatMutedTill.getTime() < (new Date()).getTime())
            world.Player.ChatMutedTill = null;

        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() > (new Date()).getTime())
        {
            $("#chatContainer").hide();
            $("#chatEntry").hide();
            return;
        }

        chat.socket = window['io']();
        chat.socket.on('connect', Chat.Connect);
        chat.socket.on('chat', Chat.Receive);
        chat.socket.on('join', Chat.Join);
        chat.socket.on('leave', Chat.Leave);
        chat.socket.on('channelUserList', Chat.ChannelUserList);
        chat.socket.on('chatBot', Chat.BotLine);
        chat.socket.on('mute',
            (till) =>
            {
                world.Player.ChatMutedTill = new Date(till);
                world.Player.StoredCompare = world.Player.JSON();
                Framework.ShowMessage("You have been chat muted till " + world.Player.ChatMutedTill);
            });
        chat.socket.on('ban',
            (till) =>
            {
                world.Player.ChatBannedTill = new Date(till);
                world.Player.StoredCompare = world.Player.JSON();
                Framework.ShowMessage("You have been chat banned till " + world.Player.ChatBannedTill);
                $("#chatContainer").hide();
                $("#chatEntry").hide();
            });

        $("#chatTitle").bind("click", Chat.ShowHide);
        $("#chatCollapsed").bind("click", Chat.ShowHide);

        if (!chat.chatInterval)
            chat.chatInterval = setInterval(Chat.ChatInterval, 500);
    }

    static ChatInterval()
    {
        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() > (new Date()).getTime())
        {
            $("#chatContainer").hide();
            $("#chatEntry").hide();
            return;
        }

        // We entered in a zone
        if (play.renderer && !chat.channels[world.Player.Zone.replace(/\./g, "_")])
        {
            chat.socket.emit('join', world.Id, framework.Preferences['token'], world.Player.Zone.replace(/\./g, "_"));

            var items: string[] = [];
            for (var item in chat.channels)
                items.push(item);

            chat.channels[world.Player.Zone.replace(/\./g, "_")] = { newMessage: false, messages: [], users: [] };

            for (var i = 0; i < items.length; i++)
            {
                var item = items[i];
                if (item == "#global" || item == world.Player.Zone.replace(/\./g, "_"))
                    continue;
                chat.socket.emit('leave', world.Id, framework.Preferences['token'], item.replace(/\./g, "_"));
                delete chat.channels[item];
            }
            Chat.UpdateChannels();
            if (chat.currentChannel != "#global" || items.length == 1)
                Chat.SelectChannel(world.Player.Zone.replace(/\./g, "_"));
        }
        // We left the play page
        if (!play.renderer)
        {
            var updated = false;
            var items: string[] = [];
            for (var item in chat.channels)
                items.push(item);
            for (var i = 0; i < items.length; i++)
            {
                var item = items[i];
                if (item == "#global")
                    continue;
                updated = true;
                delete chat.channels[item];
                chat.socket.emit('leave', world.Id, framework.Preferences['token'], item);
            }
            if (updated)
                Chat.UpdateChannels();
            Chat.SelectChannel("#global");
        }

        if (play.renderer && chat.onMapChat === false)
        {
            chat.onMapChat = true;
            $("#chatEntry").show();
            $("#chatLine").hide();
            $("#chatScroll").addClass("fullChatScroll");
            $("#chatUserList").addClass("fullChatScroll");
        }
        else if (!play.renderer && chat.onMapChat === true)
        {
            chat.onMapChat = false;
            $("#chatEntry").hide();
            $("#chatLine").show();
            $("#chatScroll").removeClass("fullChatScroll");
            $("#chatUserList").removeClass("fullChatScroll");
        }

        if ($("#chatCollapsed").is(":visible") && chat.chatNewMessage)
        {
            if (chat.intervalCounter % 2)
                $("#chatCollapsed .gamePanelContentNoHeader > div").html("- New message -");
            else
                $("#chatCollapsed .gamePanelContentNoHeader > div").html("Click to chat");
        }

        for (var item in chat.channels)
        {
            if (chat.channels[item].newMessage)
            {
                Chat.UpdateChannels();
                break;
            }
        }
        chat.intervalCounter = 1 - chat.intervalCounter;
    }

    static Connect()
    {
        if (!framework.Preferences['token'] || world.Edition == EditorEdition.Demo || framework.Preferences['token'] == "demo" || window['io'] == undefined || window['io'] == null)
            return;

        chat.socket.emit('join', world.Id, framework.Preferences['token'], "#global");
        chat.channels["#global"] = { newMessage: false, messages: [], users: [] };
        Chat.UpdateChannels();
        Chat.SelectChannel("#global");

        if (framework.Preferences["ChatVisible"] === false)
        {
            $("#chatContainer").hide();
            $("#chatCollapsed").show();
        }
        else
        {
            $("#chatContainer").show();
            $("#chatCollapsed").hide();
        }

        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() > (new Date()).getTime())
        {
            $("#chatContainer").hide();
            $("#chatEntry").hide();
            return;
        }
    }

    static Key(evt: KeyboardEvent, field: string)
    {
        switch (evt.keyCode)
        {
            case 13:
                Chat.SendLine($("#" + field).val());
                $("#" + field).val("");
                break;
            case 27:
                $("#" + field).blur();
                if (chat.wasHidden == true)
                    Chat.ShowHide();
                break;
            default:
                break;
        }
    }

    static SelectChannel(channel: string)
    {
        if (!chat.channels[channel])
            return;
        chat.currentChannel = channel;
        chat.channels[channel].newMessage = false;
        Chat.RedrawUserList();
        Chat.RedrawChannelHistory();
        /*$("#chatChannels div").removeClass("selectedChannel");
        $("#" + channel.id()).addClass("selectedChannel");*/
        Chat.UpdateChannels();
    }

    static UpdateChannels()
    {
        var html = "<span>Channels:</span>";
        for (var item in chat.channels)
            html += "<div onclick=\"Chat.SelectChannel('" + item.replace(/'/g, "\\'") + "');\" id=\"" + item.id() + "\" class='" + (item == chat.currentChannel ? " selectedChannel" : "") + (chat.channels[item].newMessage && chat.intervalCounter % 2 ? " channelNewMessage" : "") + "'>" + item + "</div>";
        $("#chatChannels").html(html);
    }

    static UpdateAllChannelsUserList()
    {
        for (var i in chat.channels)
        {
            Chat.UpdateChannelUserList(i);
        }
    }

    static UpdateChannelUserList(channel: string)
    {
        chat.socket.emit('getChannelUserList', world.Id, channel);
    }

    static ChannelUserList(channel: string, users: string[])
    {
        if (!chat.channels[channel])
            return;
        for (var i = 0; i < world.ChatBots.length; i++)
        {
            // Skip the invisible bots
            if (world.ChatBots[i].Name[0] == "~")
                continue;
            if (world.ChatBots[i].Channel == "*" || world.ChatBots[i].Channel == "" || world.ChatBots[i].Channel.toLowerCase() == channel.toLowerCase())
                users.push(world.ChatBots[i].Name);
        }
        chat.channels[channel].users = users;
        if (chat.currentChannel == channel)
            Chat.RedrawUserList();
    }

    static Join(user: string, channel: string)
    {
        Chat.AddChatLine("", channel, "<b class='chatSystemMessage'>" + user + " joined " + channel + "</b>");
        Chat.UpdateChannelUserList(channel);
    }

    static Leave(user: string, channel: string)
    {
        Chat.AddChatLine("", channel, "<b class='chatSystemMessage'>" + user + " left " + channel + "</b>");
        Chat.UpdateChannelUserList(channel);
    }

    static BotLine(botname: string, fromUser: string, channel: string, line: string)
    {
        if (botname[0] == "~")
            Chat.AddChatLine(null, channel, line.htmlEntities(false).replace(/\n/g, "<br />"));
        else
            Chat.AddChatLine(botname, channel, line.htmlEntities(false).replace(/\n/g, "<br />"));
    }

    static SendBotLine(botname: string, channel: string, line: string)
    {
        if (framework.Preferences['token'] == "demo")
        {
            Chat.AddChatLine(null, chat.currentChannel, "The chat is disabled in the demo.");
            return;
        }
        if (!chat || !chat.socket)
            return;
        if (!world.Player.ChatMutedTill || world.Player.ChatMutedTill.getTime() < (new Date()).getTime())
            chat.socket.emit('bot', botname, channel, line);
    }

    static SendLine(line: string, channel: string = null)
    {
        if (world.Player.ChatMutedTill && world.Player.ChatMutedTill.getTime() >= (new Date()).getTime())
        {
            Chat.AddChatLine(null, chat.currentChannel, "<b>!! you are chat muted till " + world.Player.ChatMutedTill + " !!</b>");
            return;
        }
        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() >= (new Date()).getTime())
        {
            Chat.AddChatLine(null, chat.currentChannel, "<b>!! you are chat banned till " + world.Player.ChatBannedTill + " !!</b>");
            return;
        }

        if (!chat || !chat.socket)
            return;
        if (framework.Preferences['token'] == "demo")
        {
            Chat.AddChatLine(null, chat.currentChannel, "The chat is disabled in the demo.");
            return;
        }

        var line = line.trim();
        if (!line || line == "")
            return;

        var botToRun = 0;
        var botHandled = false;
        var normalHandling = () =>
        {
            if (botHandled == true || botToRun > 0)
                return;

            if (line.toLowerCase().indexOf("/e ") == 0 || line.toLowerCase().indexOf("/emote ") == 0)
            {
                var emote = "--";
                try
                {
                    emote = line.split(' ')[1].toLowerCase();
                }
                catch (ex)
                {
                }
                if (EmotesArt[emote] !== undefined)
                {
                    world.Player.EmoteTimer = 0;
                    world.Player.CurrentEmote = EmotesArt[emote];
                }
                else
                    Chat.AddChatLine(null, channel ? channel : chat.currentChannel, "Unknown emote.");
            }
            else if (line.toLowerCase().indexOf("/") == 0 && line.toLowerCase().indexOf("/me ") != 0)
            {
                Chat.AddChatLine(null, channel ? channel : chat.currentChannel, "Unknown command.");
            }
            else
                chat.socket.emit('send', channel ? channel : chat.currentChannel, line);
        };

        var toExecute = [];

        for (var i = 0; i < world.ChatBots.length; i++)
        {
            if (!(world.ChatBots[i].Channel == "*" || world.ChatBots[i].Channel == "" || world.ChatBots[i].Channel.toLowerCase() == channel.toLowerCase()))
                continue;
            botToRun++;
        }
        if (world.ChatBots.length > 0) for (var i = 0; i < world.ChatBots.length; i++)
        {
            if (!(world.ChatBots[i].Channel == "*" || world.ChatBots[i].Channel == "" || world.ChatBots[i].Channel.toLowerCase() == channel.toLowerCase()))
                continue;
            var a = function ()
            {
                var bot = world.ChatBots[i];
                bot.HandleChat(line, (res) =>
                {
                    botToRun--;
                    if (res)
                    {
                        //Chat.AddChatLine(username, chat.currentChannel, line);
                        //Chat.AddChatLine(world.ChatBots[i].Name, chat.currentChannel, res);
                        if (res[0] == "/")
                            chat.socket.emit('bot', bot.Name, channel ? channel : chat.currentChannel, "/" + res);
                        else if (res[0] == "!")
                            Chat.AddChatLine(bot.Name[0] == "~" ? null : bot.Name, channel ? channel : chat.currentChannel, res.substr(1).htmlEntities(false).replace(/\n/g,"<br />"));
                        else
                        {
                            chat.socket.emit('send', channel ? channel : chat.currentChannel, line);
                            chat.socket.emit('bot', bot.Name, channel ? channel : chat.currentChannel, res);
                        }
                        botHandled = true;
                    }
                    else
                        normalHandling();
                });
            }();
        }
        else
            normalHandling();
    }

    static Receive(sender: string, channel: string, message: string)
    {
        if (!chat.channels[channel])
            return;
        if ($("#chatCollapsed").is(":visible"))
            chat.chatNewMessage = true;
        if (chat.currentChannel != channel)
            chat.channels[channel].newMessage = true;
        Chat.AddChatLine(sender, channel, message);
    }

    static UrlChanger(str)
    {
        return str.replace(/(^|\s|\>)(http[s]{0,1}:\/\/[a-zA-Z0-9\/\-\+:\.\?=_\&\#\;\%\,~]{1,30})([a-zA-Z0-9\/\-\+:\.\?=_\&\#\;\%\,~]*)/g, "$1[<A HREF='$2$3' TARGET='_BLANK'>$2 ...</A>]");
    }

    static Smilies(str)
    {
        if (!chat.smiliesDb) // Build the db
        {
            chat.smiliesDb = [];
            for (var i = 0; i < chat.smilies_txt.length; i++)
            {
                for (var j = 0; j < chat.smilies_txt[i].length; j++)
                {
                    var e = chat.smilies_txt[i][j].replace(/([\.\+\|\\\$\^\(\)\:\?\*\/])/g, '\\$1');
                    chat.smiliesDb.push({ regexp: new RegExp("(^|\\s|\\>)" + e + "(\\s|\\<|$)", "g"), html: "$1<div style='background-image: url(\"/art/tileset2/smilies.png\"); display: inline-block; width: 20px; height: 16px; background-position: -" + (i * 20) + "px 0px;'></div>$2" });
                }
            }
        }
        for (var i = 0; i < chat.smiliesDb.length; i++)
            str = str.replace(chat.smiliesDb[i].regexp, chat.smiliesDb[i].html);
        return str;
    }

    static AddChatLine(sender: string, channel: string, message: string)
    {
        if (!chat.channels[channel])
            return;
        //chat.channels[channel] = [];
        chat.channels[channel].messages.push({ sender: sender, message: message });
        while (chat.channels[channel].messages.length > 100)
            chat.channels[channel].messages.shift();

        if (channel == chat.currentChannel)
            Chat.AddChatScrollLine(sender, message);
    }

    static AddChatScrollLine(sender: string, message: string)
    {
        if (!message || message.length == 0)
            return;
        if (message.toLowerCase().indexOf("/me ") == 0)
        {
            message = "<b>-- " + ("" + sender).htmlEntities(false) + " " + message.substr(3).trim().htmlEntities(false) + " --</b>";
            sender = null;
        }
        else if (message.indexOf("//") == 0 && sender != null)
        {
            return;
        }
        else if (message.indexOf("//") == 0)
        {
            message = "<b>** " + message.substr(2).trim() + " **</b>";
            sender = null;
        }
        if (sender != null && sender != "")
            message = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (world.ChatSmilies)
            message = Chat.Smilies(message);
        if (world.ChatLink)
            message = Chat.UrlChanger(message);

        var chatScroll = $("#chatScroll").first();
        while (chatScroll.children.length > 100)
            chatScroll.removeChild(chatScroll.children[0]);
        $("#chatScroll").html($("#chatScroll").html() + "<div><div" + (sender ? " onclick='PublicViewPlayer.Show(\"" + sender + "\");'" : "") + ">" + (!sender || sender == "" ? "&nbsp;" : sender.htmlEntities(false)) + "</div><div>" + message + "</div></div>");
        $("#chatScroll").scrollTop($("#chatScroll").scrollTop() + 60000);
    }

    static RedrawUserList()
    {
        var html = "";
        var users = chat.channels[chat.currentChannel].users;
        if (users)
        {
            users.sort();
            for (var i = 0; i < users.length; i++)
            {
                html += "<div>" + users[i] + "</div>";
            }
        }
        $("#chatUserList").html(html);
    }

    static RedrawChannelHistory()
    {
        $("#chatScroll").html("");
        for (var i = 0; i < chat.channels[chat.currentChannel].messages.length; i++)
            Chat.AddChatScrollLine(chat.channels[chat.currentChannel].messages[i].sender, chat.channels[chat.currentChannel].messages[i].message);
    }

    public static Focus()
    {
        if ($("#chatCollapsed").is(":visible"))
        {
            chat.wasHidden = true;
            Chat.ShowHide();
        }
        else
            chat.wasHidden = false;

        if (chat.onMapChat)
            $("#chatEntryLine").focus();
        else
            $("#chatLine").focus();
    }

    static ShowHide()
    {
        if ($("#chatCollapsed").is(":visible"))
        {
            $("#chatContainer").show();
            $("#chatCollapsed").hide();
            chat.chatNewMessage = false;
            $("#chatCollapsed .gamePanelContentNoHeader > div").html("Click to chat");
        }
        else
        {
            $("#chatContainer").hide();
            $("#chatCollapsed").show();
        }

        framework.Preferences["ChatVisible"] = !$("#chatCollapsed").is(":visible");
        Framework.SavePreferences();
    }
}