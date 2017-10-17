var artObjectEditor = new (class
{
    selector: ListSelector = null;
    objectToDisplay: HTMLImageElement;
    objectName: string;
    object: TilsetObjectDetails;
    refresher: number;
    mouseOffset: Point;
    positionSelection: Rectangle = null;
    groundSelection: Point = null;
});

class ArtObjectEditor
{
    public static Dispose()
    {
        if (artObjectEditor.refresher !== null)
        {
            clearInterval(artObjectEditor.refresher);
            artObjectEditor.refresher = null;
        }
        if (artObjectEditor.selector)
            artObjectEditor.selector.Dispose();
        artObjectEditor.selector = null;
        artObjectEditor.objectToDisplay = null;
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
            $("#buttonUpload").html("Add");
            $("#objectList").css("top", "5px");
            $(".imageParameters").css("top", "5px");
            $("#objectDisplayContainer").css("top", "calc(40% + 10px)");
        }
        artObjectEditor.selector = new ListSelector("objectList", world.art.objects);
        artObjectEditor.selector.OnSelect = ArtObjectEditor.SelectObject
        artObjectEditor.refresher = setInterval(ArtObjectEditor.UpdateDisplay, 100);

        if (framework.CurrentUrl.id && !world.art.objects[framework.CurrentUrl.id])
        {
            framework.CurrentUrl.id = null;
            Framework.SetLocation({
                action: "ArtObjectEditor"
            });
        }

        if (framework.CurrentUrl.id)
            ArtObjectEditor.SelectObject(framework.CurrentUrl.id);
        else
            artObjectEditor.selector.Select(null);

        var names: string[] = world.ParticleEffects.map((c) => { return c.Name; }).sort();
        var options = "";
        options += "<option value=''>- NONE -</option>";
        for (var i = 0; i < names.length; i++)
            options += "<option value='" + names[i] + "'>" + names[i] + "</option>";
        $("#particleEffect").find("options").remove().end().append(options);

