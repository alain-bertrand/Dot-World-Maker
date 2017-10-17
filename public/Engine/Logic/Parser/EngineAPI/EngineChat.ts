/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineChat
{
    @ApiMethod([{ name: "channel", description: "Name of the channel to send it to." }, { name: "message", description: "Message to send" }], "Sends a chat message.")
    public SendMessage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        Chat.SendLine(values[1].GetString(), values[0].GetString());
        return null;
    }

    @ApiMethod([{ name: "botName", description: "Bot name used for posting the message." }, { name: "channel", description: "Name of the channel to send it to." }, { name: "message", description: "Message to send" }], "Sends a chat message as a bot.")
    public SendBotMessage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        Chat.SendBotLine(values[0].GetString(), values[1].GetString(), values[2].GetString());
        return null;
    }

    @ApiMethod([], "Returns the current active channel.")
    public CurrentChannel(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(chat.currentChannel);
    }

    @ApiMethod([{ name: "line", description: "Chat line to split" }], "Split a chat line into words.")
    public SplitLine(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(ChatBotSentence.SplitLine(values[0].GetString()).map((c) => { return new VariableValue(c); }));
    }

    @ApiMethod([{ name: "playerName", description: "The player to ban." }, { name: "days", description: "The number of days to ban." }], "Ban a player from the chat for the specified number of days.")
    public Ban(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $.ajax({
            type: 'POST',
            url: '/backend/ChatBan',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                username: values[0].GetString(),
                days: values[1].GetNumber()
            },
            success: (msg) =>
            {
            },
            error: function (msg, textStatus)
            {
                var data = TryParse(msg);
                Framework.ShowMessage("Error: " + (data && data.error ? data.error : msg));
            }
        });

        return null;
    }

    @ApiMethod([{ name: "playerName", description: "The player to mute." }, { name: "minutes", description: "The minutes to mute." }], "Mute a player for the specified number of minutes.")
    public Mute(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        $.ajax({
            type: 'POST',
            url: '/backend/ChatMute',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                username: values[0].GetString(),
                minutes: values[1].GetNumber()
            },
            success: (msg) =>
            {
            },
            error: function (msg, textStatus)
            {
                var data = TryParse(msg);
                Framework.ShowMessage("Error: " + (data && data.error ? data.error : msg));
            }
        });
        return null;
    }    
}