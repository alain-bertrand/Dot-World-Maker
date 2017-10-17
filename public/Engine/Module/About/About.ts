class About
{
    public static Dispose()
    {
    }

    public static IsAccessible()
    {
        return true;
    }

    public static Recover()
    {
        $("#versionId").html("Version: " + engineVersion + " - " + engineBuild);
        if (Main.CheckNW())
        {
            var allA = $("a");
            for (var i = 0; i < allA.length; i++)
            {
                var a = () =>
                {
                    var link = allA.eq(i);
                    var href = link.prop("href");
                    link.prop("onclick", () =>
                    {
                        window['nw'].Shell.openExternal(href);
                        return false;
                    });
                    link.prop("href", "#");
                };
                a();
            }
        }
    }
}