        $("#objectDisplay").bind("mousedown", ArtObjectEditor.MouseDown);
        dialogAction.currentEditor = "ArtObjectEditor";
        dialogCondition.currentEditor = "ArtObjectEditor";
    }

    static SelectObject(objectName: string)
    {
        Framework.SetLocation({
            action: "ArtObjectEditor", id: objectName
        });
        if (!objectName)
        {
            artObjectEditor.objectName = null;

            artObjectEditor.objectToDisplay = null;
            artObjectEditor.object = null;

            $("#name").val("").css('backgroundColor', '').prop("disabled", true);
            $("#posX").val("").prop("disabled", true);
            $("#posY").val("").prop("disabled", true);
            $("#width").val("").prop("disabled", true);
            $("#height").val("").prop("disabled", true);
            $("#groundX").val("").prop("disabled", true);
            $("#groundY").val("").prop("disabled", true);
            $("#nbAnimationFrames").val("").prop("disabled", true);
            $("#animationSpeed").val("").prop("disabled", true);
            $("#frameOffset").val("").prop("disabled", true);
            $("#collision").val("").prop("disabled", true);
            $("#particleEffect").val("").prop("disabled", true);
            $("#objectActions").html("");
            return;
        }

        artObjectEditor.objectName = objectName;

        artObjectEditor.objectToDisplay = new Image();
        artObjectEditor.objectToDisplay.src = world.art.objects[objectName].file;
        artObjectEditor.object = world.art.objects[objectName];

        $("#name").val(objectName).css('backgroundColor', '').prop("disabled", false);
        $("#posX").val("" + artObjectEditor.object.x).prop("disabled", false);
        $("#posY").val("" + artObjectEditor.object.y).prop("disabled", false);
        $("#width").val("" + artObjectEditor.object.width).prop("disabled", false);
        $("#height").val("" + artObjectEditor.object.height).prop("disabled", false);
        $("#groundX").val("" + artObjectEditor.object.groundX).prop("disabled", false);
        $("#groundY").val("" + artObjectEditor.object.groundY).prop("disabled", false);
        $("#nbAnimationFrames").val("" + IfIsNull(artObjectEditor.object.nbAnimationFrames, 1)).prop("disabled", false);
        $("#animationSpeed").val("" + IfIsNull(artObjectEditor.object.animationSpeed, 10)).prop("disabled", false);
        $("#frameOffset").val("" + IfIsNull(artObjectEditor.object.frameOffset, 0)).prop("disabled", false);
        $("#particleEffect").val(artObjectEditor.object.particleEffect ? artObjectEditor.object.particleEffect : "").prop("disabled", false);
        $("#collision").val("" + (artObjectEditor.object.collision ? artObjectEditor.object.collision.radius : "")).prop("disabled", false);

        var html = "";
        ///////////////////////////////////////////////////////////////
        html += "<h2>Walk over event</h2>";
        html += "<table><tr><td>Disappear after walking over:</td><td><select id='disappearOnWalk' onchange='ArtObjectEditor.ChangeParameter(\"disappearOnWalk\",\"disappearOnWalk\");'><option" + (artObjectEditor.object.disappearOnWalk === true ? " selected" : "") + ">Yes</option><option" + (artObjectEditor.object.disappearOnWalk !== true ? " selected" : "") + ">No</option></select></td></tr></table>";

        html += "<h2>Walk Conditions</h2>";
        if (artObjectEditor.object.walkConditions)
            for (var j = 0; j < artObjectEditor.object.walkConditions.length; j++)
            {
                var cond: DialogCondition = artObjectEditor.object.walkConditions[j];
                html += "<span class='dialogBlock'><b>" + cond.Name.title() + ":</b> <span class='dialogBlockDelete' onclick='ArtObjectEditor.DeleteWalkCondition(" + j + ")'>X</span><br>";
                html += dialogCondition.code[cond.Name].Display(j, cond.Values, "ChangeWalkCondition");
                html += "</span>";
            }

        html += "<select id='addWalkCondition' onchange='ArtObjectEditor.AddWalkCondition()'>";
        html += "<option value=''>-- Add new condition --</option>";
        for (var i in dialogCondition.code)
            html += "<option value='" + i + "'>" + i.title() + "</option>";
        html += "<select>";

        html += "<h2>Walk Actions</h2>";
        if (artObjectEditor.object.walkActions)
            for (var j = 0; j < artObjectEditor.object.walkActions.length; j++)
            {
                var act: DialogAction = artObjectEditor.object.walkActions[j];
                html += "<span class='dialogBlock'><b>" + act.Name.title() + ":</b> <span class='dialogBlockDelete' onclick='ArtObjectEditor.DeleteWalkAction(" + j + ")'>X</span><br>";
                html += dialogAction.code[act.Name].Display(j, act.Values, "ChangeWalkAction");
                html += "</span>";
            }

        html += "<select id='addWalkAction' onchange='ArtObjectEditor.AddWalkAction()'>";
        html += "<option value=''>-- Add new action --</option>";
        for (var i in dialogAction.code)
            html += "<option value='" + i + "'>" + i.title() + "</option>";
        html += "<select>";

        /////////////////////////////////////////////////////////////
        html += "<h2>Click event</h2>";
        html += "<table>"
        html += "<tr><td>Disappear after using it:</td><td><select id='disappearOnClick' onchange='ArtObjectEditor.ChangeParameter(\"disappearOnClick\",\"disappearOnClick\");'>";
        html += "<option" + (artObjectEditor.object.disappearOnClick === true ? " selected" : "") + ">Yes</option>";
        html += "<option" + (artObjectEditor.object.disappearOnClick !== true ? " selected" : "") + ">No</option>";
        html += "</select></td></tr>"
        html += "<tr><td>Click once:</td><td><select id='useOnce' onchange='ArtObjectEditor.ChangeParameter(\"clickOnce\",\"clickOnce\");'>";
        html += "<option" + (artObjectEditor.object.clickOnce !== false ? " selected" : "") + ">Yes</option>";
        html += "<option" + (artObjectEditor.object.clickOnce === false ? " selected" : "") + ">No</option>";
        html += "</select></td></tr>"
        html += "</table>";

        html += "<h2>Click Conditions</h2>";
        if (artObjectEditor.object.clickConditions)
            for (var j = 0; j < artObjectEditor.object.clickConditions.length; j++)
            {
                var cond: DialogCondition = artObjectEditor.object.clickConditions[j];
                html += "<span class='dialogBlock'><b>" + cond.Name.title() + ":</b> <span class='dialogBlockDelete' onclick='ArtObjectEditor.DeleteClickCondition(" + j + ")'>X</span><br>";
                html += dialogCondition.code[cond.Name].Display(j, cond.Values, "ChangeClickCondition");
                html += "</span>";
            }

        html += "<select id='addClickCondition' onchange='ArtObjectEditor.AddClickCondition()'>";
        html += "<option value=''>-- Add new condition --</option>";
        for (var i in dialogCondition.code)
            html += "<option value='" + i + "'>" + i.title() + "</option>";
        html += "<select>";

        html += "<h2>Click Actions</h2>";
        if (artObjectEditor.object.clickActions)
            for (var j = 0; j < artObjectEditor.object.clickActions.length; j++)
            {
                var act: DialogAction = artObjectEditor.object.clickActions[j];
                html += "<span class='dialogBlock'><b>" + act.Name.title() + ":</b> <span class='dialogBlockDelete' onclick='ArtObjectEditor.DeleteClickAction(" + j + ")'>X</span><br>";
                html += dialogAction.code[act.Name].Display(j, act.Values, "ChangeClickAction");
                html += "</span>";
            }

        html += "<select id='addClickAction' onchange='ArtObjectEditor.AddClickAction()'>";
        html += "<option value=''>-- Add new action --</option>";
        for (var i in dialogAction.code)
            html += "<option value='" + i + "'>" + i.title() + "</option>";
        html += "<select>";
        $("#objectActions").html(html);
    }

    //////////

    static AddWalkAction()
    {
        if (!artObjectEditor.object.walkActions)
            artObjectEditor.object.walkActions = [];

        artObjectEditor.object.walkActions.push({
            Name: $("#addWalkAction").val(),
            Values: []
        });
        ArtObjectEditor.SelectObject(artObjectEditor.objectName);
    }

    static ChangeWalkAction(id: number, pos: number)
    {
        artObjectEditor.object.walkActions[id].Values[pos] = $("#ChangeWalkAction_" + id + "_" + pos).val();
    }

    static DeleteWalkAction(rowId: number)
    {
        artObjectEditor.object.walkActions.splice(rowId, 1);
        if (artObjectEditor.object.walkActions.length == 0)
            delete artObjectEditor.object.walkActions;
        ArtObjectEditor.SelectObject(artObjectEditor.objectName);
    }

    static AddWalkCondition()
    {
        if (!artObjectEditor.object.walkConditions)
            artObjectEditor.object.walkConditions = [];

        artObjectEditor.object.walkConditions.push({
            Name: $("#addWalkCondition").val(),
            Values: []
        });
        ArtObjectEditor.SelectObject(artObjectEditor.objectName);
    }

    static ChangeWalkCondition(id: number, pos: number)
    {
        artObjectEditor.object.walkConditions[id].Values[pos] = $("#ChangeWalkCondition_" + id + "_" + pos).val();
    }

    static DeleteWalkCondition(rowId: number)
    {
        artObjectEditor.object.walkConditions.splice(rowId, 1);
        if (artObjectEditor.object.walkConditions.length == 0)
            delete artObjectEditor.object.walkConditions;
        ArtObjectEditor.SelectObject(artObjectEditor.objectName);
    }

    //////////

    static AddClickAction()
    {
        if (!artObjectEditor.object.clickActions)
            artObjectEditor.object.clickActions = [];

        artObjectEditor.object.clickActions.push({
            Name: $("#addClickAction").val(),
            Values: []
        });
        ArtObjectEditor.SelectObject(artObjectEditor.objectName);
    }

    static ChangeClickAction(id: number, pos: number)
    {
        artObjectEditor.object.clickActions[id].Values[pos] = $("#ChangeClickAction_" + id + "_" + pos).val();
    }

    static DeleteClickAction(rowId: number)
    {
        artObjectEditor.object.clickActions.splice(rowId, 1);
        if (artObjectEditor.object.clickActions.length == 0)
            delete artObjectEditor.object.clickActions;
        ArtObjectEditor.SelectObject(artObjectEditor.objectName);
    }

    static AddClickCondition()
    {
        if (!artObjectEditor.object.clickConditions)
            artObjectEditor.object.clickConditions = [];

        artObjectEditor.object.clickConditions.push({
            Name: $("#addClickCondition").val(),
            Values: []
        });
        ArtObjectEditor.SelectObject(artObjectEditor.objectName);
    }

    static ChangeClickCondition(id: number, pos: number)
    {
        artObjectEditor.object.clickConditions[id].Values[pos] = $("#ChangeClickCondition_" + id + "_" + pos).val();
    }

    static DeleteClickCondition(rowId: number)
    {
        artObjectEditor.object.clickConditions.splice(rowId, 1);
        if (artObjectEditor.object.clickConditions.length == 0)
            delete artObjectEditor.object.clickConditions;
        ArtObjectEditor.SelectObject(artObjectEditor.objectName);
    }

    static UpdateDisplay()
    {
        var canvas = <HTMLCanvasElement>$("#objectDisplay").first();
        if (!canvas)
            return;
        if (artObjectEditor.objectToDisplay && (canvas.width != artObjectEditor.objectToDisplay.width || canvas.height != artObjectEditor.objectToDisplay.height))
        {
            canvas.width = artObjectEditor.objectToDisplay.width;
            canvas.height = artObjectEditor.objectToDisplay.height;
        }

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        if (artObjectEditor.objectToDisplay)
            ctx.drawImage(artObjectEditor.objectToDisplay, 0, 0);
        if (artObjectEditor.object)
        {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.strokeRect(artObjectEditor.object.x + 0.5, artObjectEditor.object.y + 0.5, artObjectEditor.object.width, artObjectEditor.object.height);
            ctx.beginPath();
            ctx.moveTo(artObjectEditor.object.groundX + artObjectEditor.object.x - 5 + 0.5, artObjectEditor.object.groundY + artObjectEditor.object.y + 0.5);
            ctx.lineTo(artObjectEditor.object.groundX + artObjectEditor.object.x + 5 + 0.5, artObjectEditor.object.groundY + artObjectEditor.object.y + 0.5);
            ctx.moveTo(artObjectEditor.object.groundX + artObjectEditor.object.x + 0.5, artObjectEditor.object.groundY + artObjectEditor.object.y - 5 + 0.5);
            ctx.lineTo(artObjectEditor.object.groundX + artObjectEditor.object.x + 0.5, artObjectEditor.object.groundY + artObjectEditor.object.y + 5 + 0.5);
            ctx.stroke();

            ctx.strokeStyle = "#E00000";
            ctx.lineWidth = 1;
            ctx.strokeRect(artObjectEditor.object.x + 0.5, artObjectEditor.object.y + 0.5, artObjectEditor.object.width, artObjectEditor.object.height);
            ctx.beginPath();
            ctx.moveTo(artObjectEditor.object.groundX + artObjectEditor.object.x - 5 + 0.5, artObjectEditor.object.groundY + artObjectEditor.object.y + 0.5);
            ctx.lineTo(artObjectEditor.object.groundX + artObjectEditor.object.x + 5 + 0.5, artObjectEditor.object.groundY + artObjectEditor.object.y + 0.5);
            ctx.moveTo(artObjectEditor.object.groundX + artObjectEditor.object.x + 0.5, artObjectEditor.object.groundY + artObjectEditor.object.y - 5 + 0.5);
            ctx.lineTo(artObjectEditor.object.groundX + artObjectEditor.object.x + 0.5, artObjectEditor.object.groundY + artObjectEditor.object.y + 5 + 0.5);
            ctx.stroke();

            if (artObjectEditor.object.collision)
            {
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(artObjectEditor.object.groundX + artObjectEditor.object.x, artObjectEditor.object.groundY + artObjectEditor.object.y, artObjectEditor.object.collision.radius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = "#0000E0";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(artObjectEditor.object.groundX + artObjectEditor.object.x, artObjectEditor.object.groundY + artObjectEditor.object.y, artObjectEditor.object.collision.radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.globalAlpha = 0.3;

            for (var item in world.art.objects)
            {
                // Skip the current
                if (world.art.objects[item] == artObjectEditor.object)
                    continue;
                // Skip those which don't have the same image file
                if (world.art.objects[item].file != artObjectEditor.object.file)
                    continue;

                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.strokeRect(world.art.objects[item].x + 0.5, world.art.objects[item].y + 0.5, world.art.objects[item].width, world.art.objects[item].height);
                ctx.beginPath();
                ctx.moveTo(world.art.objects[item].groundX + world.art.objects[item].x - 5 + 0.5, world.art.objects[item].groundY + world.art.objects[item].y + 0.5);
                ctx.lineTo(world.art.objects[item].groundX + world.art.objects[item].x + 5 + 0.5, world.art.objects[item].groundY + world.art.objects[item].y + 0.5);
                ctx.moveTo(world.art.objects[item].groundX + world.art.objects[item].x + 0.5, world.art.objects[item].groundY + world.art.objects[item].y - 5 + 0.5);
                ctx.lineTo(world.art.objects[item].groundX + world.art.objects[item].x + 0.5, world.art.objects[item].groundY + world.art.objects[item].y + 5 + 0.5);
                ctx.stroke();

                ctx.strokeStyle = "#808080";
                ctx.lineWidth = 1;
                ctx.strokeRect(world.art.objects[item].x + 0.5, world.art.objects[item].y + 0.5, world.art.objects[item].width, world.art.objects[item].height);
                ctx.beginPath();
                ctx.moveTo(world.art.objects[item].groundX + world.art.objects[item].x - 5 + 0.5, world.art.objects[item].groundY + world.art.objects[item].y + 0.5);
                ctx.lineTo(world.art.objects[item].groundX + world.art.objects[item].x + 5 + 0.5, world.art.objects[item].groundY + world.art.objects[item].y + 0.5);
                ctx.moveTo(world.art.objects[item].groundX + world.art.objects[item].x + 0.5, world.art.objects[item].groundY + world.art.objects[item].y - 5 + 0.5);
                ctx.lineTo(world.art.objects[item].groundX + world.art.objects[item].x + 0.5, world.art.objects[item].groundY + world.art.objects[item].y + 5 + 0.5);
                ctx.stroke();

            }
        }
    }

    static Rename()
    {
        var newName = $("#name").val().trim();

        if ((newName.match(databaseNameRule) || !newName || newName.length < 1) || (world.art.objects[newName] && world.art.objects[newName] != artObjectEditor.object))
        {
            $("#name").css('backgroundColor', '#FFE0E0');
            return;
        }

        $("#name").css('backgroundColor', '');

        // Nothing changed => skip
        if (newName == artObjectEditor.objectName)
            return;

        var oldName = artObjectEditor.objectName;
        delete world.art.objects[artObjectEditor.objectName];
        world.art.objects[newName] = artObjectEditor.object;
        artObjectEditor.selector.UpdateList();
        artObjectEditor.selector.Select(newName);
        SearchPanel.Update();

        for (var i = 0; i < world.Zones.length; i++)
        {
            var zone = world.Zones[i];
            for (var j = 0; j < zone.Objects.length; j++)
                if (zone.Objects[j].Name == oldName)
                    zone.Objects[j].Name = newName;

            for (var j = 0; j < zone.MapFragments.length; j++)
            {
                var fragment = zone.MapFragments[i].Modifications;
                for (var k = 0; k < fragment.length; k++)
                    if (fragment[k].Action == "object" && fragment[k].Value == oldName)
                        fragment[k].Value = newName;
            }
        }

        MapUtilities.Modify("object", oldName, newName);
    }

    static ChangeParameter(parameterName: string, htmlFieldName: string)
    {
        if (parameterName == "particleEffect")
        {
            var sval = $("#" + htmlFieldName).val();
            if (!sval || sval == "")
                artObjectEditor.object[parameterName] = null;
            else
                artObjectEditor.object[parameterName] = sval;
        }
        else if (parameterName == "disappearOnClick" || parameterName == "disappearOnWalk" || parameterName == "clickOnce")
        {
            artObjectEditor.object[parameterName] = ($("#" + htmlFieldName).val() == "Yes");
        }
        else
        {
            var val = parseInt($("#" + htmlFieldName).val());
            if (isNaN(val))
                val = artObjectEditor.object[parameterName];
            artObjectEditor.object[parameterName] = val;
        }
    }

    static Clone()
    {
        var newName = "object_";
        for (var i = 1; ; i++)
        {
            if (!world.art.objects["object_" + i])
            {
                newName = "object_" + i;
                break;
            }
        }

        world.art.objects[newName] = JSON.parse(JSON.stringify(artObjectEditor.object));
        artObjectEditor.selector.UpdateList();
        artObjectEditor.selector.Select(newName);
        SearchPanel.Update();
    }

    static Delete()
    {
        Framework.Confirm("Are you sure you want to delete this object?", () =>
        {
            var oldName = artObjectEditor.objectName;

            delete world.art.objects[artObjectEditor.objectName];
            artObjectEditor.selector.UpdateList();
            artObjectEditor.selector.Select(null);

            for (var i = 0; i < world.Zones.length; i++)
            {
                var zone = world.Zones[i];
                for (var j = 0; j < zone.Objects.length;)
                {
                    if (zone.Objects[j].Name == oldName)
                        zone.Objects.splice(j, 1);
                    else
                        j++;
                }

                for (var j = 0; j < zone.MapFragments.length; j++)
                {
                    var fragment = zone.MapFragments[i].Modifications;
                    for (var k = 0; k < fragment.length;)
                    {
                        if (fragment[k].Action == "object" && fragment[k].Value == oldName)
                            fragment.splice(k, 1);
                        else
                            k++;
                    }
                }
            }

            MapUtilities.Modify("object", oldName, null);
            SearchPanel.Update();
        });
    }

    static ChangeCollision()
    {
        var val = parseInt($("#collision").val());
        if (isNaN(val))
            val = null;
        if (val === null)
        {
            if (artObjectEditor.object.collision)
                delete artObjectEditor.object.collision;
        }
        else
        {
            artObjectEditor.object.collision = { radius: val };
        }
    }

    static PositionSelection()
    {
        artObjectEditor.positionSelection = { X: 0, Y: 0, Width: 1, Height: 1 };
    }

    static GroundSelection()
    {
        artObjectEditor.groundSelection = {
            X: 0, Y: 0
        };
    }

    public static MouseDown(evt: MouseEvent)
    {
        if (!artObjectEditor.object)
            return;
        var x = evt.pageX - $("#objectDisplayContainer").position().left + $("#objectDisplayContainer").first().scrollLeft;
        var y = evt.pageY - $("#objectDisplayContainer").position().top + $("#objectDisplayContainer").first().scrollTop;

        if (artObjectEditor.positionSelection != null)
        {
            artObjectEditor.mouseOffset = { X: x, Y: y };
            artObjectEditor.positionSelection = { X: x, Y: y, Width: 1, Height: 1 };

            ArtObjectEditor.HandlePositionSelection(evt);
            $("#artObjectEditorMouseOverlay").bind("mousemove", ArtObjectEditor.MouseMove).bind("mouseup", ArtObjectEditor.MouseUp).show();
        }
        else if (artObjectEditor.groundSelection != null)
        {
            ArtObjectEditor.HandleGroundSelection(evt);
            $("#artObjectEditorMouseOverlay").bind("mousemove", ArtObjectEditor.MouseMove).bind("mouseup", ArtObjectEditor.MouseUp).show();
        }
        else
        {
            for (var item in world.art.objects)
            {
                if (world.art.objects[item].file != artObjectEditor.object.file)
                    continue;

                if (x >= world.art.objects[item].x && y >= world.art.objects[item].y && x <= world.art.objects[item].x + world.art.objects[item].width && y <= world.art.objects[item].y + world.art.objects[item].height)
                {
                    artObjectEditor.selector.Select(item);
                    return;
                }
            }
        }
    }

    public static MouseUp(evt: MouseEvent)
    {
        artObjectEditor.positionSelection = null;
        artObjectEditor.groundSelection = null;
        $("#artObjectEditorMouseOverlay").unbind("mousemove", ArtObjectEditor.MouseMove).unbind("mouseup", ArtObjectEditor.MouseUp).hide();
    }

    public static MouseMove(evt: MouseEvent)
    {
        if (!artObjectEditor.object)
            return;

        if (artObjectEditor.positionSelection)
            ArtObjectEditor.HandlePositionSelection(evt);
        else if (artObjectEditor.groundSelection)
            ArtObjectEditor.HandleGroundSelection(evt);
    }

    static HandlePositionSelection(evt: MouseEvent)
    {
        if (!artObjectEditor.object)
            return;

        var x = evt.pageX - $("#objectDisplayContainer").position().left + $("#objectDisplayContainer").first().scrollLeft;
        var y = evt.pageY - $("#objectDisplayContainer").position().top + $("#objectDisplayContainer").first().scrollTop;

        artObjectEditor.object.width = artObjectEditor.positionSelection.Width = Math.abs(x - artObjectEditor.mouseOffset.X);
        artObjectEditor.object.height = artObjectEditor.positionSelection.Height = Math.abs(y - artObjectEditor.mouseOffset.Y);
        artObjectEditor.object.x = artObjectEditor.positionSelection.X = Math.min(artObjectEditor.mouseOffset.X, x);
        artObjectEditor.object.y = artObjectEditor.positionSelection.Y = Math.min(artObjectEditor.mouseOffset.Y, y);

        $("#posX").val("" + artObjectEditor.object.x);
        $("#posY").val("" + artObjectEditor.object.y);
        $("#width").val("" + artObjectEditor.object.width);
        $("#height").val("" + artObjectEditor.object.height);
    }

    static HandleGroundSelection(evt: MouseEvent)
    {
        if (!artObjectEditor.object)
            return;

        var x = evt.pageX - $("#objectDisplayContainer").position().left + $("#objectDisplayContainer").first().scrollLeft;
        var y = evt.pageY - $("#objectDisplayContainer").position().top + $("#objectDisplayContainer").first().scrollTop;

        artObjectEditor.object.groundX = artObjectEditor.groundSelection.X = x - artObjectEditor.object.x;
        artObjectEditor.object.groundY = artObjectEditor.groundSelection.Y = y - artObjectEditor.object.y;
        $("#groundX").val("" + artObjectEditor.object.groundX);
        $("#groundY").val("" + artObjectEditor.object.groundY);
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".png");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", ArtObjectEditor.ImportFileImage).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFileImage()
    {
        ArtObjectEditor.FinishImport($("#fileOpenDialog").val());
        $("#fileOpenDialog").unbind("change", ArtObjectEditor.ImportFileImage).val("");
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
            ArtObjectEditor.FinishImport(data.new_file);
        }
    }

    static FinishImport(filename: string)
    {

        var plainUrl = filename;
        var fileUrl = filename + "?v=" + Math.round((new Date()).getTime() / 1000);

        var newName = "object_";
        for (var i = 1; ; i++)
        {
            if (!world.art.objects["object_" + i])
            {
                newName = "object_" + i;
                break;
            }
        }

        for (var item in world.art.objects)
        {
            if (world.art.objects[item].file.indexOf(plainUrl) == 0)
                world.art.objects[item].file = fileUrl;
        }

        world.art.objects[newName] = { x: 0, y: 0, width: 0, height: 0, groundX: 0, groundY: 0, file: fileUrl };
        artObjectEditor.selector.UpdateList();
        artObjectEditor.selector.Select(newName);
        Framework.Confirm("Do you want to auto-detect the objects in this image?", ArtObjectEditor.Detect);
    }

    static Detect()
    {
        setTimeout(ArtObjectEditor.DoDetect, 100);
        $("#detectingWindow").show();
    }

    static DoDetect()
    {
        if (!artObjectEditor.objectToDisplay)
            return;

        var nextId = 0;
        for (var i = 1; ; i++)
        {
            if (!world.art.objects["detect_" + i])
            {
                nextId = i;
                break;
            }
        }


        var canvas = document.createElement("canvas");
        canvas.width = artObjectEditor.objectToDisplay.width;
        canvas.height = artObjectEditor.objectToDisplay.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(artObjectEditor.objectToDisplay, 0, 0);
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);

        var maxY = 0;
        var curY = 0;
        var foundInRow = 0;
        var coord: Rectangle = {
            X: -1, Y: 0, Width: 0, Height: 0
        };

        var existingRects: Rectangle[] = [];
        for (var item in world.art.objects)
        {
            // Skip those which don't have the same image file
            if (world.art.objects[item].file != artObjectEditor.object.file)
                continue;

            if (world.art.objects[item].width == 0 && world.art.objects[item].height == 0)
                continue;

            existingRects.push({ X: world.art.objects[item].x, Y: world.art.objects[item].y, Width: world.art.objects[item].width, Height: world.art.objects[item].height });
            ArtObjectEditor.MakeTransparent(data, existingRects[existingRects.length - 1]);
        }

        var lastCreated: string = null;
        var nbFound = 0;
        while (curY < data.height && nbFound < 100)
        {
            coord = ArtObjectEditor.FindFirstEmptyPixel(data, <Point>{
                X: 0, Y: 0
            });

            if (!coord)
            {
                break;
            }
            else
            {
                ArtObjectEditor.MakeTransparent(data, coord);
                var crossing = false;
                for (var i = 0; i < existingRects.length; i++)
                {
                    if (ArtObjectEditor.RectCrossing(existingRects[i], coord))
                    {
                        crossing = true;
                        break;
                    }
                }
                existingRects.push(coord);
                if (coord.Width > 3 && coord.Height > 3 && !crossing)
                {
                    while (world.art.objects["detect_" + nextId])
                        nextId++;
                    lastCreated = "detect_" + nextId;
                    world.art.objects["detect_" + nextId] = {
                        file: artObjectEditor.object.file,
                        x: coord.X,
                        y: coord.Y,
                        groundX: Math.round(coord.Width / 2),
                        groundY: Math.round(coord.Height / 2),
                        width: coord.Width,
                        height: coord.Height
                    };
                    nextId++;
                }

                nbFound++;
            }
        }

        if (lastCreated)
        {
            for (var item in world.art.objects)
            {
                if (world.art.objects[item] == artObjectEditor.object && item.indexOf("object_") == 0 && world.art.objects[item].width == 0 && world.art.objects[item].height == 0)
                {
                    delete world.art.objects[item];
                    break;
                }
            }

            artObjectEditor.selector.UpdateList();
            artObjectEditor.selector.Select(lastCreated);
        }

        $("#detectingWindow").hide();
    }

    static RectCrossing(a: Rectangle, b: Rectangle): boolean
    {
        if (a.X + a.Width < b.X ||
            a.X > b.X + b.Width ||
            a.Y + a.Height < b.Y ||
            a.Y > b.Y + b.Height)
            return false;
        return true;
    }

    static MakeTransparent(data: ImageData, rect: Rectangle)
    {
        for (var x = rect.X; x <= rect.X + rect.Width; x++)
        {
            for (var y = rect.Y; y <= rect.Y + rect.Height; y++)
            {
                data.data[(x + y * data.width) * 4 + 0] = 0;
                data.data[(x + y * data.width) * 4 + 1] = 0;
                data.data[(x + y * data.width) * 4 + 2] = 0;
                data.data[(x + y * data.width) * 4 + 3] = 0;
            }
        }
    }

    static FindFirstEmptyPixel(data: ImageData, start: Point): Rectangle
    {
        var vres = null;
        for (var x = start.X; x < data.width; x++)
        {
            for (var y = start.Y; y < data.height; y++)
            {
                if (!ArtObjectEditor.IsTransparent(data, x, y))
                {
                    vres = { X: x, Y: y };
                    break;
                }
            }
            if (vres !== null)
                break;
        }
        if (!vres)
            return null;
        return ArtObjectEditor.FollowShape(data, vres);
    }

    static FollowShape(data: ImageData, start: Point): Rectangle
    {
        var visited: string[] = [];
        var toVisit: string[] = [];

        var minx = start.X;
        var miny = start.Y;
        var maxx = start.X;
        var maxy = start.Y;

        toVisit.push("" + start.X + "," + start.Y);
        while (toVisit.length > 0 && visited.length < 10000)
        {
            var p = toVisit.pop().split(',');

            var x = parseInt(p[0]);
            var y = parseInt(p[1]);
            visited.push("" + x + "," + y);

            if (x < minx)
                minx = x;
            if (x > maxx)
                maxx = x;
            if (y < miny)
                miny = y;
            if (y > maxy)
                maxy = y;

            if (x > 0 && !ArtObjectEditor.IsTransparent(data, x - 1, y) && !toVisit.contains("" + (x - 1) + "," + y) && !visited.contains("" + (x - 1) + "," + y))
                toVisit.push("" + (x - 1) + "," + y);
            if (x < data.width - 1 && !ArtObjectEditor.IsTransparent(data, x + 1, y) && !toVisit.contains("" + (x + 1) + "," + y) && !visited.contains("" + (x + 1) + "," + y))
                toVisit.push("" + (x + 1) + "," + y);
            if (y > 0 && !ArtObjectEditor.IsTransparent(data, x, y - 1) && !toVisit.contains("" + (x) + "," + (y - 1)) && !visited.contains("" + (x) + "," + (y - 1)))
                toVisit.push("" + (x) + "," + (y - 1));
            if (y < data.height - 1 && !ArtObjectEditor.IsTransparent(data, x, y + 1) && !toVisit.contains("" + (x) + "," + (y + 1)) && !visited.contains("" + (x) + "," + (y + 1)))
                toVisit.push("" + (x) + "," + (y + 1));
            if (y > 0 && x > 0 && !ArtObjectEditor.IsTransparent(data, x - 1, y - 1) && !toVisit.contains("" + (x - 1) + "," + (y - 1)) && !visited.contains("" + (x - 1) + "," + (y - 1)))
                toVisit.push("" + (x - 1) + "," + (y - 1));
            if (y < data.height - 1 && x > 0 && !ArtObjectEditor.IsTransparent(data, x - 1, y + 1) && !toVisit.contains("" + (x - 1) + "," + (y + 1)) && !visited.contains("" + (x - 1) + "," + (y + 1)))
                toVisit.push("" + (x - 1) + "," + (y + 1));
            if (y > 0 && x < data.width - 1 && !ArtObjectEditor.IsTransparent(data, x + 1, y - 1) && !toVisit.contains("" + (x + 1) + "," + (y - 1)) && !visited.contains("" + (x + 1) + "," + (y - 1)))
                toVisit.push("" + (x + 1) + "," + (y - 1));
            if (y < data.height - 1 && x < data.width - 1 && !ArtObjectEditor.IsTransparent(data, x + 1, y + 1) && !toVisit.contains("" + (x + 1) + "," + (y + 1)) && !visited.contains("" + (x + 1) + "," + (y + 1)))
                toVisit.push("" + (x + 1) + "," + (y + 1));
        }

        return { X: minx, Y: miny, Width: Math.max(1, maxx - minx), Height: Math.max(1, maxy - miny) };
    }

    static IsTransparent(data: ImageData, x: number, y: number): boolean
    {
        return data.data[(x + y * data.width) * 4 + 3] == 0;
    }

    static EditImage()
    {
        if (!artObjectEditor.object)
            return;
        Framework.SetLocation({
            action: "PixelEditor", type: "mapobject", file: artObjectEditor.object.file
        }, false);
    }

    static Create(newName: string)
    {
        if (!newName)
        {
            newName = "object_";
            for (var i = 1; ; i++)
            {
                if (!world.art.objects["object_" + i])
                {
                    newName = "object_" + i;
                    break;
                }
            }
        }

        Framework.Prompt("New object name", newName, (enteredName) =>
        {
            if (enteredName.match(databaseNameRule) || !enteredName || enteredName.length < 1 || world.art.objects[enteredName])
            {
                Framework.Alert("This name is not valid or is already used.", () =>
                {
                    ArtObjectEditor.Create(enteredName);
                });
                return;
            }

            var filename = enteredName.replace(/ /g, "_") + ".png";
            world.art.objects[enteredName] = { x: 0, y: 0, width: 64, height: 64, groundX: 0, groundY: 0, file: filename };
            Framework.SetLocation({
                action: "PixelEditor", type: "mapobject", file: filename
            }, false);
            SearchPanel.Update();
        });
    }
}
