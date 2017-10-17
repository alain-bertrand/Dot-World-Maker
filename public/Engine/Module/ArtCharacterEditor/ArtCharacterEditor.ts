var artCharacterEditor = new (class
{
    selector: ListSelector = null;
    characterToDisplay: HTMLImageElement;
    characterName: string;
    character: TilesetCharacterDetails;
    refresher: number;
    groundSelection: Point = null;

    previewDirection: number = 0;
    previewFrame: number = 0;
    renderLoopCounter: number = 0;
    frameDirections: string = "swen";
});


class ArtCharacterEditor
{
    public static Dispose()
    {
        if (artCharacterEditor.refresher !== null)
        {
            clearInterval(artCharacterEditor.refresher);
            artCharacterEditor.refresher = null;
        }
        if (artCharacterEditor.selector)
            artCharacterEditor.selector.Dispose();
        artCharacterEditor.selector = null;
        artCharacterEditor.characterToDisplay = null;
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
            $("#uploadButton").html("Add");
            $("#characterList").css("top", "5px");
            $(".imageParameters").css("top", "5px");
            $("#characterPreviewPanel").css("top", "5px");
            $("#characterDisplayContainer").css("top", "195px");
        }
        if (framework.CurrentUrl.id && !world.art.characters[framework.CurrentUrl.id])
        {
            framework.CurrentUrl.id = null;
            Framework.SetLocation({
                action: "ArtCharacterEditor"
            });
        }
        if (framework.CurrentUrl.id)
            ArtCharacterEditor.SelectCharacter(framework.CurrentUrl.id);

        artCharacterEditor.selector = new ListSelector("characterList", world.art.characters);
        artCharacterEditor.selector.OnSelect = ArtCharacterEditor.SelectCharacter

        artCharacterEditor.refresher = setInterval(ArtCharacterEditor.UpdateDisplay, 16);

