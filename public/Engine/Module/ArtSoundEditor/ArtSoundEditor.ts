var artSoundEditor = new (class
{
    selector: ListSelector = null;
    objectName: string;
    currentlyPlaying: HTMLAudioElement;
});

var musics = [
    "/Sounds/Anomaly_Looping.mp3",
    "/Sounds/Bedtime-Story_Looping.mp3",
    "/Sounds/City-of-Dread_Looping.mp3",
    "/Sounds/City-of-Tomorrow_v001.mp3",
    "/Sounds/Cool-Adventure-Intro.mp3",
    "/Sounds/Defending-the-Princess-Haunted_v002.mp3",
    "/Sounds/Drafty-Places_Looping.mp3",
    "/Sounds/Escape_Looping.mp3",
    "/Sounds/Fantascape_Looping.mp3",
    "/Sounds/Fantasy_Game_Background_Looping.mp3",
    "/Sounds/Game-Menu_Looping.mp3",
    "/Sounds/Going-Different-Ways_Looping.mp3",
    "/Sounds/Great-Minds_v001.mp3",
    "/Sounds/Into-Battle.mp3",
    "/Sounds/Into-Battle_v001.mp3",
    "/Sounds/Lost-Jungle_Looping.mp3",
    "/Sounds/Misty-Bog_Looping.mp3",
    "/Sounds/Puzzle-Game_Looping.mp3",
    "/Sounds/Racing-Menu.mp3",
    "/Sounds/Retro-Frantic_V001_Looping.mp3",
    "/Sounds/Sculpture-Garden.mp3",
    "/Sounds/sm_mold_section.mp3"];

class ArtSoundEditor
{
    public static Dispose()
    {
        if (artSoundEditor.selector)
            artSoundEditor.selector.Dispose();
        artSoundEditor.selector = null;
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
            $("#objectList").css("top", "5px");
            $(".imageParameters").css("top", "5px");
            $("#buttonUpload").html("Import");
        }

        if (!world.art.sounds)
            world.art.sounds = {};
        artSoundEditor.selector = new ListSelector("objectList", world.art.sounds);
        artSoundEditor.selector.OnSelect = ArtSoundEditor.SelectObject

        if (framework.CurrentUrl.id && !world.art.sounds[framework.CurrentUrl.id])
        {
            framework.CurrentUrl.id = null;
            Framework.SetLocation({
                action: "ArtSoundEditor"
            });
        }

