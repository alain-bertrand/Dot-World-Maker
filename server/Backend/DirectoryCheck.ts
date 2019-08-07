function DirectoryCheck(gameId: number): number
{
    var dir = __dirname + '/public/user_art/' + GameDir(gameId);

    if (!fs.existsSync(dir))
        return 0;

    var files = fs.readdirSync(dir);
    var tot = 0;
    for (var i = 0; i < files.length; i++)
    {
        var stat = fs.statSync(dir + "/" + files[i]);
        tot += stat.size;
    }

    return tot;
}

async function OwnerMaxSize(userId: number, gameId: number): Promise<number>
{
    var connection = getConnection();
    if (!connection || gameId == -1)
        return 0;

    try
    {
        await connection.connect();
    }
    catch (ex)
    {
        connection.end();
        return 0;
    }

    try
    {
        var r1 = await connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [gameId, userId, userId]);
    }
    catch (ex)
    {
        console.log(ex);
        connection.end();
        return 0;
    }

    if (!r1 || !r1.length)
    {
        connection.end();
        console.log('No access right');
        return 0;
    }

    try
    {
        var r2 = await connection.query('select editor_version, rented_space, rented_space_till from users where id = (select main_owner from games where id = ?)', [gameId])

        connection.end();
        if (!r2 || r2.length == 0)
            return 0;

        var size = r2[0].editor_version == 's' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (r2[0].rented_space_till)
        {
            var tillWhen = new Date(r2[0].rented_space_till);
            if (tillWhen.getTime() > new Date().getTime())
                size = r2[0].rented_space * 1024 * 1024;
        }
        return size;
    }
    catch (ex)
    {
        console.log(ex);
        connection.end();
        return 0;
    }
}

async function CanStoreSize(userId: number, gameId: number, sizeToPlace: number)
{
    var maxSize = await OwnerMaxSize(userId, gameId);
    if (DirectoryCheck(gameId) + sizeToPlace < maxSize)
        return true;
    return false;
}