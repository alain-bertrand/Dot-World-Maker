class Logout
{
    public static Dispose()
    {
    }

    public static Recover()
    {
        delete framework.Preferences['token'];
        delete framework.Preferences['user'];
        Framework.SavePreferences();

        var query = Framework.ParseQuery();
        if (selfHosted) // Special url for self-hosted engines.
            document.location.assign("/");
        else if (("" + document.location).indexOf("/maker.html?") != -1)
            document.location.assign("/");
        else
            document.location.assign("/play.html?game=" + query.game);
    }
}