/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class ExecuteCodeFunction extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Function");
        html += this.Input(id, 0, values[0], updateFunction);
        return html;
    }

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        if (!env)
            env = new CodeEnvironement();
        ExecuteCodeFunction.ExecuteFunction(values);
    }

    public static ExecuteFunction(values: string[])
    {
        try
        {
            var func = values[0];
            if (func.indexOf("(") == -1)
                func += "();";
            if (func.charAt(func.length - 1) != ";")
                func += ";";

            var parse = CodeParser.Parse("function to_exec() { " + func + " }");
            parse.ExecuteFunction("to_exec", []);
        }
        catch (ex)
        {
            throw "The expression used in 'Execute Code Function' is invalid.";
        }
    }
}