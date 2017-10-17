class ChatBot implements ChatBotInterface
{
    public Name: string = "";
    public Channel: string = "*";
    public Sentences: ChatBotSentence[] = [];

    private isFollowUp: boolean = false;
    public HandleChat(line: string, callback: (result: string) => void): void
    {
        if (this.isFollowUp === null || this.isFollowUp === undefined)
            this.isFollowUp = false;

        var waitAll = this.Sentences.length;
        var endResult = null;

        for (var i = 0; i < this.Sentences.length; i++)
        {
            this.Sentences[i].HandleChat(this.Name, this.isFollowUp, line, (res: string) =>
            {
                waitAll--;
                if (res)
                    endResult = res;
                if (waitAll == 0)
                {
                    if (endResult)
                        this.isFollowUp = true;
                    else
                        this.isFollowUp = false;
                    callback(endResult);
                }
            });
        }
    }

    public ResetLogic()
    {
        for (var i = 0; i < this.Sentences.length; i++)
        {
            this.Sentences[i].ResetLogic();
        }
    }

    public static Rebuild(source: ChatBotInterface)
    {
        var res: ChatBot = Object.cast(source, ChatBot);
        res.Sentences = res.Sentences.map((m) => { return Object.cast(m, ChatBotSentence); });
        return res;
    }

    public Store(): ChatBotInterface
    {
        return {
            Name: this.Name,
            Channel: this.Channel,
            Sentences: this.Sentences.map((s) =>
            {
                return s.Store();
            })
        };
    }
}