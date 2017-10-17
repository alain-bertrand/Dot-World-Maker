var chatBotEditor = new (class
{
    public currentBot: ChatBot;
    public selectedSentence: ChatBotSentence;
    public listBot: ListSelector;
    public listSentences: ListSelector;
    public editor: CodeGraphEditor = null;
});

class ChatBotEditor
{
    public static Dispose()
    {
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        dialogCondition.currentEditor = "ChatBotEditor";

        chatBotEditor.listBot = new ListSelector("listChatBot", world.ChatBots, "Name");
        chatBotEditor.listBot.OnSelect = (rowId: number) =>
        {
            Framework.SetLocation({
                action: "ChatBotEditor", id: rowId === null ? null : world.ChatBots[rowId].Name
            });
            chatBotEditor.currentBot = (rowId === -1 || rowId === null ? null : world.ChatBots[rowId]);
            chatBotEditor.listSentences.UpdateList(chatBotEditor.currentBot ? chatBotEditor.currentBot.Sentences : []);
            chatBotEditor.listSentences.Select(null);
        };

        chatBotEditor.listSentences = new ListSelector("listBotSentences", [], "Trigger");
        chatBotEditor.listSentences.OnSelect = (rowId: number) =>
        {
            chatBotEditor.selectedSentence = (chatBotEditor.currentBot && rowId !== null ? chatBotEditor.currentBot.Sentences[rowId] : null);
            if (chatBotEditor.selectedSentence)
                ChatBotEditor.ShowSentence();
            else
                ChatBotEditor.ShowBotDetails();
        };

        if (framework.CurrentUrl.id)
        {
            var rowId: number = null;
            for (var i = 0; i < world.ChatBots.length; i++)
            {
                if (world.ChatBots[i].Name.toLowerCase() == framework.CurrentUrl.id.toLowerCase())
                {
                    rowId = i;
                    chatBotEditor.listBot.Select(i);
                    break;
                }
            }
            if (rowId == null)
            {
                framework.CurrentUrl.id = null;
                Framework.SetLocation({
                    action: "ChatBotEditor"
                });
            }
        }
    }

    public static NewBot()
    {
        chatBotEditor.currentBot = new ChatBot();
        chatBotEditor.currentBot.Name = NPC.GenerateName(true);
        var s = new ChatBotSentence();
        s.Trigger = "[hello,@bot@],[hi,@bot@],[hey,@bot@]";
        s.Answer = "Hi @name@";
        chatBotEditor.currentBot.Sentences.push(s);

        s = new ChatBotSentence();
        s.Trigger = "[how,are,@bot@]";
        s.Answer = "I'm fine thanks, and you?";
        s.FollowUp = true;
        chatBotEditor.currentBot.Sentences.push(s);

        s = new ChatBotSentence();
        s.Trigger = "[thanks,@bot@]";
        s.Answer = "You are welcome";
        s.FollowUp = true;
        chatBotEditor.currentBot.Sentences.push(s);

        s = new ChatBotSentence();
        s.Trigger = "[what,date,@bot@],[which,time,@bot@],[what,time,@bot@]";
        s.Answer = "-";
        s.FollowUp = true;
        s.Code = "function Answer()\n{\n	return \"It's \" + game.GetDateString() + \" for you.\";\n}";
        chatBotEditor.currentBot.Sentences.push(s);

        s = new ChatBotSentence();
        s.Trigger = "fuck,ass,gay,asshole";
        s.Answer = "Stop swearing or I shall glue your mouth!";
        s.FollowUp = false;
        chatBotEditor.currentBot.Sentences.push(s);

        world.ChatBots.push(chatBotEditor.currentBot);

        chatBotEditor.listBot.UpdateList();
        chatBotEditor.listBot.Select(world.ChatBots.length - 1);
        SearchPanel.Update();
        Chat.UpdateAllChannelsUserList();
    }

