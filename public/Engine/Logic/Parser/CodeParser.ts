interface Tokenizer
{
    [s: string]: CodeToken;
}

var codeParser = new (class
{
    public codeTokenizer: Tokenizer = {};
});

interface CodeTokenResult
{
    Type: string;
    Line: number;
    Column: number;
    Value: string;
}

function Token(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    var tokenizer = new target();
    if (tokenizer instanceof CodeToken)
        codeParser.codeTokenizer[className] = tokenizer;
    else
        throw "Class \"" + className + "\" doesn't extends CodeToken.";
}

class CodeParser
{
    private source: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private tokens: CodeTokenResult[] = [];
    public TokenPosition: number = 0;

    static ParseWithParameters(source: string, codeVariables: CodeVariableContainer, withVerify: boolean = true): CodeEnvironement
    {
        var replaced = source;
        if (codeVariables) for (var i in codeVariables)
        {
            var regexp = new RegExp("@" + i + "@", "gi");
            replaced = replaced.replace(regexp, codeVariables[i].value);
        }

        var parser = new CodeParser(replaced);
        var env = parser.GenerateTopEnvironement(withVerify);
        env.CodeVariables = codeVariables;
        return env;
    }

    static Parse(source: string, withVerify: boolean = true): CodeEnvironement
    {
        var comments = CodeParser.GetAllTokens(source, "TokenComment");

        var codeVariables: CodeVariableContainer = {};
        var m: RegExpMatchArray = null;
        for (var j = 0; j < comments.length; j++)
        {
            if ((m = comments[j].Value.trim().match(/^\/\s*([a-z-A-z]+):\s*(.+)\s*,\s*([a-zA-Z_]*)$/)))
            {
                codeVariables[m[1].toLowerCase()] = { name: m[1], value: m[2], type: m[3] };
            }
        }

        var replaced = source;
        for (var i in codeVariables)
        {
            var regexp = new RegExp("@" + i + "@", "gi");
            replaced = replaced.replace(regexp, codeVariables[i].value);
        }

        var parser = new CodeParser(replaced);
        var env = parser.GenerateTopEnvironement(withVerify);
        env.CodeVariables = codeVariables;
        return env;
    }

    static ExecuteStatement(source: string, variables: VariableContainer = null): VariableValue
    {
        var variablesNames = [];
        var variablesValues = [];
        if (variables) for (var item in variables)
        {
            variablesNames.push(item);
            variablesValues.push(variables[item]);
        }
        if (source.indexOf(";") != -1 && source.indexOf(";") != source.length)
            var env = CodeParser.Parse("function tempFunction(" + variablesNames.join(",") + ") { " + source + "; }");
        else
            var env = CodeParser.Parse("function tempFunction(" + variablesNames.join(",") + ") { return " + source + "; }");
        return env.ExecuteFunction("tempFunction", variablesValues);
    }

    static GetAllTokens(source: string): CodeTokenResult[];

    static GetAllTokens(source: string, ofType?: string): CodeTokenResult[];

    static GetAllTokens(source: string, ofType?: any): CodeTokenResult[]
    {
        var parser = new CodeParser(source);
        if (ofType == null || ofType == undefined)
            return parser.tokens;
        else
        {
            var result: CodeTokenResult[] = [];
            for (var i = 0; i < parser.tokens.length; i++)
                if (parser.tokens[i].Type == ofType)
                    result.push(parser.tokens[i]);
            return result;
        }
    }

    constructor(source: string)
    {
        this.source = source;
        this.tokens = [];
        while (this.HasChar())
        {
            this.tokens.push(this.Tokenize());
            this.SkipSpaces();
        }
    }

    public GenerateTopEnvironement(withVerify: boolean = true): CodeEnvironement
    {
        var env = new CodeEnvironement();
        var functions = <FunctionDefinitionStatement[]>(<any>this.GetAllStatements());
        env.Compile(functions);
        if (withVerify)
        {
            for (var i = 0; i < functions.length; i++)
                functions[i].Verify(env);
        }
        return env;
    }

    HasChar(): boolean
    {
        return this.position < this.source.length;
    };

    PeekChar(offset?: number): string
    {
        return this.source.charAt(this.position + (offset == null || offset == undefined ? 0 : offset));
    };

    NextChar(): string
    {
        var c = this.source.charAt(this.position++);
        if (c == "\r")
        {

        }
        else if (c == "\n")
        {
            this.line++;
            this.column = 1;
        }
        else
        {
            this.column++;
        }
        return c;
    };

    SkipChar()
    {
        this.NextChar();
    };


    SkipSpaces(): void
    {
        var spaces = " \n\r\t";
        while (this.HasChar())
        {
            if (spaces.indexOf(this.PeekChar()) == -1)
                break;
            this.SkipChar();
        }
    }

    public GetAllStatements(): CodeStatement[]
    {
        var res: CodeStatement[] = [];
        this.TokenPosition = 0;
        /*// remove all the comments
        for (var i = 0; i < this.tokens.length;)
        {
            if (this.tokens[i].Type == "TokenComment")
                this.tokens.splice(i, 1);
            else
                i++;
        }*/


        while (this.HasToken())
        {
            var s = this.GetStatement();
            if (s)
                res.push(s);
        }
        return res;
    }

    private GetStatement(): CodeStatement
    {
        return CodeStatement.Top(this);
    }

    private Tokenize(): CodeTokenResult
    {
        for (var i in codeParser.codeTokenizer)
        {
            if (codeParser.codeTokenizer[i].CanBeUsed(this))
            {
                return { Type: i, Line: this.line, Column: this.column, Value: codeParser.codeTokenizer[i].Extract(this) };
            }
        }
        throw "Unrecognized token at " + this.line + ":" + this.column;
    };

    public HasToken(): boolean
    {
        return this.TokenPosition < this.tokens.length;
    }

    public PeekToken(offset: number = 0, skipComments: boolean = false): CodeTokenResult
    {
        while (skipComments && this.HasToken() && this.PeekToken().Type == "TokenComment")
            this.TokenPosition++;
        /*if (this.tokens[this.TokenPosition + offset] === null || this.tokens[this.TokenPosition + offset] == undefined)
            throw "Unexpected end of script.";*/
        return this.tokens[this.TokenPosition + offset];
    }

    public NextToken(skipComments:boolean = false): CodeTokenResult
    {
        while (skipComments && this.HasToken() && this.PeekToken().Type == "TokenComment")
            this.TokenPosition++;
        if (this.tokens[this.TokenPosition] === null || this.tokens[this.TokenPosition] == undefined)
            throw "Unexpected end of script.";
        return this.tokens[this.TokenPosition++];
    }

    public GetLine(): number
    {
        return this.line;
    }

    public GetColumn(): number
    {
        return this.column;
    }
}