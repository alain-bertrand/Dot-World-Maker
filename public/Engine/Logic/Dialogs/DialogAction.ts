interface ActionClasses
{
    [s: string]: ActionClass;
}

interface IdValue
{
    Id: string;
    Value: string;
}

var dialogAction = new (class
{
    public code: ActionClasses = {};
    public currentEditor = "NPCEditor";
});

function DialogActionClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    var actionClass = new target();
    if (actionClass instanceof ActionClass)
        dialogAction.code[className] = actionClass;
    else
        throw "Class \"" + className + "\" doesn't extends ActionClass.";
}

abstract class ActionClass
{
    public abstract Display(id: number, values: string[], updateFunction?: string): string;
    public abstract Execute(values: string[], env?: CodeEnvironement): void;

    protected OptionList(id: number, position: number, values: string[], currentValue: string, updateFunction?: string): string;

    protected OptionList(id: number, position: number, values: IdValue[], currentValue: string, updateFunction?: string): string;

    protected OptionList(id: number, position: number, values: any, currentValue: string, updateFunction?: string): string
    {
        var html = "";
        html += "<span class='dialogParam'><select id='" + (updateFunction ? updateFunction : "action") + "_" + id + "_" + position + "' onchange='" + dialogAction.currentEditor + "." + (updateFunction ? updateFunction : "ChangeAction") + "(" + id + "," + position + ")'>";
        var found = false;
        for (var i = 0; i < values.length; i++)
        {
            if (values[i].Id != undefined)
            {
                html += "<option" + (values[i].Id == currentValue ? " selected" : "") + " value='" + ("" + values[i].Id).htmlEntities() + "'>" + values[i].Value + "</option>";
                if (values[i].Id == currentValue)
                    found = true;
            }
            else
            {
                html += "<option" + (values[i] == currentValue ? " selected" : "") + " value='" + ("" + values[i]).htmlEntities() + "'>" + values[i] + "</option>";
                if (values[i] == currentValue)
                    found = true;
            }
        }
        if (!found)
            html += "<option selected>" + (currentValue === undefined ? "" : currentValue) + "</option>";
        html += "</select></span>";
        return html;
    }

    protected Input(id: number, position: number, currentValue: string, updateFunction?: string): string
    {
        return "<span class='dialogParam'><input id='" + (updateFunction ? updateFunction : "action") + "_" + id + "_" + position + "' type='text' value='" + (currentValue ? currentValue : "").htmlEntities() + "' onkeyup='" + dialogAction.currentEditor + "." + (updateFunction ? updateFunction : "ChangeAction") + "(" + id + "," + position + ")' onfocus='play.inField=true;' onblur='play.inField=false;'></span>";
    }

    protected Label(label: string): string
    {
        return "<span class='dialogParamLabel'>" + label + "</span>";
    }
}

class DialogAction implements DialogActionInterface
{
    public Name: string;
    public Values: string[] = [];
}