        if (framework.CurrentUrl.id)
            artSoundEditor.selector.Select(framework.CurrentUrl.id);
        else
            artSoundEditor.selector.Select(null);
        artSoundEditor.currentlyPlaying = null;
    }

    static SelectObject(objectName: string)
    {
        Framework.SetLocation({
            action: "ArtSoundEditor", id: objectName
        });
        if (!objectName)
        {
            artSoundEditor.objectName = null;

            $("#name").val("").css('backgroundColor', '').prop("disabled", true);
            $("#soundPreview").html("");
            return;
        }

        artSoundEditor.objectName = objectName;
        $("#name").val(objectName).css('backgroundColor', '').prop("disabled", false);
        $("#soundPreview").html("<audio controls='controls' preload='none'><source src='" + world.art.sounds[objectName].mp3 + "' type='audio/mpeg' /></audio>");
    }


    static Rename()
    {
        var newName = $("#name").val().trim();

        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.art.sounds[newName] && world.art.sounds[newName] != world.art.sounds[artSoundEditor.objectName]))
        {
            $("#name").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#name").css('backgroundColor', '');

        // Nothing changed => skip
        if (newName == artSoundEditor.objectName)
            return;
        // Empty names are not valid
        if (newName == "")
            return;

        var oldName = artSoundEditor.objectName;
        var obj = world.art.sounds[artSoundEditor.objectName];
        delete world.art.sounds[artSoundEditor.objectName];
        world.art.sounds[newName] = obj;
        artSoundEditor.selector.UpdateList();
        artSoundEditor.selector.Select(newName);
        SearchPanel.Update();

        for (var i = 0; i < world.Zones.length; i++)
            if (world.Zones[i].MapMusic == oldName)
                world.Zones[i].MapMusic = newName;
    }

    static Clone()
    {
        var newName = "sound_";
        for (var i = 1; ; i++)
        {
            if (!world.art.sounds["sound_" + i])
            {
                newName = "sound_" + i;
                break;
            }
        }

        world.art.sounds[newName] = JSON.parse(JSON.stringify(world.art.sounds[artSoundEditor.objectName]));
        artSoundEditor.selector.UpdateList();
        artSoundEditor.selector.Select(newName);
        SearchPanel.Update();
    }

    static Delete()
    {
        Framework.Confirm("Are you sure you want to delete this sound?", () =>
        {
            var oldName = artSoundEditor.objectName;
            delete world.art.sounds[artSoundEditor.objectName];
            artSoundEditor.selector.UpdateList();
            artSoundEditor.selector.Select(null);
            SearchPanel.Update();

            for (var i = 0; i < world.Zones.length; i++)
                if (world.Zones[i].MapMusic == oldName)
                    world.Zones[i].MapMusic = null;

        });
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".mp3");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", ArtSoundEditor.ImportFile).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFile()
    {
        ArtSoundEditor.FinishImport($("#fileOpenDialog").val());
        $("#fileOpenDialog").unbind("change", ArtSoundEditor.ImportFile).val("");
    }

    static CloseUpload()
    {
        $("#uploadArtObject").hide();
    }

    static Upload()
    {
        $("#uploadArtObject").hide();
        $("#artObjectUploadForm").submit();
    }

    static Result(result: string)
    {
        var data = JSON.parse(result);
        if (data.error)
        {
            Framework.Alert(data.error);
            return;
        }
        //else if (data.mp3 && data.ogg)
        else if (data.mp3)
        {
            ArtSoundEditor.FinishImport(data.mp3);
        }
    }

    static FinishImport(filename: string)
    {
        var plainUrl = filename;
        var fileUrl = filename + "?v=" + Math.round((new Date()).getTime() / 1000);

        var newName = "sound_";
        for (var i = 1; ; i++)
        {
            if (!world.art.sounds["sound_" + i])
            {
                newName = "sound_" + i;
                break;
            }
        }

        for (var item in world.art.sounds)
        {
            if (world.art.sounds[item].mp3.indexOf(plainUrl) == 0)
                world.art.sounds[item].mp3 = fileUrl;
        }

        //world.art.sounds[newName] = { mp3: data.mp3, ogg: data.ogg };
        world.art.sounds[newName] = { mp3: fileUrl };
        artSoundEditor.selector.UpdateList();
        artSoundEditor.selector.Select(newName);
        SearchPanel.Update();
    }

    static ShowAdd()
    {
        $("#soundPreview").html("");
        artSoundEditor.currentlyPlaying = null;

        var html = "";
        html += "In order to reduce the load time for your players add only the sounds and musics you will use.<br><br>";

        html += "<h2>Musics</h2>";
        for (var i = 0; i < musics.length; i++)
        {
            var name = musics[i].match(/[^\/]+$/);
            html += "<div class='musicPreview'>";
            html += name + ": <div class='button' onclick='ArtSoundEditor.AddMusic(" + i + ");'>Import</div><br>";
            html += "<audio controls='controls' onclick='ArtSoundEditor.StopOthers' preload='none'>";
            html += "<source src='" + musics[i] + "' type='audio/mpeg' />";
            html += "</audio>";
            html += "</div>";
        }
        html += "<div style='position: fixed; top: 40px; right: 30px;' class='button' onclick='ArtSoundEditor.CloseAdd();'>Close</div>";

        $("#soundList").html(html).show();

        $("audio").bind("play", (evt) =>
        {
            if (artSoundEditor.currentlyPlaying && artSoundEditor.currentlyPlaying != evt.target)
                artSoundEditor.currentlyPlaying.pause();
            artSoundEditor.currentlyPlaying = evt.target;
        });
    }

    static AddMusic(rowId: number)
    {
        var baseName = ("" + musics[rowId].match(/[^\/]+$/)).replace(".mp3", "");
        var newName = baseName;
        var nextId = 2;
        while (world.art.sounds[newName])
        {
            newName = baseName + " " + nextId;
            nextId++;
        }
        world.art.sounds[newName] = { mp3: musics[rowId] };
        artSoundEditor.selector.UpdateList();
        artSoundEditor.selector.Select(newName);
        SearchPanel.Update();
        ArtSoundEditor.CloseAdd();
    }

    static CloseAdd()
    {
        if (artSoundEditor.currentlyPlaying)
            artSoundEditor.currentlyPlaying.pause();
        artSoundEditor.currentlyPlaying = null;
        $("#soundList").hide();
    }
}
