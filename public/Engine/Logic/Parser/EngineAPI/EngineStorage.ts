/// <reference path="../CodeEnvironement.ts" />

var engineStorage = new (class
{
    lastRowId: string = null;
    nextQueryId: number = 1;
    openQueries: StorageQuery[] = [];
    openCreate: NewStorage[] = [];
    tableList: TableInfo[] = [];
    columnList: TableInfo[] = [];
});

interface TableInfo
{
    id: number;
    name: string;
}

interface NewStorage
{
    table: string;
    headers: string[];
    values: string[];
}

interface StorageQuery
{
    id: number;
    table: string;
    condition: string;
    orderBy: string;
    headers: string[];
    executed: boolean;
    rows: StorageRow[];
    currentRow: number;
    error?: string;
}

interface StorageRow
{
    cells: string[];
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

@ApiClass
class EngineStorage
{
    @ApiMethod([{ name: "tableName", description: "The table name." },
        { name: "columnName", description: "The name of the column where to store the data." },
        { name: "value", description: "The data to store." }], "Add a new column / row to the database.")
    AddNewData(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var table = values[0].GetString();
        var found: number = null;
        for (var i = 0; i < engineStorage.openCreate.length; i++)
        {
            if (engineStorage.openCreate[i].table.toLowerCase() == table.toLowerCase())
            {
                found = i;
                break;
            }
        }
        if (found === null)
        {
            engineStorage.openCreate.push({ table: table, headers: [], values: [] });
            found = engineStorage.openCreate.length - 1;
        }

        var header = values[1].GetString();
        var value = values[2].GetString();
        engineStorage.openCreate[found].headers.push(header);
        engineStorage.openCreate[found].values.push(value);
        return null;
    }

    Verify_AddNewData(line: number, column: number, values: any[]): void
    {
        if (typeof values[0] == "string")
        {
            if (!("" + values[0]).match(/^[a-z][a-z_0-9]+$/i))
                throw "The table name '" + values[2] + "' is not using a valid name at " + line + ":" + column;
            return;
        }
        if (typeof values[1] == "string")
        {
            if (!("" + values[0]).match(/^[a-z][a-z_0-9]+$/i))
                throw "The column name '" + values[2] + "' is not using a valid name at " + line + ":" + column;
            return;
        }
    }


