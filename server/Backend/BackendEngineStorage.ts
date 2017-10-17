app.post('/backend/SaveGameStorage', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    if (!req.body.headers)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'headers' is missing." }));
        res.end();
        return;
    }

    if (!req.body.values)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'values' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            // First time writing data to this storage
            if (result.length == 0)
                CreateEngineStorage(res, connection, req.body.game, req.body.table, JSON.parse(req.body.headers), JSON.parse(req.body.values));
            else
                CheckInsertRowEngineStorage(res, connection, result[0].id, JSON.parse(req.body.headers), JSON.parse(req.body.values));
        });
    });
});

function CreateEngineStorage(res, connection, gameId: number, table: string, headers: string[], values: string[])
{
    connection.query('insert into storage_table(game_id, table_name) values(?, ?)', [gameId, table], function (err1, result)
    {
        if (err1 != null)
        {
            connection.end();
            console.log(err1);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        CheckInsertRowEngineStorage(res, connection, result.insertId, headers, values);
    });
}

interface StorageColumn
{
    id: number;
    name: string;
    value?: string;
}

function CheckInsertRowEngineStorage(res, connection, tableId: number, headers: string[], values: string[])
{
    connection.query('select id, column_name from storage_table_column where table_id = ?', [tableId], function (err1, result)
    {
        if (err1 != null)
        {
            connection.end();
            console.log(err1);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        var missingNames = headers.slice();
        var missingValues = values.slice();
        var names: StorageColumn[] = [];
        var todo = [];

        for (var i = 0; i < result.length; i++)
        {
            var n = result[i].column_name.toLowerCase();
            for (var j = 0; j < headers.length; j++)
            {
                if (missingNames[j].toLowerCase() == n)
                {
                    names.push({
                        name: missingNames[j],
                        id: result[i].id,
                        value: missingValues[j]
                    });
                    missingNames.splice(j, 1);
                    missingValues.splice(j, 1);
                    break;
                }
            }
        }

        for (var i = 0; i < missingNames.length; i++)
            names.push({
                name: missingNames[i],
                id: -1,
                value: missingValues[i]
            });

        if (missingNames.length == 0)
            InsertRowEngineStorage(res, connection, tableId, names);
        else
        {
            var sql = 'insert into storage_table_column(table_id, column_name) values';
            var sqlValues = [];
            for (var i = 0; i < missingNames.length; i++)
            {
                if (i != 0)
                    sql += ", ";
                sql += "(?,?)";
                sqlValues.push(tableId, missingNames[i]);
            }
            //console.log(sql);

            connection.query(sql, sqlValues, function (err2, res2)
            {
                if (err2 != null)
                {
                    connection.end();
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }

                for (var i = 0; i < missingNames.length; i++)
                {
                    for (var j = 0; j < names.length; j++)
                    {
                        if (names[j].name == missingNames[i])
                        {
                            names[j].id = res2.insertId + i;
                            break;
                        }
                    }
                }

                InsertRowEngineStorage(res, connection, tableId, names);
            });
        }
    });
}

function InsertRowEngineStorage(res, connection, tableId: number, headers: StorageColumn[])
{
    connection.query('insert into storage_entry(table_id) values(?)', [tableId], function (err1, result)
    {
        if (err1 != null)
        {
            connection.end();
            console.log(err1);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        var rowId = result.insertId;
        var sqlValues = [];

        var sql = 'insert into storage_value(row_id, column_id, value) value';
        for (var i = 0; i < headers.length; i++)
        {
            if (i != 0)
                sql += ", ";
            sql += "(?,?,?)";
            sqlValues.push(rowId);
            sqlValues.push(headers[i].id);
            sqlValues.push(headers[i].value);
        }

        connection.query(sql, sqlValues, function (err2, res2)
        {
            if (err2 != null)
            {
                connection.end();
                console.log(err2);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(rowId));
            res.end();
        });
    });
}

app.post('/backend/GetGameStorage', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    if (!req.body.headers)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'headers' is missing." }));
        res.end();
        return;
    }

    if (!req.body.condition)
        req.body.condition = "";

    if (!req.body.orderBy)
        req.body.orderBy = "";

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (result.length == 0)
            {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ headers: [], rows: [] }));
                res.end();
                return;
            }
            else
            {
                SelectColumnEngineStorage(res, connection, (0 + result[0].id), JSON.parse(req.body.headers), req.body.condition, req.body.orderBy, (cols: string[], rows: string[][], storageColumns: StorageColumn[]) =>
                {
                    connection.end();
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ headers: cols, rows: rows }));
                    res.end();
                });
                return;
            }
        });
    });
});

