@DialogActionClass
class ShowMinimap extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        return html;
    }

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        play.showMinimap = true;
    }
}