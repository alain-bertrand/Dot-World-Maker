var isHtmlStandalone: boolean = false;

class Runtime
{
    public static HtmlInit()
    {
        isHtmlStandalone = true;
        world = World.Rebuild(JSON.stringify(game.data));
        world.Edition = EditorEdition.Standard;
        world.Id = 2;
        world.ShowFPS = false;
        world.Init();
        Main.GenerateGameStyle();
        world.ResetAreas();
        world.ResetGenerator();
        Framework.ReloadPreferences();
        Play.Recover();
        Main.GenerateGameStyle();

        if (("" + document.location).substr(0, 4) != "http" && !Main.CheckNW())
            Main.AddErrorMessage("You must host your project with a web server otherwise some features will work correctly. For example the panels will not be displayed.");

        setTimeout(() =>
        {
            $("#branding").hide();
        }, 10000);
    }
}