    public static DeleteBot()
    {
        if (!chatBotEditor.currentBot)
            return;
        Framework.Confirm("Are you sure you want to delete this chat bot?", () =>
        {
            for (var i = 0; i < world.ChatBots.length; i++)
            {
                if (world.ChatBots[i] == chatBotEditor.currentBot)
                {
                    world.ChatBots.splice(i, 1);
                    break;
                }
            }

            chatBotEditor.currentBot = null;
            chatBotEditor.listBot.UpdateList();
            chatBotEditor.listBot.Select(null);
            SearchPanel.Update();
            Chat.UpdateAllChannelsUserList();
        });
    }

    public static ShowBotDetails()
    {
        if (chatBotEditor.currentBot === null)
        {
            $("#chatBotDetails").html("");
            return;
        }

        var html = "";

        html += "<h2>" + chatBotEditor.currentBot.Name + "</h2>";
        html += "<table>";
        html += "<tr><td>Name:</td>"
        html += "<td><input type='text' value='" + chatBotEditor.currentBot.Name.htmlEntities() + "' id='chatbot_name' onkeyup='ChatBotEditor.UpdateBot(\"chatbot_name\",\"Name\")'></td></tr>";
        html += "<tr><td>Channel:</td>"
        html += "<td><input type='text' value='" + chatBotEditor.currentBot.Channel.htmlEntities() + "' id='chatbot_channel' onkeyup='ChatBotEditor.UpdateBot(\"chatbot_channel\",\"Channel\")'></td></tr>";
        html += "</table>";
        $("#chatBotDetails").html(html);
    }

    public static UpdateBot(fieldName: string, property: string)
    {
        var val = $("#" + fieldName).val();
        if (property == "Name")
        {
            $("#" + fieldName).css('backgroundColor', '');

            var alreadyExists = false;
            for (var i = 0; i < world.ChatBots.length; i++)
            {
                if (world.ChatBots[i].Name.toLowerCase() == val.toLowerCase() && world.ChatBots[i] != chatBotEditor.currentBot)
                {
                    alreadyExists = true;
                    break;
                }
            }

            if ((!val.match(new RegExp("^\\~{0,1}[a-z _01-9\(\)\-]+$", "i")) || !val || val.length < 1) || alreadyExists)
            {
                $("#" + fieldName).css('backgroundColor', '#FFE0E0');
                return;
            }
        }
        chatBotEditor.currentBot[property] = val;
        if (property == "Name")
        {
            chatBotEditor.listBot.UpdateList();
            Framework.SetLocation({
                action: "ChatBotEditor", id: chatBotEditor.currentBot.Name
            }, true, true);
            $("#chatBotDetails > h2").html(chatBotEditor.currentBot.Name);
            SearchPanel.Update();
            Chat.UpdateAllChannelsUserList();
        }
        else if (property == "Channel")
            Chat.UpdateAllChannelsUserList();
    }

    public static NewSentence()
    {
        if (!chatBotEditor.currentBot)
            return;
        chatBotEditor.currentBot.Sentences.push(new ChatBotSentence());
        chatBotEditor.listSentences.UpdateList();
        chatBotEditor.listSentences.Select(chatBotEditor.currentBot.Sentences.length - 1);
    }

    public static DeleteSentence()
    {
        if (!chatBotEditor.currentBot)
            return;
        for (var i = 0; i < chatBotEditor.currentBot.Sentences.length; i++)
        {
            if (chatBotEditor.currentBot.Sentences[i] == chatBotEditor.selectedSentence)
            {
                chatBotEditor.currentBot.Sentences.splice(i, 1);
                break;
            }
        }
        chatBotEditor.listSentences.UpdateList();
        chatBotEditor.listSentences.Select(null);
    }