    @ApiMethod([{ name: "tableName", description: "The table name." }], "Submit the data to add.")
    StoreData(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var table = values[0].GetString();
        var found: number = null;
        for (var i = 0; i < engineStorage.openCreate.length; i++)
        {
            if (engineStorage.openCreate[i].table.toLowerCase() == table.toLowerCase())
            {
                found = i;
                break;
            }
        }
        if (found === null)
            return null;

        var token = framework.Preferences['token'];

        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/SaveGameStorage',
                data: {
                    game: world.Id,
                    token: token,
                    table: engineStorage.openCreate[found].table,
                    headers: JSON.stringify(engineStorage.openCreate[found].headers),
                    values: JSON.stringify(engineStorage.openCreate[found].values)
                },
                success: (msg) =>
                {
                    engineStorage.lastRowId = TryParse(msg);
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    engineStorage.lastRowId = null;
                    env.RebuildStack();
                }
            });
            engineStorage.openCreate.splice(found, 1);
        });
        return null;
    }

    Verify_StoreData(line: number, column: number, values: any[]): void
    {
        if (typeof values[0] == "string")
        {
            if (!("" + values[0]).match(/^[a-z][a-z_0-9]+$/i))
                throw "The table name '" + values[2] + "' is not using a valid name at " + line + ":" + column;
            return;
        }
    }

    @ApiMethod([], "Returns the last rowId inserted.")
    GetLastRowId(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(engineStorage.lastRowId);
    }

    @ApiMethod([{ name: "tableName", description: "The table name." }], "Create a new read query and returns the id of the query.")
    QueryData(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = engineStorage.nextQueryId++;

        engineStorage.openQueries.push({ id: id, condition: "", orderBy: "rowId desc", executed: false, headers: [], rows: [], table: values[0].GetString(), currentRow: 0 });

        return new VariableValue(id);
    }

    Verify_QueryData(line: number, column: number, values: any[]): void
    {
        if (typeof values[0] == "string")
        {
            if (!("" + values[0]).match(/^[a-z][a-z_0-9]+$/i))
                throw "The table name '" + values[2] + "' is not using a valid name at " + line + ":" + column;
            return;
        }
    }

    /*@ApiMethod([{ name: "queryId", description: "The ID of the query." }, { name: "columnName", description: "The name of the column wished to be returned." }], "Add a column to the query to be returned.")
    QueryAddColumn(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();

        for (var i = 0; i < engineStorage.openQueries.length; i++)
        {
            if (engineStorage.openQueries[i].id == id)
            {
                engineStorage.openQueries[i].headers.push(values[1].GetString());
                return null;
            }
        }

        return null;
    }*/

    @ApiMethod([{ name: "queryId", description: "The ID of the query." }, { name: "condition", description: "SQL Like condition." }
        , { name: "parameters", description: "(...) Parameters" }], "Allows to add one ore more SQL like conditions (E.g.: column = value). Use ? in the condition and optional parameters to avoid code injections.")
    Where(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var cond = values[1].GetString();
        for (var i = 2; i < values.length; i++)
            cond = cond.replace("?", "'" + EngineStorage.EscapeString(values[i].GetString()) + "'");

        var id = values[0].GetNumber();
        var found: number = null;
        for (var i = 0; i < engineStorage.openQueries.length; i++)
        {
            if (engineStorage.openQueries[i].id == id)
            {
                engineStorage.openQueries[i].condition = cond;
                return values[0];
            }
        }

        return null;
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

    /*OrderBy(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return null;
    }*/

    @ApiMethod([{ name: "queryId", description: "The ID of the query." }], "Execute a query.")
    ExecuteQuery(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var found: number = null;
        for (var i = 0; i < engineStorage.openQueries.length; i++)
        {
            if (engineStorage.openQueries[i].id == id)
            {
                found = i;
                break;
            }
        }

        if (found === null)
            return null;

        var token = framework.Preferences['token'];

        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/GetGameStorage',
                data: {
                    game: world.Id,
                    token: token,
                    table: engineStorage.openQueries[found].table,
                    headers: JSON.stringify(engineStorage.openQueries[found].headers),
                    condition: engineStorage.openQueries[found].condition,
                    orderBy: engineStorage.openQueries[found].orderBy
                },
                success: (msg) =>
                {
                    var data = TryParse(msg);
                    engineStorage.openQueries[found].executed = true;
                    engineStorage.openQueries[found].headers = data.headers;
                    engineStorage.openQueries[found].rows = data.rows;
                    engineStorage.openQueries[found].currentRow = -1;

                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    engineStorage.openQueries[found].executed = true;
                    engineStorage.openQueries[found].rows = null;
                    engineStorage.openQueries[found].error = msg;

                    env.RebuildStack();
                }
            });
        });

        return null;
    }

    @ApiMethod([{ name: "queryId", description: "The ID of the query." }], "Returns the number of rows returned.")
    GetNbRows(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        for (var i = 0; i < engineStorage.openQueries.length; i++)
            if (engineStorage.openQueries[i].id == id)
                return new VariableValue(engineStorage.openQueries[i].rows.length);
        return new VariableValue(0);
    }

    @ApiMethod([{ name: "queryId", description: "The ID of the query." }], "Moves to the next (or first) row of the query and returns true if there is more data to be queried.")
    NextRow(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        for (var i = 0; i < engineStorage.openQueries.length; i++)
        {
            if (engineStorage.openQueries[i].id == id) 
            {
                if (!engineStorage.openQueries[i].rows)
                    return new VariableValue(false);
                engineStorage.openQueries[i].currentRow++;
                return new VariableValue(engineStorage.openQueries[i].currentRow < engineStorage.openQueries[i].rows.length);
            }
        }

        return new VariableValue(false);
    }

    @ApiMethod([{ name: "queryId", description: "The ID of the query." }, { name: "columnName", description: "The name of the column to read." }], "Returns the value of the column (identified either by the position or the name).")
    GetValue(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        for (var i = 0; i < engineStorage.openQueries.length; i++)
        {
            if (engineStorage.openQueries[i].id == id) 
            {
                var colNb: number = null;
                if (values[1].Type == ValueType.Number)
                    colNb = values[1].GetNumber();
                else
                {
                    var colName = values[1].GetString().toLowerCase();
                    for (var j = 0; j < engineStorage.openQueries[i].headers.length; j++)
                    {
                        if (engineStorage.openQueries[i].headers[j].toLowerCase() == colName)
                        {
                            colNb = j;
                            break;
                        }
                    }
                }

                if (colNb === null)
                    return new VariableValue(null);
                else
                {
                    var val = engineStorage.openQueries[i].rows[Math.max(0, engineStorage.openQueries[i].currentRow)][colNb];
                    return new VariableValue(val ? val : null);
                }
            }
        }

        return new VariableValue(null);
    }

    @ApiMethod([{ name: "queryId", description: "The ID of the query." }], "Close the query and free up the resources.")
    CloseQuery(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        for (var i = 0; i < engineStorage.openQueries.length; i++)
        {
            if (engineStorage.openQueries[i].id == id) 
            {
                engineStorage.openQueries.splice(i, 1);
                return new VariableValue(null);
            }
        }
        return new VariableValue(null);
    }

    @ApiMethod([{ name: "table", description: "The name of the table to cleanup." }, { name: "nbToKeep", description: "The number of rows to keep." }], "Delete all the rows beside the nbToKeep last rows.")
    KeepOnlyLast(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var table = values[0].GetString();
        var nbToKeep = values[1].GetNumber();

        var token = framework.Preferences['token'];

        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/DeleteOlderStorage',
                data: {
                    game: world.Id,
                    token: token,
                    table: table,
                    keep: nbToKeep
                },
                success: (msg) =>
                {
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    env.RebuildStack();
                }
            });
        });

        return new VariableValue(null);
    }

    @ApiMethod([{ name: "table", description: "The name of the table to cleanup." }, { name: "rowId", description: "The rowId to delete." }], "Delete a rowId.")
    DeleteRow(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var table = values[0].GetString();
        var rowid = values[1].GetNumber();

        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/DeleteRowStorage',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    table: table,
                    row: rowid
                },
                success: (msg) =>
                {
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    env.RebuildStack();
                }
            });
        });

        return new VariableValue(null);
    }

    @ApiMethod([{ name: "table", description: "The name of the table to cleanup." }, { name: "column", description: "The column to modify." },
        { name: "value", description: "The column to set." }, { name: "condition", description: "Rows must match the condition to be modified." },
        { name: "parameters", description: "(...) Parameters" }], "Modify data within the database.")
    Update(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var cond = values[3].GetString();
        for (var i = 4; i < values.length; i++)
            cond = cond.replace("?", "'" + EngineStorage.EscapeString(values[i].GetString()) + "'");

        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/UpdateStorage',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    table: values[0].GetString(),
                    column: values[1].GetString(),
                    value: values[2].GetString(),
                    condition: cond
                },
                success: (msg) =>
                {
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });

        return new VariableValue(null);
    }

    @ApiMethod([{ name: "table", description: "The name of the table to cleanup." },
        { name: "condition", description: "Rows must match the condition to be deleted." },
        { name: "parameters", description: "(...) Parameters" }], "Delete data within the database.")
    Delete(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var cond = values[1].GetString();
        for (var i = 2; i < values.length; i++)
            cond = cond.replace("?", "'" + EngineStorage.EscapeString(values[i].GetString()) + "'");

        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/DeleteStorage',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    table: values[0].GetString(),
                    condition: cond
                },
                success: (msg) =>
                {
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });

        return new VariableValue(null);
    }

    @ApiMethod([{ name: "table", description: "The name of the table to cleanup." }], "Drop completely a table of the database.")
    Drop(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/DropTable',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    table: values[0].GetString()
                },
                success: (msg) =>
                {
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });

        return new VariableValue(null);
    }

    @ApiMethod([], "Retrieve the list of all the tables stored by this game.")
    RetrieveTableList(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/ListStorage',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token']
                },
                success: (msg) =>
                {
                    engineStorage.tableList = TryParse(msg);
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });

        return new VariableValue(null);
    }

    @ApiMethod([], "Number of tables retrieved with RetrieveTableList.")
    NBTables(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(engineStorage.tableList.length);
    }

    @ApiMethod([{ name: "position", description: "Position in the list." }], "Get the name of the table at the position.")
    GetTableName(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(engineStorage.tableList[values[0].GetNumber()].name);
    }

    @ApiMethod([{ name: "table", description: "Name of the table to check." }], "Retrieve the list of all the columns of a given table stored by this game.")
    RetrieveColumnList(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/ListColumnsStorage',
                data: {
                    game: world.Id,
                    table: values[0].GetString(),
                    token: framework.Preferences['token']
                },
                success: (msg) =>
                {
                    engineStorage.columnList = TryParse(msg);
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });

        return new VariableValue(null);
    }

    @ApiMethod([], "Number of columns retrieved with RetrieveColumnList.")
    NBColumns(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(engineStorage.columnList.length);
    }

    @ApiMethod([{ name: "position", description: "Position in the list." }], "Get the name of the column at the position.")
    GetColumnName(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(engineStorage.columnList[values[0].GetNumber()].name);
    }

    @ApiMethod([{ name: "table", description: "Name of the table to check." }], "Returns true if the table exists. Don't use directly the function, store the value within a variable and then use the value.")
    @ApiWrapper("function Storage_TableExists(table) { Storage._TableExists(table); return stackResult; }")
    TableExists(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        env.StoreStack(() =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/StorageTableExists',
                data: {
                    game: world.Id,
                    table: values[0].GetString(),
                    token: framework.Preferences['token']
                },
                success: (msg) =>
                {
                    stackResult = new VariableValue(JSON.parse(msg));
                    env.RebuildStack();
                },
                error: function (msg, textStatus)
                {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });

        return new VariableValue(null);
    }
}