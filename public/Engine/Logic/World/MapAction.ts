class MapAction
{
    public X: number;
    public Y: number;
    public Size: number;

    public Actions: DialogAction[] = [];
    public Conditions: DialogCondition[] = [];

    public Area: WorldArea;

    public static Restore(source: any, area: WorldArea): MapAction
    {
        var result = new MapAction();
        result.X = source.X;
        result.Y = source.Y;
        result.Actions = source.Actions;
        result.Conditions = source.Conditions;
        if (source.Size !== null && source.Size !== undefined)
            result.Size = source.Size;
        result.Area = area;
        return result;
    }

    public Store(): any
    {
        return { X: this.X, Y: this.Y, Size: this.Size, Actions: this.Actions, Conditions: this.Conditions };
    }

    public Display(): void
    {
        var html = "";
        html += "<style>#mapActionPosition { width: 100%; } #mapActionPosition tr td:nth-child(odd) { width: 50px; font-weight: bold; white-space: nowrap;}#mapActionPosition tr td:nth-child(even) { width: 30%;} #mapActionPosition input { width: 100%; }</style>";
        html += "<table id='mapActionPosition'><tr><td>Position X:</td><td><input type='text' value='" + this.X + "' id='mapActionX' onkeyup='MapAction.ChangeActionX()' onfocus='play.inField=true;' onblur='play.inField=false;'></td>";
        html += "<td>Y:</td><td><input type='text' value='" + this.Y + "' id='mapActionY' onkeyup='MapAction.ChangeActionY()' onfocus='play.inField=true;' onblur='play.inField=false;'></td>";
        html += "<td>Effect size:</td><td><select id='mapActionSize' onchange='MapAction.ChangeSize()'>";
        var sizes: string[] = ["Small", "Medium", "Large"];
        if (this.Size === null || this.Size === undefined)
            this.Size = 1;
        for (var i = 0; i < sizes.length; i++)
        {
            html += "<option value='" + i + "'" + (i == this.Size ? " selected" : "") + ">" + sizes[i] + "</option>";
        }
        html += "</select></td></tr></table>";
        html += "<br>";
        html += "<b>Conditions:</b><br>";

        for (var j = 0; j < this.Conditions.length; j++)
        {
            var cond: DialogCondition = this.Conditions[j];
            html += "<span class='dialogBlock'>";
            html += "<div class='dialogBlockDelete' onclick='MapAction.DeleteCondition(" + j + ")'>X</div>";
            html += "<b>" + cond.Name.title() + ":</b><br>";
            html += dialogCondition.code[cond.Name].Display(j, cond.Values);
            html += "</span>";
        }

        html += "<select onchange='MapAction.AddCondition()' id='addCondition'>";
        html += "<option>-- Select new condition --</option>";
        for (var item in dialogCondition.code)
            html += "<option value='" + item + "'>" + item.title() + "</option>";
        html += "</select>";
        html += "<b>Actions:</b><br>";

        for (var j = 0; j < this.Actions.length; j++)
        {
            var action: DialogAction = this.Actions[j];
            html += "<span class='dialogBlock'>";
            html += "<div class='dialogBlockDelete' onclick='MapAction.DeleteAction(" + j + ")'>X</div>";
            html += "<b>" + action.Name.title() + ":</b><br>";
            html += dialogAction.code[action.Name].Display(j, action.Values);
            html += "</span>";
        }

        html += "<select onchange='MapAction.AddAction()' id='addAction'>";
        html += "<option>-- Select new action --</option>";
        for (var item in dialogAction.code)
            html += "<option value='" + item + "'>" + item.title() + "</option>";
        html += "</select>";
        html += "<br>";
        html += "<center>";
        html += "<div class='button' onclick='MapAction.DeleteMapAction()'>Delete Map Action</div>";
        html += "</center>";
        $("#mapEditorActions").html(html);
    }

    static ChangeSize()
    {
        mapEditor.currentMapAction.Size = parseInt($("#mapActionSize").val());
        mapEditor.currentMapAction.Area.edited = true;
        mapEditor.modified = true;
    }

    static DeleteCondition(rowId: number): void
    {
        mapEditor.currentMapAction.Conditions.splice(rowId, 1);
        mapEditor.currentMapAction.Display();
        mapEditor.currentMapAction.Area.edited = true;
    }

    static DeleteAction(rowId: number): void
    {
        mapEditor.currentMapAction.Actions.splice(rowId, 1);
        mapEditor.currentMapAction.Display();
        mapEditor.currentMapAction.Area.edited = true;
    }

    public Check(): boolean
    {
        for (var i = 0; i < this.Conditions.length; i++)
            if (!dialogCondition.code[this.Conditions[i].Name].Check(this.Conditions[i].Values))
                return false;
        return true;
    }

    public Execute(): void
    {
        for (var i = 0; i < this.Actions.length; i++)
            dialogAction.code[this.Actions[i].Name].Execute(this.Actions[i].Values);
    }

    static AddCondition()
    {
        var condition = new DialogCondition();
        condition.Name = $("#addCondition").val();
        mapEditor.currentMapAction.Conditions.push(condition);
        mapEditor.currentMapAction.Display();
        mapEditor.currentMapAction.Area.edited = true;
    }

    static AddAction()
    {
        var action = new DialogAction();
        action.Name = $("#addAction").val();
        mapEditor.currentMapAction.Actions.push(action);
        mapEditor.currentMapAction.Display();
        mapEditor.currentMapAction.Area.edited = true;
    }

    static DeleteMapAction()
    {
        Framework.Confirm("Are you sure you want to delete this map action?", () =>
        {
            for (var i = 0; i < mapEditor.currentMapAction.Area.mapActions.length; i++)
            {
                if (mapEditor.currentMapAction.Area.mapActions[i] == mapEditor.currentMapAction)
                {
                    mapEditor.currentMapAction.Area.edited = true;
                    mapEditor.currentMapAction.Area.mapActions.splice(i, 1);
                    mapEditor.currentMapAction = null;
                    $("#mapEditorActions").html("");
                    mapEditor.modified = true;
                    return;
                }
            }
        });
    }

    static ChangeActionX()
    {
        mapEditor.currentMapAction.X = parseInt($("#mapActionX").val());
        mapEditor.currentMapAction.Area.edited = true;
        mapEditor.modified = true;
    }

    static ChangeActionY()
    {
        mapEditor.currentMapAction.Y = parseInt($("#mapActionY").val());
        mapEditor.currentMapAction.Area.edited = true;
        mapEditor.modified = true;
    }

    static ChangeCondition(id: number, position: number)
    {
        mapEditor.currentMapAction.Conditions[id].Values[position] = $("#condition_" + id + "_" + position).val();
        mapEditor.currentMapAction.Area.edited = true;
    }

    static ChangeAction(id: number, position: number)
    {
        mapEditor.currentMapAction.Actions[id].Values[position] = $("#action_" + id + "_" + position).val();
        mapEditor.currentMapAction.Area.edited = true;
    }
}