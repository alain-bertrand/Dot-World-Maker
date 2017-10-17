interface VariableContainer
{
    [s: string]: VariableValue;
}

interface ScriptFunctionContainer
{
    [s: string]: ScriptFunction;
}

interface ScriptFunction
{
    variables: string[];
    statement: CodeStatement;
}

interface APIFunctionDocumentation
{
    name: string;
    description: string;
    parameters: APIFunctionParameter[];
}

interface APIFunctionParameter
{
    name: string;
    description: string;
}

// Global API variable
var api: ApiCall = {
};

var apiFunctions: APIFunctionDocumentation[] = [];

var wrapperApiCode = "";
var wrapperApi: CodeEnvironement = null;
var stackResult: VariableValue = null;

// Class decorator which will put all the API inside the API variable.
function ApiClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    var engineApi = new target();
    api[className.substr(6).toLowerCase()] = engineApi;
}

function ApiWrapper(code: string)
{
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)
    {
        wrapperApiCode += code;
    }
}

function ApiMethod(parameters: APIFunctionParameter[], description: string)
{
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)
    {
        var tName = "" + target.constructor;
        var className = tName.match(/function ([^\(]+)\(/)[1];

        apiFunctions.push({ name: className.substr(6) + "." + propertyKey, description: description, parameters: parameters });
    };
}

interface ApiCall
{
    [s: string]: (values: VariableValue[], env: CodeEnvironement) => VariableValue;
}
var CacheApiCall: ApiCall = {};

function GetApiDocumentation(apiName: string)
{
    var apiFunction: APIFunctionDocumentation = null;
    for (var i = 0; i < apiFunctions.length; i++)
    {
        if (apiFunctions[i].name.toLowerCase() == apiName.toLowerCase())
        {
            apiFunction = apiFunctions[i];
            break;
        }
    }

    if (!apiFunction)
        return null;

    var html = "";
    html += "<h1>" + apiName + "</h1>";

    html += "<h2>Function call</h2>";
    html += "<span class='codeExample'>" + apiName + "(";
    if (apiFunction.parameters && apiFunction.parameters.length)
    {
        for (var i = 0; i < apiFunction.parameters.length; i++)
        {
            if (i != 0)
                html += ", ";
            html += apiFunction.parameters[i].name;
        }
    }
    html += ");</span>";

    if (apiFunction.parameters && apiFunction.parameters.length)
    {
        html += "<h2>Parameters</h2>";
        html += "<table>";
        for (var i = 0; i < apiFunction.parameters.length; i++)
        {
            html += "<tr><td>" + apiFunction.parameters[i].name + "</td>";
            html += "<td>" + apiFunction.parameters[i].description + "</td></tr>";
        }
        html += "</table>";
    }

    html += "<h2>Description</h2>";
    html += apiFunction.description;
    return html;
}

function GetApiSignature(apiName: string)
{
    var apiFunction: APIFunctionDocumentation = null;
    for (var i = 0; i < apiFunctions.length; i++)
    {
        if (apiFunctions[i].name.toLowerCase() == apiName.toLowerCase())
        {
            apiFunction = apiFunctions[i];
            break;
        }
    }

    if (!apiFunction)
        return null;
    var html = "<span class='codeExample'>" + apiName + "(";
    if (apiFunction.parameters && apiFunction.parameters.length)
    {
        for (var i = 0; i < apiFunction.parameters.length; i++)
        {
            if (i != 0)
                html += ", ";
            html += apiFunction.parameters[i].name;
        }
    }
    html += ");</span>";
    return html;
}

function GetApiDescription(apiName: string)
{
    var apiFunction: APIFunctionDocumentation = null;
    for (var i = 0; i < apiFunctions.length; i++)
    {
        if (apiFunctions[i].name.toLowerCase() == apiName.toLowerCase())
        {
            apiFunction = apiFunctions[i];
            break;
        }
    }

    if (!apiFunction)
        return null;
    else
        return apiFunction.description;
}

interface VariablePosition
{
    [s: string]: number;
}

interface FunctionCodeBlock
{
    [s: string]: FunctionDefinitionCode;
}

interface ExecutionStack
{
    VariableStack: VariableValue[];
    CodeBlock: ExecutionCode[];
    CodeLine: number;
    Variables: VariableContainer;
    Callback: (value: VariableValue) => void;
}

class CodeEnvironement
{
    public variables: VariableContainer = {};
    public CodeVariables: CodeVariableContainer = {};
    public GlobalVariables: VariableContainer = {};
    public ParentCode: CodeEnvironement = null;
    public storeStack: boolean = false;
    public callAfterStoredStack: () => void;
    public FunctionCodes: FunctionCodeBlock = {};

    public CodeLine: number = 0;
    private variableStack: VariableValue[] = [];
    public codeBlock: ExecutionCode[];
    private executionStack: ExecutionStack[] = null;
    private callBackResult: (value: VariableValue) => void;

    public Compile(functions: FunctionDefinitionStatement[])
    {
        for (var i = 0; i < functions.length; i++)
        {
            if (!functions[i].Name)
                continue;
            var f = new FunctionDefinitionCode();
            f.Name = functions[i].Name;
            functions[i].Compile(f);
            this.FunctionCodes[functions[i].Name.toLowerCase()] = f;
        }
    }

    public Flush()
    {
        this.variableStack = [];
    }

    public Pop(): VariableValue
    {
        return this.variableStack.pop();
    }

    public Push(value: VariableValue)
    {
        return this.variableStack.push(value);
    }

    public ExecuteSubFunctionCode(name: string, values: VariableValue[])
    {
        this.executionStack.push({ CodeBlock: this.codeBlock, CodeLine: this.CodeLine, Variables: this.variables, VariableStack: this.variableStack, Callback: this.callBackResult });

        var lname = name.toLowerCase();
        var parts = lname.split(".");
        if (parts.length == 3)
        {
            var code = world.GetCode(parts[1]);
            if (!code)
                throw "Function '" + name + "' is unknown.";
            if (!code.code)
                code.code = CodeParser.ParseWithParameters(code.Source, code.Parameters, false);
            if (!code.code.HasFunction(parts[2]))
                throw "Function '" + name + "' is unknown.";
            this.codeBlock = code.code.FunctionCodes[parts[2]].Code;
        }
        else
        {
            if (!this.FunctionCodes[lname])
                throw "Function '" + name + "' is unknown.";
            this.codeBlock = this.FunctionCodes[lname].Code;
        }
        this.CodeLine = 0;
        this.variables = {};
        this.variableStack = [];
        this.callBackResult = null;

        for (var i = 0; i < values.length; i++)
            this.Push(values[i]);
    }

    public ExecuteWrapperFunctionCode(name: string, values: VariableValue[])
    {
        this.executionStack.push({ CodeBlock: this.codeBlock, CodeLine: this.CodeLine, Variables: this.variables, VariableStack: this.variableStack, Callback: this.callBackResult });

        var w = name.toLowerCase().replace(".", "_");
        this.codeBlock = wrapperApi.FunctionCodes[w].Code;
        this.CodeLine = 0;
        this.variables = {};
        this.variableStack = [];
        this.callBackResult = null;

        for (var i = 0; i < values.length; i++)
            this.Push(values[i]);
    }

    public ExecuteFunctionCode(name: string, values: VariableValue[], callback: (res: VariableValue) => void = null)
    {
        if (this.executionStack)
            this.executionStack.push({ CodeBlock: this.codeBlock, CodeLine: this.CodeLine, Variables: this.variables, VariableStack: this.variableStack, Callback: this.callBackResult });
        else
            this.executionStack = [];
        this.variables = {};
        this.variableStack = [];
        this.CodeLine = 0;
        this.callBackResult = callback;

        var lname = name.toLowerCase();
        if (!this.FunctionCodes[lname])
            throw "Function '" + name + "' is unknown.";
        this.codeBlock = this.FunctionCodes[lname].Code;
        for (var i = 0; i < values.length; i++)
            this.Push(values[i]);
        return this.CodeExecution();
    }

    private CodeExecution(): VariableValue
    {
        while (true)
        {
            while (this.CodeLine >= 0 && this.CodeLine < this.codeBlock.length)
            {
                this.codeBlock[this.CodeLine].Execute(this);
                if (this.storeStack)
                {
                    var f = this.callAfterStoredStack;
                    this.callAfterStoredStack = null;
                    this.storeStack = false;
                    f();
                    return null;
                }
            }
            if (this.executionStack && this.executionStack.length > 0)
            {
                var s = this.executionStack.pop();
                var res: VariableValue = null;
                if (this.variableStack.length > 0)
                    res = this.variableStack.pop();
                if (this.callBackResult)
                    this.callBackResult(res);
                this.codeBlock = s.CodeBlock;
                this.variables = s.Variables;
                this.variableStack = s.VariableStack;
                this.CodeLine = s.CodeLine;
                this.callBackResult = s.Callback;
                if (res !== null && res !== undefined)
                    this.variableStack.push(res);
            }
            else
                break;
        }

        this.executionStack = null;
        var res: VariableValue = null;
        if (this.variableStack.length > 0)
            res = this.Pop();
        if (this.callBackResult)
            this.callBackResult(res);
        return res;
    }

    public SetVariable(name: string, value: VariableValue): void
    {
        if (this.variables[name])
        {
            this.variables[name] = value;
            return;
        }
        var lname = name.toLowerCase();
        this.variables[lname] = value;
    }

    public GetVariable(name: string): VariableValue
    {
        if (name == "stackresult")
            return stackResult;

        if (this.variables[name])
            return this.variables[name];
        if (this.variables[name.toLowerCase()])
            return this.variables[name.toLowerCase()];
        throw "Variable " + name + " unknown";
    }

    public HasVariable(name: string): boolean
    {
        if (this.variables[name] || this.variables[name.toLowerCase()] || name.toLowerCase() == "stackresult")
            return true;
        return false;
    }
    public SetGlobalVariable(name: string, value: VariableValue): void
    {
        var lname = name.toLowerCase();
        this.GlobalVariables[lname] = value;
    }

    public GetGlobalVariable(name: string): VariableValue
    {
        var lname = name.toLowerCase();
        if (this.GlobalVariables[lname] == undefined || this.GlobalVariables[lname] == null)
            throw "Global variable " + name + " unknown";
        return this.GlobalVariables[lname];
    }

    public HasFunction(name: string): boolean
    {
        if (this.FunctionCodes[name] || this.FunctionCodes[name.toLowerCase()])
            return true;
        var parts = name.toLowerCase().split('.');
        if (parts.length != 2)
            return false;
        if (!api[parts[0]])
            return false;
        if (!api[parts[0]][parts[1]])
            return false;
        return true;
    }

    protected BuildEnv(): CodeEnvironement
    {
        var env = new CodeEnvironement();
        env.CodeVariables = this.CodeVariables;
        env.GlobalVariables = this.GlobalVariables;
        return env;
    }

    public RebuildStack()
    {
        this.CodeExecution();
    }

    public ExecuteFunction(name: string, values: VariableValue[], callback: (res: VariableValue) => void = null): VariableValue
    {
        var lname = name.toLowerCase();
        if (this.FunctionCodes[lname])
            return this.ExecuteFunctionCode(name, values, callback);
        if (this.ParentCode && this.ParentCode.FunctionCodes[lname])
            return this.ParentCode.ExecuteFunctionCode(name, values, callback);
        var parts = lname.split('.');
        if (parts.length == 3)
        {
            var genericCode = world.GetCode(parts[1]);
            return genericCode.code.ExecuteFunction(parts[2], values, callback);
        }
        else if (parts.length == 2)
        {
            if (!api[parts[0]])
                throw "Unknown function call " + name;

            var lowerCase = parts[1].toLowerCase().replace(/^_/, "");
            var correctCase = null;
            for (var funcName in api[parts[0]])
            {
                if (funcName.toLowerCase() == lowerCase)
                {
                    correctCase = funcName;
                    break;
                }
            }

            if (!correctCase)
                throw "Unknown function call " + name;
            CacheApiCall[name] = api[parts[0]][correctCase];
            var res = api[parts[0]][correctCase](values, this);
            if (callback)
                callback(res);
            return res;
        }
        else
            throw "Unknown function call " + name;
    }

    public FindApiFunction(name: string): ApiCall
    {
        var parts = name.toLowerCase().split('.');

        var lowerCase = parts[1].toLowerCase().replace(/^_/, "");
        var correctCase = null;
        for (var funcName in api[parts[0]])
        {
            if (funcName.toLowerCase() == lowerCase)
            {
                correctCase = funcName;
                break;
            }
        }

        if (!correctCase)
            throw "Unknown function call " + name;
        return api[parts[0]][correctCase];
    }

    public ContainsFunctions(): boolean
    {
        if (!this.FunctionCodes)
            return false;
        for (var item in this.FunctionCodes)
            return true;
        return false;
    }

    public StoreStack(callback: () => void)
    {
        this.storeStack = true;
        this.callAfterStoredStack = callback;
    }

    public HasWrapper(name: string)
    {
        if (!wrapperApiCode || wrapperApiCode == "")
            return false;
        if (wrapperApiCode != "" && !wrapperApi)
            wrapperApi = CodeParser.Parse(wrapperApiCode);
        if (wrapperApi.HasFunction(name.replace(".", "_")))
            return true;
    }
}