interface SearchCondition
{
    col: string;
    check: string;
    value: string;
}

var charsRegex = /[\0\b\t\n\r\x1a\"\'\\]/g;
var charsMap = {
    '\0': '\\0',
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\r': '\\r',
    '\x1a': '\\Z',
    '"': '\\"',
    '\'': '\\\'',
    '\\': '\\\\'
};

class QueryParser
{
    private query: string;
    private position: number;
    private length: number;

    private inSeparator = "(),";

    constructor(query: string)
    {
        this.query = query;
        this.position = 0;
        this.length = this.query.length;
    }

    public static BuildSQL(queryString: string, columns: StorageColumn[]): string
    {
        var query = new QueryParser(queryString);
        return QueryParser.ToSql(query.Parse(), columns);
    }

    private static ToSql(queryElement: any, columns: StorageColumn[]): string
    {
        if (queryElement.first)
            return "(" + QueryParser.ToSql(queryElement.first, columns) + (queryElement.or ? " OR " + QueryParser.ToSql(queryElement.or, columns) : " AND " + QueryParser.ToSql(queryElement.and, columns)) + ")";

        //console.log(queryElement);
        var result = "";
        var c = QueryParser.FindColumn((<SearchCondition>queryElement).col, columns);

        switch ((<SearchCondition>queryElement).check)
        {
            case "is":
                result += "c" + c;
                result += " = ";
                result += "'" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "'";
                break;
            case "is not":
                result += "c" + c;
                result += " <> ";
                result += "'" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "'";
                break;
            case "is empty":
                result += "(c" + c;
                result += " is empty or c" + c + " = '')";
                break;
            case "contains":
                result += "c" + c;
                result += " like '%" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "%'";
                break;
            case "not contains":
                result += "c" + c;
                result += " not like '%" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "%'";
                break;
            case "starts":
                result += "c" + c;
                result += " like '" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "%'";
                break;
            case "ends":
                result += "c" + c;
                result += " like '%" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "'";
                break;
            case ">":
                result += "c" + c;
                result += " > ";
                result += "'" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "'";
                break;
            case ">=":
                result += "c" + c;
                result += " >= ";
                result += "'" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "'";
                break;
            case "<":
                result += "c" + c;
                result += " < ";
                result += "'" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "'";
                break;
            case "<=":
                result += "c" + c;
                result += " <= ";
                result += "'" + QueryParser.EscapeString((<SearchCondition>queryElement).value) + "'";
                break;
            default:
                throw "Operation " + (<SearchCondition>queryElement).check + " not yet supported.";
        }
        return result;
    }

    private static FindColumn(name: string, columns: StorageColumn[]): number
    {
        for (var i = 0; i < columns.length; i++)
        {
            //console.log("? " + columns[i].name + " == " + name);
            if (columns[i].name.toLowerCase() == name.toLowerCase())
                return i;
        }
        throw "Column '" + name + "' not known";
    }

    private static EscapeString(toEscape: string): string
    {
        var chunkIndex: number = charsRegex.lastIndex = 0;
        var result: string = '';
        var match: RegExpExecArray;

        while ((match = charsRegex.exec(toEscape)))
        {
            result += toEscape.slice(chunkIndex, match.index) + charsMap[match[0]];
            chunkIndex = charsRegex.lastIndex;
        }

        // Nothing was escaped
        if (chunkIndex === 0)
            return toEscape;

        if (chunkIndex < toEscape.length)
            return result + toEscape.slice(chunkIndex);

        return result;
        /*var allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-_.,:;";
        var result = "";
        for (var i = 0; i < toEscape.length; i++)
        {
            var c = toEscape[i];
            if (allowedChars.indexOf(c) != -1)
                result += c;
            else if (c == "'")
                result += "''";
        }
        return result;*/
    }

    private Parse(): any
    {
        return this.ParseCondition();
    }

    private ParseCondition(): any
    {
        this.SkipWhiteSpaces();
        var first: any = null;
        if (this.PeekChar() == "(")
        {
            this.NextChar();
            this.SkipWhiteSpaces();
            first = this.ParseCondition();
            if (this.PeekChar() != ")")
                throw "Missing closing bracket (position: " + this.position + ").";
            this.NextChar();
        }
        else
        {
            var valA = this.NextValue();
            if (valA.toLowerCase() == "any")
                valA = "ANY";
            var cond = this.NextCondition();
            var valB = null;
            if (cond == "in")
            {
                if (this.NextWord() != "(")
                    throw "Missing '(' with the in operator.";
                var values: string[] = [];
                while (this.PeekWord() != ")")
                {
                    values.push(this.NextValue());
                    if (this.PeekWord() == ")")
                    {
                        this.NextWord();
                        break;
                    }
                    if (this.PeekWord() != ",")
                        throw "Missing ',' between the 'in' options.";
                    this.NextWord();
                }

                first = { col: valA, check: "is", value: values.shift() };
                while (values.length > 0)
                    first = { first: first, or: { col: valA, check: "is", value: values.shift() } };
            }
            else
            {
                if (cond != "Is not empty" && cond != "Is empty")
                    valB = this.NextValue();
                else
                    valB = "";
                first = { col: valA, check: cond, value: valB };
            }
        }

        this.SkipWhiteSpaces();
        if (!this.HasChar())
            return first;
        if (this.PeekChar() == ")")
            return first;
        if (this.PeekWord().toLowerCase() != "and" && this.PeekWord().toLowerCase() != "or")
            throw "Missing logic operator (and / or)  (position: " + this.position + ").";
        var logic = this.NextWord();
        this.SkipWhiteSpaces();
        var second = this.ParseCondition();

        switch (logic.toLowerCase())
        {
            case "and":
                return { first: first, and: second };
            case "or":
                return { first: first, or: second };
        }
    }

    private HasChar(): boolean
    {
        return this.position < this.length;
    }

    private PeekChar(): string
    {
        if (this.position >= this.length)
            return null;
        return this.query.charAt(this.position);
    }

    private RollbackChar()
    {
        this.position--;
    }

    private NextChar(): string
    {
        if (this.position >= this.length)
            throw "End reached while expecting a character.";
        return this.query.charAt(this.position++);
    }

    private PeekWord(): string
    {
        var storedPosition = this.position;
        this.SkipWhiteSpaces();
        var result = "";
        while (this.HasChar())
        {
            if (result != "" && this.inSeparator.indexOf(this.PeekChar()) != -1)
                break;
            var c = this.NextChar();
            if (c == " ")
                break;
            result += c;
            if (this.inSeparator.indexOf(c) != -1)
                break;
        }
        this.position = storedPosition;
        return result;
    }

    private NextWord(): string
    {
        this.SkipWhiteSpaces();
        var result = "";
        while (this.HasChar())
        {
            if (result != "" && this.inSeparator.indexOf(this.PeekChar()) != -1)
                break;
            var c = this.NextChar();
            if (c == " ")
                break;
            result += c;
            if (this.inSeparator.indexOf(c) != -1)
                break;
        }
        return result;
    }

    private SkipWhiteSpaces()
    {
        while (this.PeekChar() == " " || this.PeekChar() == "\t" || this.PeekChar() == "\n")
        {
            this.NextChar();
        }
    }

    private NextCondition(): string
    {
        switch (this.PeekWord().toLowerCase())
        {
            case "contains":
            case "contain":
                this.NextWord();
                return "contains";
            case "doesn't":
            case "not":
                this.NextWord();
                switch (this.PeekWord().toLowerCase())
                {
                    case "contains":
                    case "contain":
                        this.NextWord();
                        return "not contains";
                    case "like":
                        this.NextWord();
                        return "not Like";
                    case "empty":
                        this.NextWord();
                        return "not empty";
                    case "equal":
                    case "equals":
                    case "is":
                        this.NextWord();
                        return "not Is";
                    default:
                        throw "Unknown condition (position: " + this.position + ").";
                }
            case "starts":
            case "start":
                this.NextWord();
                if (this.PeekWord().toLowerCase() == "with")
                    this.NextWord();
                return "starts with";
            case "ends":
            case "end":
                this.NextWord();
                if (this.PeekWord().toLowerCase() == "with")
                    this.NextWord();
                return "ends with";
            /*case "like":
                this.NextWord();
                return "like";*/
            case "empty":
                this.NextWord();
                return "is empty";
            case "is":
                this.NextWord();
                if (this.PeekWord() == "not")
                {
                    this.NextWord();
                    if (this.PeekWord().toLowerCase() == "empty")
                    {
                        this.NextWord();
                        return "not empty";
                    }
                    else return "not Is";
                    //throw "Unknown condition (position: " + this.position + ").";
                }
                else if (this.PeekWord().toLowerCase() == "empty")
                {
                    this.NextWord();
                    return "is empty";
                }
                return "is";
            /*case "in":
                this.NextWord();
                if (this.PeekWord() != "(")
                    throw "Missing '(' after the in condition (position: " + this.position + ").";
                return "in";*/
            case "!=":
            case "<>":
                this.NextWord();
                return "not Is";
            case "equal":
            case "equals":
            case "=":
            case "==":
                this.NextWord();
                return "is";
            case ">":
                this.NextWord();
                return ">";
            case ">=":
                this.NextWord();
                return ">=";
            case "<":
                this.NextWord();
                return "<";
            case "<=":
                this.NextWord();
                return "<=";
            default:
                throw "Unknown condition (position: " + this.position + ").";
        }
    }

    private NextValue(): string
    {
        this.SkipWhiteSpaces();

        var init = this.PeekChar();
        if (init == "'" || init == "\"" || init == "[")
            this.NextChar();
        var result = "";
        while (this.HasChar())
        {
            var c = this.NextChar();
            if (init == "'" && c == "'")
            {
                if (this.HasChar() && this.PeekChar() == "'")
                {
                    c += "'";
                    this.NextChar();
                }
                else
                    break;
            }
            if (init == "\"" && c == "\"")
                break;
            if (init == "[" && c == "]")
                break;
            if (init != "'" && init != "\"" && init != "[" && (c == " " || c == ")"))
            {
                if (c == ")")
                    this.RollbackChar();
                break;
            }
            result += c;
        }
        return result;
    }
}