function SelectColumnEngineStorage(res, connection, tableId: number, headers: string[], condition: string, orderBy: string, callBack: (cols: string[], rows: string[][], storageColumns: StorageColumn[]) => void)
{
    var names: StorageColumn[] = [];
    if (!headers || headers.length == 0)
    {
        connection.query('select id, column_name from storage_table_column where table_id = ?', [tableId], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }

            names.push({ id: 0, name: "rowId" });

            for (var i = 0; i < result.length; i++)
                names.push({ id: result[i].id, name: result[i].column_name });

            SelectEngineStorage(res, connection, tableId, names, condition, orderBy, callBack);
        });
    }
    else
    {
        for (var i = 0; i < headers.length; i++)
        {
            if (!headers[i].match(/^[a-z][a-z_0-9]*$/i))
            {
                connection.end();
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "Column '" + headers[i] + "' is not a valid column name." }));
                res.end();
                return;
            }
        }
        var columnsNames = "('" + headers.join("','") + "')";

        connection.query('select id, column_name from storage_table_column where table_id = ? and column_name in ' + columnsNames, [tableId], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }

            for (var j = 0; j < headers.length; j++)
            {
                var found = false;
                for (var i = 0; i < result.length; i++)
                {
                    if (headers[j].toLowerCase() == result[i].column_name.toLowerCase())
                    {
                        names.push({ id: result[i].id, name: result[i].column_name });
                        found = true;
                        break;
                    }
                }
                if (!found)
                    names.push({ id: -1, name: headers[j] });
            }

            SelectEngineStorage(res, connection, tableId, names, condition, orderBy, callBack);
        });
    }
}

function SelectEngineStorage(res, connection, tableId: number, columns: StorageColumn[], condition: string, orderBy: string, callBack: (cols: string[], rows: string[][], storageColumns: StorageColumn[]) => void)
{
    var select = "";
    var join = "";
    var cols: string[] = [];
    for (var i = 0; i < columns.length; i++)
    {
        cols.push(columns[i].name);
        if (columns[i].id > 0)
        {
            select += ", col_" + i + ".value as c" + i;
            join += " left join storage_value as col_" + i + " on storage_entry.id = col_" + i + ".row_id and col_" + i + ".column_id = " + (columns[i].id + 0);
        }
    }

    var sql = 'select * from (select storage_entry.id' + select + ' from storage_entry ' + join + ' where table_id = ?) as s1';
    if (condition && condition != "")
    {
        var cond = QueryParser.BuildSQL(condition, columns);
        if (cond != "" && cond != " ")
            sql += " where " + cond + "";
    }

    if (orderBy)
    {
        if (orderBy == "rowId desc")
            sql += " order by id desc";
        if (orderBy == "rowId")
            sql += " order by id";
    }
    sql += " limit 30";

    //console.log(sql);

    connection.query(sql, [tableId], function (err1, result)
    {
        if (err1 != null)
        {
            console.log(err1);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        var rows: string[][] = [];
        for (var i = 0; i < result.length; i++)
        {
            var row: string[] = [];
            for (var j = 0; j < columns.length; j++)
            {
                if (columns[j].id == 0)
                    row.push(result[i].id);
                else if (columns[j].id > 0)
                    row.push(result[i]["c" + j]);
                else
                    row.push(null);
            }
            rows.push(row);
        }

        callBack(cols, rows, columns);
    });
}

app.post('/backend/DeleteOlderStorage', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    if (!req.body.keep)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'keep' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }

            var tableId = result[0].id;

            connection.query('select id from storage_entry where table_id = ? order by id desc limit 0, ?', [tableId, parseInt(req.body.keep)], function (err2, res2)
            {
                if (err2 != null)
                {
                    connection.end();
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }

                var ids: number[] = [];
                for (var i = 0; i < res2.length; i++)
                    ids.push(res2[i].id);
                if (ids.length == 0)
                {
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(true));
                    res.end();
                    return;
                }

                connection.query('delete from storage_entry where id not in (' + ids.join(",") + ') and table_id = ?', [tableId], function (err3, res3)
                {
                    if (err3 != null)
                    {
                        connection.end();
                        console.log(err3);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }

                    connection.query('delete from storage_value where row_id not in (select id from storage_entry)', [], function (err4, res4)
                    {
                        connection.end();
                        if (err4 != null)
                        {
                            console.log(err4);
                            res.writeHead(500, { 'Content-Type': 'text/json' });
                            res.write(JSON.stringify({ error: "error with database." }));
                            res.end();
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify(true));
                        res.end();
                    });
                });
            });
        });
    });
});