    public static ShowSentence()
    {
        var html = "";
        html += "<table>";

        var conditions = [];
        for (var item in dialogCondition.code)
            conditions.push(item);
        conditions.sort();

        html += "<tr><td>Conditions:</td><td>&nbsp;</td>";
        for (var i = 0; i < chatBotEditor.selectedSentence.Conditions.length; i++)
        {
            var cond: DialogCondition = chatBotEditor.selectedSentence.Conditions[i];
            html += "<tr><td>" + cond.Name.title() + ": <span class='dialogBlockDelete' onclick='ChatBotEditor.DeleteCondition(" + i + ")'>X</span></td>";
            html += "<td>" + dialogCondition.code[cond.Name].Display(i, cond.Values, "ChangeCondition") + "</td></tr>";
        }

        html += "<tr><td colspan='2'><select id='add_condition' onchange='ChatBotEditor.AddCondition()'>";
        html += "<option value=''>- Add new condition --</option>";
        for (var i = 0; i < conditions.length; i++)
            html += "<option value='" + conditions[i] + "'>" + conditions[i].title() + "</option>";
        html += "</select></td></tr>";
        html += "<td></td></tr>";
        html += "<tr><td>Trigger:</td>";
        html += "<td><input type='text' value='" + chatBotEditor.selectedSentence.Trigger.htmlEntities() + "' id='chatbot_trigger' onkeyup='ChatBotEditor.UpdateSentence(\"chatbot_trigger\",\"Trigger\")'></td></tr>";
        html += "<tr><td>Auto Follow Up:</td>";
        html += "<td><select id='chatbot_followUp' onchange='ChatBotEditor.UpdateSentence(\"chatbot_followUp\",\"FollowUp\")'>";
        html += "<option value='true'" + (chatBotEditor.selectedSentence.FollowUp === true ? " selected" : "") + ">Yes</option>";
        html += "<option value='false'" + (chatBotEditor.selectedSentence.FollowUp !== true ? " selected" : "") + ">No</option>";
        html += "</select></td></tr>";
        html += "<tr><td>Answer:</td>";
        html += "<td><input type='text' value='" + chatBotEditor.selectedSentence.Answer.htmlEntities() + "' id='chatbot_answer' onkeyup='ChatBotEditor.UpdateSentence(\"chatbot_answer\",\"Answer\")'></td></tr>";
        html += "<tr><td>Code:</td>";
        html += "<td><div id='chatbot_codecontainer'><textarea id='chatbot_code' rows='10'>" + chatBotEditor.selectedSentence.Code + "</textarea></div></td></tr>";
        html += "</table>";
        $("#chatBotDetails").html(html);

        /*chatBotEditor.editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>$("#chatbot_code").first(),
            {
                lineNumbers: true,
                matchBrackets: true,
                continueComments: "Enter",
                tabSize: 4,
                indentUnit: 4,
                extraKeys: { "Ctrl-Q": "toggleComment" }
            });*/

        chatBotEditor.editor = new CodeGraphEditor("chatbot_code");
        chatBotEditor.editor.OnChange = ChatBotEditor.ChangeCode;
        $("#chatbot_codecontainer").width($("#chatBotDetails table tr > td:nth-child(2)").width() - 3);
    }

    public static UpdateSentence(fieldName: string, property: string)
    {
        var val: any = $("#" + fieldName).val();
        if (property == "FollowUp")
            val = (val === "true");
        chatBotEditor.selectedSentence[property] = val;
        chatBotEditor.selectedSentence.ResetLogic();
        if (property == "Trigger")
            chatBotEditor.listSentences.UpdateList();
    }

    static ChangeCondition(id: number, pos: number)
    {
        chatBotEditor.selectedSentence.Conditions[id].Values[pos] = $("#ChangeCondition_" + id + "_" + pos).val();
    }

    static DeleteCondition(rowId)
    {
        chatBotEditor.selectedSentence.Conditions.splice(rowId, 1);
        ChatBotEditor.ShowSentence();
    }

    static AddCondition()
    {
        var condition = $("#add_condition").val();
        (<HTMLSelectElement>$("#add_condition").first()).selectedIndex = 0;
        chatBotEditor.selectedSentence.Conditions.push({ Name: condition, Values: [] });
        ChatBotEditor.ShowSentence();
    }

    static ChangeCode()
    {
        chatBotEditor.selectedSentence.Code = chatBotEditor.editor.GetCode();
    }
}