        $("#characterDisplay").bind("mousedown", ArtCharacterEditor.MouseDown);
    }

    static SelectCharacter(characterName: string)
    {
        Framework.SetLocation({
            action: "ArtCharacterEditor", id: characterName
        });
        $("#name").css('backgroundColor', '');
        ArtCharacterEditor.ResetChangeRow();
        if (!characterName)
        {
            artCharacterEditor.characterName = null;

            artCharacterEditor.characterToDisplay = null;
            artCharacterEditor.character = null;

            $("#name").val("").prop("disabled", true);
            $("#frames").val("").prop("disabled", true);
            $("#directions").val("").prop("disabled", true);
            $("#imageFrameDivider").val("").prop("disabled", true);
            $("#groundX").val("").prop("disabled", true);
            $("#groundY").val("").prop("disabled", true);
            $("#collision").val("").prop("disabled", true);
            $("#animationCycle").prop("disabled", true);
            return;
        }

        artCharacterEditor.characterName = characterName;

        artCharacterEditor.characterToDisplay = new Image();
        artCharacterEditor.character = world.art.characters[characterName];
        artCharacterEditor.characterToDisplay.src = artCharacterEditor.character.file;

        $("#name").val(characterName).prop("disabled", false);
        $("#frames").val("" + artCharacterEditor.character.frames).prop("disabled", false);
        $("#directions").val("" + artCharacterEditor.character.directions).prop("disabled", false);
        $("#imageFrameDivider").val("" + artCharacterEditor.character.imageFrameDivider).prop("disabled", false);
        $("#groundX").val("" + artCharacterEditor.character.groundX).prop("disabled", false);
        $("#groundY").val("" + artCharacterEditor.character.groundY).prop("disabled", false);
        $("#collision").val("" + (artCharacterEditor.character.collision ? artCharacterEditor.character.collision.radius : "")).prop("disabled", false);

        if (artCharacterEditor.character.animationCycle != "simple")
            $("#animationCycle").val("walkCycle").prop("disabled", false);
        else
            $("#animationCycle").val("simple").prop("disabled", false);
    }

    static Rename()
    {
        var newName = $("#name").val().trim();

        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.art.characters[newName] && world.art.characters[newName] != artCharacterEditor.character))
        {
            $("#name").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#name").css('backgroundColor', '');

        // Nothing changed => skip
        if (newName == artCharacterEditor.characterName)
            return;
        // Empty names are not valid
        if (newName == "")
            return;
        // The name already exists and therefore is invalid
        for (var item in world.art.objects)
            if (item == newName)
                return;
        var oldName = artCharacterEditor.characterName;

        delete world.art.characters[artCharacterEditor.characterName];
        world.art.characters[newName] = artCharacterEditor.character;
        artCharacterEditor.selector.UpdateList();
        artCharacterEditor.selector.Select(newName);
        SearchPanel.Update();

        for (var i = 0; i < world.Monsters.length; i++)
        {
            if (world.Monsters[i].Art == oldName)
            {
                world.Monsters[i].Code.CodeVariables['art'].value = newName;
                world.Monsters[i].Art = newName;
            }
        }
        if (world.StartLook == oldName)
            world.StartLook = newName;
    }

    static Clone()
    {
        var newName = "character_";
        for (var i = 1; ; i++)
        {
            if (!world.art.characters["character_" + i])
            {
                newName = "character_" + i;
                break;
            }
        }

        world.art.characters[newName] = JSON.parse(JSON.stringify(artCharacterEditor.character));
        artCharacterEditor.selector.UpdateList();
        artCharacterEditor.selector.Select(newName);
        SearchPanel.Update();
    }

    static Delete()
    {
        Framework.Confirm("Are you sure you want to delete this character?", () =>
        {
            var nb = 0;
            for (var item in world.art.characters)
                nb++;
            if (nb < 2)
            {
                Framework.Alert("Cannot remove all the characters.");
                return;
            }

            var oldName = artCharacterEditor.characterName;
            delete world.art.characters[artCharacterEditor.characterName];
            artCharacterEditor.selector.UpdateList();
            var newName = FirstItem(world.art.characters);
            artCharacterEditor.selector.Select(newName);
            SearchPanel.Update();
            
            for (var i = 0; i < world.Monsters.length; i++)
            {
                if (world.Monsters[i].Art == oldName)
                {
                    world.Monsters[i].Code.CodeVariables['art'].value = newName;
                    world.Monsters[i].Art = newName;
                }
            }
            if (world.StartLook == oldName)
                world.StartLook = newName;
        });
    }

    static ChangeParameter(parameterName: string, htmlFieldName: string)
    {
        if (!artCharacterEditor.character)
            return;
        switch (parameterName)
        {
            case "animationCycle":
                artCharacterEditor.character[parameterName] = $("#" + htmlFieldName).val();
                break;
            default:
                var val = parseInt($("#" + htmlFieldName).val());
                if (isNaN(val))
                    val = artCharacterEditor.character[parameterName];
                artCharacterEditor.character[parameterName] = val;
        }
    }

    static ChangeCollision()
    {
        var val = parseInt($("#collision").val());
        if (isNaN(val))
            val = null;
        if (val === null)
        {
            if (artCharacterEditor.character.collision)
                delete artCharacterEditor.character.collision;
        }
        else
        {
            artCharacterEditor.character.collision = { radius: val };
        }
    }

    static UpdateDisplay()
    {
        var canvas = <HTMLCanvasElement>$("#characterDisplay").first();

        if (artCharacterEditor.characterToDisplay && artCharacterEditor.characterToDisplay.width && artCharacterEditor.character.width == 0)
            artCharacterEditor.character.width = artCharacterEditor.characterToDisplay.width;
        if (artCharacterEditor.characterToDisplay && artCharacterEditor.characterToDisplay.height && artCharacterEditor.character.height == 0)
            artCharacterEditor.character.height = artCharacterEditor.characterToDisplay.height;

        if (artCharacterEditor.characterToDisplay && (canvas.width != artCharacterEditor.characterToDisplay.width || canvas.height != artCharacterEditor.characterToDisplay.height))
        {
            canvas.width = artCharacterEditor.characterToDisplay.width;
            canvas.height = artCharacterEditor.characterToDisplay.height;
        }

        if (!artCharacterEditor.characterToDisplay)
            return;

        var ctx2 = (<HTMLCanvasElement>$("#characterPreview").first()).getContext("2d");
        var pw = Math.floor(artCharacterEditor.characterToDisplay.width / artCharacterEditor.character.frames);
        var ph = Math.floor(artCharacterEditor.characterToDisplay.height / 4);
        var f = 0;
        if (artCharacterEditor.character.animationCycle == "walkCycle")
        {
            f = Math.floor(artCharacterEditor.previewFrame / artCharacterEditor.character.imageFrameDivider);
            if (f == artCharacterEditor.character.frames)
                f = Math.floor(artCharacterEditor.character.frames / 2);
            artCharacterEditor.previewFrame = (artCharacterEditor.previewFrame + 1) % ((artCharacterEditor.character.frames + 1) * artCharacterEditor.character.imageFrameDivider);
        }
        else
        {
            f = Math.floor(artCharacterEditor.previewFrame / artCharacterEditor.character.imageFrameDivider);
            artCharacterEditor.previewFrame = (artCharacterEditor.previewFrame + 1) % (artCharacterEditor.character.frames * artCharacterEditor.character.imageFrameDivider);
        }
        ctx2.clearRect(0, 0, 300, 300);
        ctx2.drawImage(artCharacterEditor.characterToDisplay, f * pw, artCharacterEditor.previewDirection * ph, pw, ph, 0, 0, pw, ph);

        artCharacterEditor.renderLoopCounter = (artCharacterEditor.renderLoopCounter + 1) % 9;
        if (artCharacterEditor.renderLoopCounter != 0)
            return;

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(artCharacterEditor.characterToDisplay, 0, 0);

        var w = Math.round(artCharacterEditor.characterToDisplay.width / artCharacterEditor.character.frames);

        ctx.strokeStyle = "#E00000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var i = 1; i < artCharacterEditor.character.frames; i++)
        {
            ctx.moveTo(w * i + 0.5, 0);
            ctx.lineTo(w * i + 0.5, canvas.height);
        }
        ctx.stroke();


        w = Math.round(artCharacterEditor.characterToDisplay.height / artCharacterEditor.character.directions);

        ctx.strokeStyle = "#E00000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var i = 1; i < artCharacterEditor.character.directions; i++)
        {
            ctx.moveTo(0, w * i + 0.5);
            ctx.lineTo(canvas.width, w * i + 0.5);
        }
        ctx.stroke();

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(artCharacterEditor.character.groundX + 0.5, artCharacterEditor.character.groundY - 5);
        ctx.lineTo(artCharacterEditor.character.groundX + 0.5, artCharacterEditor.character.groundY + 5);
        ctx.moveTo(artCharacterEditor.character.groundX - 5, artCharacterEditor.character.groundY + 0.5);
        ctx.lineTo(artCharacterEditor.character.groundX + 5, artCharacterEditor.character.groundY + 0.5);
        ctx.stroke();

        ctx.strokeStyle = "#E00000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(artCharacterEditor.character.groundX + 0.5, artCharacterEditor.character.groundY - 5);
        ctx.lineTo(artCharacterEditor.character.groundX + 0.5, artCharacterEditor.character.groundY + 5);
        ctx.moveTo(artCharacterEditor.character.groundX - 5, artCharacterEditor.character.groundY + 0.5);
        ctx.lineTo(artCharacterEditor.character.groundX + 5, artCharacterEditor.character.groundY + 0.5);
        ctx.stroke();

        if (artCharacterEditor.character.collision)
        {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(artCharacterEditor.character.groundX, artCharacterEditor.character.groundY, artCharacterEditor.character.collision.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = "#0000E0";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(artCharacterEditor.character.groundX, artCharacterEditor.character.groundY, artCharacterEditor.character.collision.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    static GroundSelection()
    {
        artCharacterEditor.groundSelection = {
            X: 0, Y: 0
        };
    }

    public static MouseDown(evt: MouseEvent)
    {
        if (!artCharacterEditor.character)
            return;
        var x = evt.pageX - $("#characterDisplayContainer").position().left + $("#characterDisplayContainer").first().scrollLeft;
        var y = evt.pageY - $("#characterDisplayContainer").position().top + $("#characterDisplayContainer").first().scrollTop;

        if (artCharacterEditor.groundSelection != null)
        {
            ArtCharacterEditor.HandleGroundSelection(evt);
            $("#artObjectEditorMouseOverlay").bind("mousemove", ArtCharacterEditor.MouseMove).bind("mouseup", ArtCharacterEditor.MouseUp).show();
        }
    }

    public static MouseUp(evt: MouseEvent)
    {
        artCharacterEditor.groundSelection = null;
        $("#artObjectEditorMouseOverlay").unbind("mousemove", ArtCharacterEditor.MouseMove).unbind("mouseup", ArtCharacterEditor.MouseUp).hide();
    }

    public static MouseMove(evt: MouseEvent)
    {
        if (!artCharacterEditor.character)
            return;

        if (artCharacterEditor.groundSelection)
            ArtCharacterEditor.HandleGroundSelection(evt);
    }

    static HandleGroundSelection(evt: MouseEvent)
    {
        if (!artCharacterEditor.character)
            return;

        var x = evt.pageX - $("#characterDisplayContainer").position().left + $("#characterDisplayContainer").first().scrollLeft;
        var y = evt.pageY - $("#characterDisplayContainer").position().top + $("#characterDisplayContainer").first().scrollTop;

        artCharacterEditor.character.groundX = artCharacterEditor.groundSelection.X = x;
        artCharacterEditor.character.groundY = artCharacterEditor.groundSelection.Y = y;
        $("#groundX").val("" + artCharacterEditor.character.groundX);
        $("#groundY").val("" + artCharacterEditor.character.groundY);
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", ArtCharacterEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        ArtCharacterEditor.FinishImport($("#fileOpenDialog").val());
        $("#fileOpenDialog").unbind("change", ArtCharacterEditor.ImportFileImage).val("");
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
        else if (data.new_file)
        {
            ArtCharacterEditor.FinishImport(data.new_file);
        }
    }

    static FinishImport(filename: string)
    {
        var plainUrl = filename;
        var fileUrl = filename + "?v=" + Math.round((new Date()).getTime() / 1000);

        var newName = "character_";
        for (var i = 1; ; i++)
        {
            if (!world.art.characters["character_" + i])
            {
                newName = "character_" + i;
                break;
            }
        }

        for (var item in world.art.characters)
        {
            if (world.art.characters[item].file.indexOf(plainUrl) == 0)
                world.art.characters[item].file = fileUrl;
        }

        world.art.characters[newName] = {
            frames: 3,
            groundX: 0,
            groundY: 0,
            directions: 4,
            file: fileUrl,
            width: 0,
            height: 0,
            animationCycle: "walkCycle",
            imageFrameDivider: 10
        };
        artCharacterEditor.selector.UpdateList();
        artCharacterEditor.selector.Select(newName);
    }

    static EditImage()
    {
        if (!artCharacterEditor.character)
            return;
        Framework.SetLocation({
            action: "PixelEditor", type: "character", file: artCharacterEditor.character.file, frames: artCharacterEditor.character.frames
        }, false);
    }

    static ShowCreate()
    {
        var newName = "character_";
        for (var i = 1; ; i++)
        {
            if (!world.art.characters["character_" + i])
            {
                newName = "character_" + i;
                break;
            }
        }

        $("#newArtCharcterDialog").show();
        $("#newCharName").val(newName).focus();
    }

    static CloseCreate()
    {
        $("#newArtCharcterDialog").hide();
    }

    static CheckNewCharacterName()
    {
        var newName = $("#newCharName").val().trim();

        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || world.art.characters[newName])
            $("#name").css('backgroundColor', '#FFE0E0');
        else
            $("#name").css('backgroundColor', '');
    }

    static Create()
    {
        var newName = $("#newCharName").val();
        var filename = newName.replace(/ /g, "_") + ".png";
        var frames = parseInt($("#newCharFrames").val());
        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || world.art.characters[newName])
            return;

        world.art.characters[newName] = {
            frames: frames,
            groundX: 0,
            groundY: 0,
            directions: 4,
            file: filename,
            width: 64,
            height: 64,
            animationCycle: "walkCycle",
            imageFrameDivider: 10
        };
        $("#newArtCharcterDialog").hide();
        Framework.SetLocation({ action: "PixelEditor", type: "character", file: filename, frames: frames }, false);
        SearchPanel.Update();
    }

    static ResetChangeRow()
    {
        $("#row_direction_0 div").removeClass("selectedButton");
        $("#row_direction_1 div").removeClass("selectedButton");
        $("#row_direction_2 div").removeClass("selectedButton");
        $("#row_direction_3 div").removeClass("selectedButton");
        $("#row_0_s").addClass("selectedButton");
        $("#row_1_w").addClass("selectedButton");
        $("#row_2_e").addClass("selectedButton");
        $("#row_3_n").addClass("selectedButton");
        artCharacterEditor.frameDirections = "swen";
    }

    static ChangeRow(direction: string, row: number)
    {
        $("#row_direction_" + row + " div").removeClass("selectedButton");
        $("#row_" + row + "_" + direction).addClass("selectedButton");

        artCharacterEditor.frameDirections = artCharacterEditor.frameDirections.substr(0, row) + direction + artCharacterEditor.frameDirections.substr(row + 1);
    }

    static ApplyRowChange()
    {
        var destOrder = "swen";
        if (artCharacterEditor.frameDirections == destOrder)
            return;

        for (var i = 0; i < 4; i++)
        {
            var p = destOrder.indexOf(artCharacterEditor.frameDirections.charAt(i));
            if (p == -1)
            {
                Framework.Alert("You need to supply the 4 directions");
                return;
            }
        }

        var canvas = <HTMLCanvasElement>document.createElement("canvas");
        canvas.width = artCharacterEditor.characterToDisplay.width;
        canvas.height = artCharacterEditor.characterToDisplay.height;
        var ctx = canvas.getContext("2d");
        var h = Math.floor(artCharacterEditor.characterToDisplay.height / 4);
        var w = artCharacterEditor.characterToDisplay.width;

        for (var i = 0; i < 4; i++)
        {
            var p = artCharacterEditor.frameDirections.indexOf(destOrder.charAt(i));
            if (p == -1)
            {
                Framework.Alert("You need to supply the 4 directions");
                return;
            }
            ctx.drawImage(artCharacterEditor.characterToDisplay, 0, p * h, w, h, 0, i * h, w, h);
        }

        $.ajax({
            type: 'POST',
            url: '/upload/SaveBase64Art',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                file: PixelEditor.Filename(artCharacterEditor.character.file),
                data: canvas.toDataURL()
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                if (data && data.file)
                {
                    var plainUrl = data.file;
                    var fileUrl = data.file + "?v=" + Math.round((new Date()).getTime() / 1000);

                    for (var item in world.art.characters)
                    {
                        if (world.art.characters[item].file.indexOf(plainUrl) == 0)
                            world.art.characters[item].file = fileUrl;
                    }
                    ArtCharacterEditor.SelectCharacter(artCharacterEditor.characterName);
                }
            },
            error: function (msg, textStatus)
            {
                Framework.ShowMessage(msg);
            }
        });
    }
}