app.post('/backend/DeleteRowStorage', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    if (!req.body.row)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'row' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }

            var tableId = result[0].id;


            connection.query('delete from storage_entry where id = ? and table_id = ?', [req.body.row, tableId], function (err3, res3)
            {
                if (err3 != null)
                {
                    connection.end();
                    console.log(err3);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }

                connection.query('delete from storage_value where row_id not in (select id from storage_entry)', [], function (err4, res4)
                {
                    connection.end();
                    if (err4 != null)
                    {
                        console.log(err4);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(true));
                    res.end();
                });
            });
        });
    });
});

app.post('/backend/UpdateStorage', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    if (!req.body.column)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'column' is missing." }));
        res.end();
        return;
    }

    if (!req.body.value)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'value' is missing." }));
        res.end();
        return;
    }

    if (!req.body.condition)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'value' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (result.length == 0)
            {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(0));
                res.end();
                return;
            }
            else
            {
                SelectColumnEngineStorage(res, connection, (0 + result[0].id), null, req.body.condition, null, (cols: string[], rows: string[][], storageColumns: StorageColumn[]) =>
                {
                    if (rows.length == 0)
                    {
                        connection.end();
                        res.writeHead(200, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify(0));
                        res.end();
                        return;
                    }

                    var ids = [];
                    for (var i = 0; i < rows.length; i++)
                        ids.push(rows[i][0]);
                    var c = -1;
                    for (var i = 0; i < storageColumns.length; i++)
                    {
                        if (storageColumns[i].name.toLowerCase() == req.body.column.toLowerCase())
                        {
                            c = storageColumns[i].id;
                            break;
                        }
                    }

                    if (c == -1)
                    {
                        connection.end();
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "column '" + req.body.column + "' unknown." }));
                        res.end();
                        return;
                    }

                    var sql = "update storage_value set value = ? where row_id in (" + ids.join(",") + ") and column_id = " + c;
                    //console.log(sql);
                    connection.query(sql, [req.body.value], function (err2, result2)
                    {
                        connection.end();
                        if (err2 != null)
                        {
                            console.log(err2);
                            res.writeHead(500, { 'Content-Type': 'text/json' });
                            res.write(JSON.stringify({ error: "error with database." }));
                            res.end();
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify(result2.changedRows));
                        res.end();
                        return;
                    });
                });
                return;
            }
        });
    });
});

