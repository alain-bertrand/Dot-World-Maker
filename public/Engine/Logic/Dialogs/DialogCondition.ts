interface ConditionClasses
{
    [s: string]: ConditionClass;
}

var dialogCondition = new (class
{
    public code: ConditionClasses = {};
    public currentEditor: string;
});

function DialogConditionClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    var conditionClass = new target();
    if (conditionClass instanceof ConditionClass)
        dialogCondition.code[className] = conditionClass;
    else
        throw "Class \"" + className + "\" doesn't extends ConditionClass.";
}

abstract class ConditionClass
{
    public abstract Display(id: number, values: string[], updateFunction?: string): string;
    public abstract Check(values: string[], env?: CodeEnvironement): boolean;

    protected OptionList(id: number, position: number, values: any, currentValue: string, updateFunction?: string): string
    {
        var html = "";
        html += "<span class='dialogParam'><select id='" + (updateFunction ? updateFunction : "condition") + "_" + id + "_" + position + "' onchange='" + dialogCondition.currentEditor + "." + (updateFunction ? updateFunction : "ChangeCondition") + "(" + id + "," + position + ")'>";
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
        return "<span class='dialogParam'><input id='" + (updateFunction ? updateFunction : "condition") + "_" + id + "_" + position + "' type='text' value='" + (currentValue ? currentValue : "").htmlEntities() + "' onchange='" + dialogCondition.currentEditor + "." + (updateFunction ? updateFunction : "ChangeCondition") + "(" + id + "," + position + ")' onfocus='play.inField=true;' onblur='play.inField=false;'></span>";
    }

    protected Label(label: string): string
    {
        return "<span class='dialogParamLabel'>" + label + "</span>";
    }
}

class DialogCondition implements DialogConditionInterface
{
    public Name: string;
    public Values: string[] = [];
}