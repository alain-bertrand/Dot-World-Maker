interface MessageAttachment
{
    name: string;
    quantity: number;
}

var messageMenu = new (class
{
    public messageDisplayed: boolean = false;
    public firstInit: boolean = true;
    public selectedMessage: number = null;
    public nonRead: number = 0;
    public attachments: MessageAttachment[] = null;
});

class MessageMenu
{
    public static AdditionalCSS(): string
    {
        return "#messageIcon\n\
{\n\
    position: absolute;\n\
    left: -"+ parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    top: 330px;\n\
}\n\
#messageIcon .gamePanelContentNoHeader\n\
{\n\
    width: 74px;\n\
}\n\
";
    }

    static Init(position: number): number
    {
        if (!framework.Preferences['token'] || (world && world.ShowMessage === false) || framework.Preferences['token'] == "demo" || game)
        {
            $("#messageIcon").hide();
            return position;
        }

        $("#messageIcon").css("top", position + "px");
        $("#messageIcon .gamePanelContentNoHeader").html("<img src='/art/tileset2/message_icon.png'><div>10</div>");
        $("#messageIcon div.gamePanelContentNoHeader > div").html("0").hide();

        if (messageMenu.firstInit && chat.socket)
        {
            messageMenu.firstInit = false;

            chat.socket.on('new_message', () =>
            {
                for (var i = 0; i < world.Codes.length; i++)
                {
                    if (world.Codes[i].Enabled === false)
                        continue;
                    if (!world.Codes[i].code && world.Codes[i].Source)
                        world.Codes[i].code = CodeParser.ParseWithParameters(world.Codes[i].Source, world.Codes[i].Parameters);
                    if (world.Codes[i].code.HasFunction("OnPrivateMessage"))
                        world.Codes[i].code.ExecuteFunction("OnPrivateMessage", []);
                }

                MessageMenu.CheckCounter();
                MessageMenu.UpdateReceived();
            });
        }

        MessageMenu.CheckCounter();
        return position + 64 + world.art.panelStyle.topBorder;
    }

    static CheckCounter()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/CheckNewGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                if (data)
                {
                    messageMenu.nonRead = data;
                    $("#messageIcon div.gamePanelContentNoHeader > div").html(data).show();
                }
                else
                {
                    $("#messageIcon div.gamePanelContentNoHeader > div").html("0").hide();
                }
            },
            error: (msg) =>
            {
            }
        });
    }

    static Toggle()
    {
        if (!framework.Preferences['token'] || (world && world.ShowMessage === false) || framework.Preferences['token'] == "demo")
            return;

        $("#inventoryIcon").removeClass("openPanelIcon");
        inventoryMenu.inventoryDisplayed = false;
        $("#profileIcon").removeClass("openPanelIcon");
        profileMenu.profileDisplayed = false;
        $("#journalIcon").removeClass("openPanelIcon");
        journalMenu.journalDisplayed = false;

        if (messageMenu.messageDisplayed)
        {
            $("#gameMenuPanel").hide();
            $("#messageIcon").removeClass("openPanelIcon");
            messageMenu.messageDisplayed = false;
        }
        else
        {
            messageMenu.messageDisplayed = true;
            $("#gameMenuPanel").show();
            $("#messageIcon").addClass("openPanelIcon");
            MessageMenu.Update();
        }
    }

    static Update()
    {
        var html = "";
        html += "<table class='panelContentTableWithHeader'>";
        html += "<thead><tr><td>Date</td><td>Sender</td><td>Subject</td></tr></thead>";
        html += "</table>";

        html += "<div id='messageList'>";
        html += "</div>";
        html += "<div id='messageDetails'></div>";

        $("#gameMenuPanelContent").html(html);
        MessageMenu.UpdateReceived();
        MessageMenu.ShowCompose();
    }

    static UpdateReceived()
    {
        if (!messageMenu.messageDisplayed)
            return;

        $.ajax({
            type: 'POST',
            url: '/backend/GetGameMessageList',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                var html = "";
                if (data)
                {
                    html += "<table>";
                    for (var i = 0; i < data.length; i++)
                    {
                        html += "<tr onclick='MessageMenu.Read(" + data[i].id + ");' class='" + (data[i].newMessage ? "newMessage" : "") + (messageMenu.selectedMessage == data[i].id ? " panelContentSelected" : "") + "'>";
                        html += "<td>" + Main.FormatDateTime(data[i].sentDate) + "</td><td>" + data[i].from + "</td><td>" + data[i].subject + "</td>";
                        html += "</tr>";
                    }
                    html += "</table>";
                }
                $("#messageList").html(html);
            },
            error: (msg) =>
            {
            }
        });
    }

    static Read(id: number)
    {
        messageMenu.selectedMessage = id;

        $.ajax({
            type: 'POST',
            url: '/backend/GetGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                id: id
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                var html = "";
                if (data)
                {
                    if (data.isNew === true)
                    {
                        MessageMenu.CheckCounter();
                        MessageMenu.UpdateReceived();

                        if (data.attachments)
                        {
                            var attachments = <MessageAttachment[]>TryParse(data.attachments);
                            if (attachments && attachments.length > 0) for (var i = 0; i < attachments.length; i++)
                            {
                                world.Player.AddItem(attachments[i].name, attachments[i].quantity);
                            }
                        }
                    }

                    html += "<table>";
                    html += "<tr><td>From:</td><td>" + ("" + data.from).htmlEntities() + "</td></tr>";
                    html += "<tr><td>To:</td><td>" + ("" + data.to).htmlEntities() + "</td></tr>";
                    html += "<tr><td>Date:</td><td>" + Main.FormatDateTime(data.sentDate) + "</td></tr>";
                    html += "<tr><td>Subject:</td><td>" + ("" + data.subject).htmlEntities() + "</td></tr>";
                    html += "<tr><td>Message:</td><td>" + Main.TextTransform("" + data.message) + "</td></tr>";
                    var attachments = <MessageAttachment[]>TryParse(data.attachments);
                    if (attachments)
                    {
                        if (attachments && attachments.length > 0)
                            html += "<tr><td>Attachments:</td><td>";
                        for (var i = 0; i < attachments.length; i++)
                        {
                            html += "" + attachments[i].quantity + "x " + attachments[i].name + "<br>";
                        }
                        html += "</td></tr>";
                    }
                    html += "</table>";
                    html += "<center>";
                    html += "<div class='gameButton' onclick='MessageMenu.ShowCompose()'>New</div>";
                    html += "<div class='gameButton' onclick='MessageMenu.Reply(" + id + ")'>Reply</div>";
                    html += "<div class='gameButton' onclick='MessageMenu.Delete(" + id + ")'>Delete</div>";
                    html + "</center>";
                }
                $("#messageDetails").html(html);
            },
            error: (msg) =>
            {
                var data = TryParse(msg);
                $("#messageDetails").html("Error: " + (data && data.error ? data.error : msg));
            }
        });
    }

    static Reply(id: number)
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GetGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                id: id
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                var html = "";
                if (data)
                {
                    messageMenu.selectedMessage = null;
                    MessageMenu.CheckCounter();
                    MessageMenu.UpdateReceived();

                    html += "<table>";
                    var dest = data.to.replace(/,/g, ";").replace(/ /g, "").split(';');
                    for (var i = 0; i < dest.length; i++)
                        if (dest[i].toLowerCase() == world.Player.Username.toLowerCase())
                            dest[i] = data.from;
                    dest = (<string[]>dest).join(", ");
                    html += "<tr><td>To:</td><td><input type='text' id='message_to' value='" + dest.htmlEntities() + "' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
                    html += "<tr><td>Subject:</td><td><input type='text' id='message_subject' value='" + ("Re: " + data.subject.replace(/^re: /i, "")).htmlEntities() + "' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
                    html += "<tr><td>Message:</td><td>&nbsp;</td></tr>"
                    html += "<tr><td colspan='2'><textarea id='message_text' rows='10' onfocus='play.inField=true;' onblur='play.inField=false;'>\n\n\n" + data.message.replace(/<\//gi, "").replace(/^/gm, "> ") + "</textarea></td></tr>";
                    html += "<tr><td>Attach:</td><td colspan='2'><select onchange='MessageMenu.Attach()' id='new_attach'><option>-- Select an item to attach --</option>";
                    for (var i = 0; i < world.Player.Inventory.length; i++)
                    {
                        var canShow = true;
                        if (messageMenu.attachments) for (var j = 0; j < messageMenu.attachments.length; j++)
                        {
                            if (messageMenu.attachments[j].name == world.Player.Inventory[i].Name)
                            {
                                canShow = false;
                                break;
                            }
                        }
                        if (!canShow)
                            continue;
                        html += "<option value='" + encodeURIComponent(world.Player.Inventory[i].Name) + "'>" + world.Player.Inventory[i].Name + " (" + world.Player.Inventory[i].Count + ")</option>";
                    }
                    html += "</select></td></tr>"; html += "</table>";
                    html += "<center>";
                    html += "<div class='gameButton' onclick='MessageMenu.ShowCompose()'>New</div>";
                    html += "<div class='gameButton' onclick='MessageMenu.Send()'>Send</div>";
                    html += "<div class='gameButton' onclick='MessageMenu.Read(" + id + ")'>Cancel</div>";
                    html + "</center>";
                    setTimeout(() =>
                    {
                        $("#message_text").focus();
                    }, 100);
                }
                $("#messageDetails").html(html);
            },
            error: (msg) =>
            {
                var data = TryParse(msg);
                $("#messageDetails").html("Error: " + (data && data.error ? data.error : msg));
            }
        });
    }

    static Delete(id: number)
    {
        $.ajax({
            type: 'POST',
            url: '/backend/DeleteGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                id: id
            },
            success: (msg) =>
            {
                messageMenu.selectedMessage = null;
                MessageMenu.CheckCounter();
                MessageMenu.UpdateReceived();
                MessageMenu.ShowCompose();
            },
            error: (msg) =>
            {
                var data = TryParse(msg);
                $("#messageDetails").html("Error: " + (data && data.error ? data.error : msg));
            }
        });
    }

    static ShowCompose()
    {
        messageMenu.selectedMessage = null;
        MessageMenu.UpdateReceived();

        var html = "<div id='messageResult'></div><table>";
        html += "<tr><td>To:</td><td colspan='2'><input type='text' id='message_to' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        html += "<tr><td>Subject:</td><td colspan='2'><input type='text' id='message_subject' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        html += "<tr><td>Message:</td><td colspan='2'>&nbsp;</td></tr>";
        html += "<tr><td colspan='3'><textarea id='message_text' rows='10' onfocus='play.inField=true;' onblur='play.inField=false;'></textarea></td></tr>";
        if (messageMenu.attachments && messageMenu.attachments.length > 0)
        {
            html += "<tr><td>Attachments:</td><td>&nbsp;</td><td>&nbsp;</td></tr>";
            for (var i = 0; i < messageMenu.attachments.length; i++)
            {
                html += "<tr><td>&nbsp;</td><td>";
                html += "<div class='removeAttachement' onclick='MessageMenu.RemoveAttachment(" + i + ");'>X</div>";
                html += messageMenu.attachments[i].name + " (" + world.Player.GetInventoryQuantity(messageMenu.attachments[i].name) + ")</td>";
                html += "<td><input type='text' id='attach_" + i + "' value='" + messageMenu.attachments[i].quantity + "' onfocus='play.inField=true;' onblur='play.inField=false;' onkeyup='MessageMenu.ChangeAttach(" + i + ")'></tr>";
            }
            html += "</td></tr>";
        }
        html += "<tr><td>Attach:</td><td colspan='2'><select onchange='MessageMenu.Attach()' id='new_attach'><option>-- Select an item to attach --</option>";
        for (var i = 0; i < world.Player.Inventory.length; i++)
        {
            var canShow = true;
            if (messageMenu.attachments) for (var j = 0; j < messageMenu.attachments.length; j++)
            {
                if (messageMenu.attachments[j].name == world.Player.Inventory[i].Name)
                {
                    canShow = false;
                    break;
                }
            }
            if (!canShow)
                continue;
            html += "<option value='" + encodeURIComponent(world.Player.Inventory[i].Name) + "'>" + world.Player.Inventory[i].Name + " (" + world.Player.Inventory[i].Count + ")</option>";
        }
        html += "</select></td></tr>";
        html += "</table>";
        html += "<center><div class='gameButton' onclick='MessageMenu.Send()'>Send</div></center>";
        $("#messageDetails").html(html);
        setTimeout(() =>
        {
            $("#message_to").focus();
        }, 100);
    }

    static RemoveAttachment(rowId: number)
    {
        var to = $("#message_to").val();
        var subject = $("#message_subject").val();
        var message = $("#message_text").val();

        messageMenu.attachments.splice(rowId, 1);

        MessageMenu.ShowCompose();
        $("#message_to").val(to);
        $("#message_subject").val(subject);
        $("#message_text").val(message);
    }

    static Attach()
    {
        var to = $("#message_to").val();
        var subject = $("#message_subject").val();
        var message = $("#message_text").val();

        if (!messageMenu.attachments)
            messageMenu.attachments = [];

        messageMenu.attachments.push({
            name: decodeURIComponent($("#new_attach").val()),
            quantity: 1
        });
        MessageMenu.ShowCompose();
        $("#message_to").val(to);
        $("#message_subject").val(subject);
        $("#message_text").val(message);
    }

    static ChangeAttach(rowId)
    {
        $("#attach_" + rowId).css("background-color", "");
        var val = 0;
        try
        {
            val = parseInt($("#attach_" + rowId).val());
        }
        catch (ex)
        {
            $("#attach_" + rowId).css('backgroundColor', '#FFE0E0');
        }
        if (val <= 0 || world.Player.GetInventoryQuantity(messageMenu.attachments[rowId].name) < val)
        {
            $("#attach_" + rowId).css('backgroundColor', '#FFE0E0');
            val = 0;
        }
        messageMenu.attachments[rowId].quantity = val;
    }

    static Send()
    {
        if (messageMenu.attachments)
        {
            for (var i = 0; i < messageMenu.attachments.length; i++)
            {
                if (world.Player.GetInventoryQuantity(messageMenu.attachments[i].name) < messageMenu.attachments[i].quantity)
                {
                    $("#messageResult").html("Error: you don't have " + messageMenu.attachments[i].quantity + " " + messageMenu.attachments[i].name);
                    return;
                }
            }
        }
        $.ajax({
            type: 'POST',
            url: '/backend/AddGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                to: $("#message_to").val(),
                subject: $("#message_subject").val() && $("#message_subject").val().trim() != "" ? $("#message_subject").val() : "(no subject)",
                message: $("#message_text").val(),
                attachments: JSON.stringify(messageMenu.attachments ? messageMenu.attachments : null)
            },
            success: (msg) =>
            {
                if (messageMenu.attachments && messageMenu.attachments.length > 0)
                {
                    $("#messageDetails table tr:nth-child(5)").remove();
                    for (var i = 0; i < messageMenu.attachments.length; i++)
                    {
                        world.Player.RemoveItem(messageMenu.attachments[i].name, messageMenu.attachments[i].quantity);
                        $("#messageDetails table tr:nth-child(5)").remove();
                    }
                }

                messageMenu.attachments = null;
                $("#messageResult").html("Message sent successfully");
                $("#message_to").val("");
                $("#message_subject").val("");
                $("#message_text").val("")
            },
            error: (msg) =>
            {
                var data = TryParse(msg);
                $("#messageResult").html("Error: " + (data && data.error ? data.error : msg));
            }
        });
    }

    static SendMessage(destination: string, subject: string, message: string)
    {
        if (!framework.Preferences['token'] || (world && world.ShowMessage === false) || framework.Preferences['token'] == "demo" || game)
        {
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/backend/AddGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                to: destination,
                subject: subject,
                message: message
            },
            success: (msg) =>
            {
            },
            error: (msg) =>
            {
            }
        });
    }
}