app.post('/backend/DeleteStorage', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    if (!req.body.condition)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'value' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (result.length == 0)
            {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(0));
                res.end();
                return;
            }
            else
            {
                SelectColumnEngineStorage(res, connection, (0 + result[0].id), null, req.body.condition, null, (cols: string[], rows: string[][], storageColumns: StorageColumn[]) =>
                {
                    if (rows.length == 0)
                    {
                        connection.end();
                        res.writeHead(200, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify(0));
                        res.end();
                        return;
                    }

                    var ids = [];
                    for (var i = 0; i < rows.length; i++)
                        ids.push(rows[i][0]);

                    var sql = "delete from storage_value where row_id in (" + ids.join(",") + ")";
                    console.log(sql);
                    connection.query(sql, [req.body.value], function (err2, result2)
                    {
                        if (err2 != null)
                        {
                            connection.end();
                            console.log(err2);
                            res.writeHead(500, { 'Content-Type': 'text/json' });
                            res.write(JSON.stringify({ error: "error with database." }));
                            res.end();
                            return;
                        }

                        var sql = "delete from storage_entry where id in (" + ids.join(",") + ")";
                        //console.log(sql);
                        connection.query(sql, [req.body.value], function (err3, result3)
                        {
                            connection.end();
                            if (err3 != null)
                            {
                                console.log(err3);
                                res.writeHead(500, { 'Content-Type': 'text/json' });
                                res.write(JSON.stringify({ error: "error with database." }));
                                res.end();
                                return;
                            }

                            res.writeHead(200, { 'Content-Type': 'text/json' });
                            res.write(JSON.stringify(result3.changedRows));
                            res.end();
                            return;
                        });
                    });
                });
                return;
            }
        });
    });
});

app.post('/backend/DropTable', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        var sql = "delete from storage_value where column_id in (select id from storage_table_column where table_id in (select id from storage_table where game_id = ? and table_name = ?))";
        connection.query(sql, [req.body.game, req.body.table], function (err1, result)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            var sql = "delete from storage_entry where table_id in (select id from storage_table where game_id = ? and table_name = ?)";
            connection.query(sql, [req.body.game, req.body.table], function (err2, result2)
            {
                if (err2 != null)
                {
                    connection.end();
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }
                var sql = "delete from storage_table_column where table_id in (select id from storage_table where game_id = ? and table_name = ?)";
                connection.query(sql, [req.body.game, req.body.table], function (err3, result3)
                {
                    if (err3 != null)
                    {
                        connection.end();
                        console.log(err3);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }
                    var sql = "delete from storage_table where game_id = ? and table_name = ?";
                    connection.query(sql, [req.body.game, req.body.table], function (err4, result4)
                    {
                        connection.end();
                        if (err4 != null)
                        {
                            console.log(err4);
                            res.writeHead(500, { 'Content-Type': 'text/json' });
                            res.write(JSON.stringify({ error: "error with database." }));
                            res.end();
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify(true));
                        res.end();
                        return;
                    });
                });
            });
        });
    });
});

app.post('/backend/ListStorage', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        connection.query('select id,table_name from storage_table where game_id = ? order by table_name', [req.body.game], function (err1, result)
        {
            connection.end();
            if (err1 != null)
            {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }

            var list = [];
            for (var i = 0; i < result.length; i++)
                list.push({ id: result[i].id, name: result[i].table_name });

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(list));
            res.end();
        });
    });
});

app.post('/backend/ListColumnsStorage', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        connection.query('select id, column_name from storage_table_column where table_id in (select id from storage_table where game_id = ? and table_name = ?) order by column_name', [req.body.game, req.body.table], function (err1, result)
        {
            connection.end();
            if (err1 != null)
            {
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }

            var list = [];
            for (var i = 0; i < result.length; i++)
                list.push({ id: result[i].id, name: result[i].column_name });

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify(list));
            res.end();
        });
    });
});

app.post('/backend/StorageTableExists', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.table)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'table' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }

        connection.query('select id from storage_table where game_id = ? and table_name = ?', [req.body.game, req.body.table], function (err1, result)
        {
            connection.end();
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (result.length == 0)
            {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(false));
                res.end();
            }
            else
            {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify(true));
                res.end();
            }
        });
    });
});
