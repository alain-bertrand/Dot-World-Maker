interface OpenMapModification
{
    what: string;
    oldName: string;
    newName: string;
}

var mapUtilities = new (class
{
    public serverCallTimeout: number;
    public openModifications: OpenMapModification[] = [];
});

class MapUtilities
{
    public static Modify(what: string, oldName: string, newName: string): void
    {
        // Make the first letter an upper case
        what = what.toLowerCase();
        what = what[0].toUpperCase() + what.substr(1);

        // Don't call the server on each keystroke, wait 5sec from the last modification then call it.
        if (mapUtilities.serverCallTimeout)
            clearTimeout(mapUtilities.serverCallTimeout);
        mapUtilities.serverCallTimeout = setTimeout(MapUtilities.ServerCall, 5000);

        var found = false;
        for (var i = 0; i < mapUtilities.openModifications.length; i++)
        {
            if (mapUtilities.openModifications[i].what == what && mapUtilities.openModifications[i].newName == oldName)
            {
                // basically no change? We drop the change
                if (mapUtilities.openModifications[i].oldName == newName)
                    mapUtilities.openModifications.splice(i, 1);
                else
                    mapUtilities.openModifications[i].newName = newName;
                found = true;
                break;
            }
        }

        if (!found)
            mapUtilities.openModifications.push({
                what: what,
                oldName: oldName,
                newName: newName
            });

        if (mapUtilities.openModifications.length == 0)
        {
            clearTimeout(mapUtilities.serverCallTimeout);
            mapUtilities.serverCallTimeout = null;
        }
    }

    private static ServerCall()
    {
        mapUtilities.serverCallTimeout = null;
        var change = mapUtilities.openModifications.shift();
        // We still have to do
        if (mapUtilities.openModifications.length > 0)
            mapUtilities.serverCallTimeout = setTimeout(MapUtilities.ServerCall, 5000);

        var data = {
            game: world.Id,
            token: framework.Preferences['token']
        };
        data["old" + change.what] = change.oldName;
        if (change.newName)
            data["new" + change.what] = change.newName;

        $.ajax({
            type: 'POST',
            url: '/backend/UpdateMapDetails',
            data: data,
            success: (msg) =>
            {
                if (TryParse(msg) == true)
                {
                    Framework.ShowMessage("Map modified.");
                    world.ResetAreas();
                    mapEditor.modified = true;
                }
            },
            error: function (msg, textStatus)
            {
                var message = TryParse(msg);
                if (message && message.error)
                    msg = message.error;
                Framework.Alert("Error: " + msg);
            }
        });
    }
}