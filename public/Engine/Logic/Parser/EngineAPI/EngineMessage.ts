/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineMessage
{
    @ApiMethod([{ name: "username", description: "Destination user." }, { name: "subject", description: "The subject of the message" }, { name: "message", description: "Message to send" }], "Sends an offline message (in-game email).")
    SendMessage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        MessageMenu.SendMessage(values[0].GetString(), values[1].GetString(), values[2].GetString());
        return null;
    }

    @ApiMethod([], "Returns true if there is a new non-read message.")
    HasNewMessage(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(messageMenu.nonRead > 0);
    }
}