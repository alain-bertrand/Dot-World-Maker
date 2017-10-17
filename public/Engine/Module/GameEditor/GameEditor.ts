class GameEditor
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
        if (Main.CheckNW())
        {
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };
            $("#gameInfo").css("top", "5px");
            $("#buttonDeleteGame").hide();
            $(".hideForStandalone").hide();
        }
        if (selfHosted)
            $(".hideForSelfHosted").hide();

        $("#gameName").html(world.Name);
        var url = "http://" + world.Name.replace(/ /g, "_") + ".dotworld.me/";
        $("#gameURL").html("<a href='" + url + "' target='_blank'>" + url + "</a>");
        $("#gameDescription").val(world.Description);
        $("#gameFPS").val((world.ShowFPS === false ? "No" : "Yes"));
        $("#chatEnabled").val((world.ChatEnabled === false ? "No" : "Yes"));
        $("#chatLink").val((world.ChatLink === false ? "No" : "Yes"));
        $("#chatSmilies").val((world.ChatSmilies === false ? "No" : "Yes"));
        $("#simpleObjectLogic").val((world.SimplifiedObjectLogic === false ? "No" : "Yes"));
        $("#publicView").val((world.PublicView === true ? "Yes" : "No"));

        $("#showInventory").val((world.ShowInventory === true ? "Yes" : "No"));
        $("#showStats").val((world.ShowStats === true ? "Yes" : "No"));
        $("#showJournal").val((world.ShowJournal === true ? "Yes" : "No"));
        $("#showMessage").val((world.ShowMessage === true ? "Yes" : "No"));

        $("#gameEdition").html(EditorEdition[world.Edition].replace("Demo","<span style='color: red;'>Free</span>"));

        $("#spawnX").val("" + world.SpawnPoint.X);
        $("#spawnY").val("" + world.SpawnPoint.Y);
        var options = "";
        for (var i = 0; i < world.Zones.length; i++)
            options += "<option value='" + world.Zones[i].Name + "'>" + world.Zones[i].Name + "</option>";
        $("#spawnZone").find("option").remove().end().append(options).val("" + world.SpawnPoint.Zone);
        dialogAction.currentEditor = "GameEditor";

        var looks: string[] = [];
        for (var item in world.art.characters)
            looks.push(item);
        looks.sort();

        options = "";
        for (var i = 0; i < looks.length; i++)
            options += "<option value='" + looks[i] + "'>" + looks[i] + "</option>";
        $("#startLook").find("option").remove().end().append(options).val("" + world.StartLook);

        var objects: string[] = [];
        for (var item in world.art.objects)
            objects.push(item);
        objects.sort();

        options = "";
        for (var i = 0; i < objects.length; i++)
            options += "<option value='" + objects[i] + "'>" + objects[i] + "</option>";
        $("#smallBagObject").find("option").remove().end().append(options).val("" + world.SmallBagObject);

        GameEditor.ShowActions();
    }

    public static UpdateField(propertyName, fieldName)
    {
        if (typeof (world[propertyName]) === "boolean")
            world[propertyName] = ($("#" + fieldName).val().toLowerCase() == "yes" || $("#" + fieldName).val().toLowerCase() == "on" || $("#" + fieldName).val().toLowerCase() == "true" ? true : false);
        else
            world[propertyName] = $("#" + fieldName).val();
    }

    public static Delete()
    {
        Framework.Confirm("Are you sure you want to delete this game? This cannot be un-done, and players will lose their progress.", () =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/OwnerDeleteGame',
                data: {
                    token: framework.Preferences['token'],
                    id: world.Id
                },
                success: function (msg)
                {
                    var data = TryParse(msg);
                    if (data.error)
                    {
                        Framework.Alert(data.error);
                        return;
                    }

                    document.location.replace("/play.html#action=GameList");
                },
                error: function (msg)
                {
                    var data = TryParse(msg);
                    if (data.error)
                        Framework.Alert(data.error);
                    else
                        Framework.Alert(("" + msg).htmlEntities());
                }
            });
        });
    }

    static UpdateSpawn(propName: string, fieldName: string)
    {
        world.SpawnPoint[propName] = $("#" + fieldName).val();
    }

    static ShowActions()
    {
        var html = "";

        if (!world.InitializeSteps)
            world.InitializeSteps = [];

        for (var j = 0; j < world.InitializeSteps.length; j++)
        {
            var act: DialogAction = world.InitializeSteps[j];
            html += "<span class='dialogBlock'><b>" + act.Name.title() + ":</b> <span class='dialogBlockDelete' onclick='GameEditor.DeleteAction(" + j + ")'>X</span><br>";
            html += dialogAction.code[act.Name].Display(j, act.Values);
            html += "</span>";
        }

        html += "<select id='addAction' onchange='GameEditor.AddAction()'>";
        html += "<option value=''>-- Add new action --</option>";
        for (var i in dialogAction.code)
            html += "<option value='" + i + "'>" + i.title() + "</option>";
        html += "<select>";
        $("#initializeSteps").html(html);
    }

    static AddAction()
    {
        world.InitializeSteps.push({
            Name: $("#addAction").val(),
            Values: []
        });
        GameEditor.ShowActions();
    }

    static ChangeAction(id: number, pos: number)
    {
        world.InitializeSteps[id].Values[pos] = $("#action_" + id + "_" + pos).val();
    }

    static DeleteAction(id: number)
    {
        world.InitializeSteps.splice(id, 1);
        GameEditor.ShowActions();
    }

    static UploadSplash()
    {
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
        $("#gameSplashUploadForm").submit();
    }

    static RemoveSplash()
    {
        if (world.art.splashImage)
            delete world.art.splashImage;
        Framework.ShowMessage("Splash file removed. Now please save.");
    }

    static Result(result: string)
    {
        var data = JSON.parse(result);
        if (data.error)
        {
            Framework.Alert(data.error);
            return;
        }
        else if (data.new_file)
        {
            world.art.splashImage = data.new_file + "?v=" + Math.round((new Date()).getTime() / 1000);
            Framework.ShowMessage("Splash file uploaded. Now please save.");
        }
    }

}