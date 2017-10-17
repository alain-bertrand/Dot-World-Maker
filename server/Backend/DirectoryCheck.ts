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

function OwnerMaxSize(userId: number, gameId: number, callbackSize: (maxSize) => void): number
{
    var connection = getConnection();
    if (!connection || gameId == -1)
    {
        callbackSize(0);
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            callbackSize(0);
        }

        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [gameId, userId, userId], function (err1, r1)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                callbackSize(0);
            }
            if (!r1 || !r1.length)
            {
                connection.end();
                console.log('No access right');
                callbackSize(0);
                return;
            }

            connection.query('select editor_version, rented_space, rented_space_till from users where id = (select main_owner from games where id = ?)', [gameId], function (err2, r2)
            {
                if (err2 != null)
                {
                    console.log(err2);
                    callbackSize(0);
                    return;
                }

                connection.end();
                if (!r2 || r2.length == 0)
                    callbackSize(0);
                else
                {
                    var size = r2[0].editor_version == 's' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
                    if (r2[0].rented_space_till)
                    {
                        var tillWhen = new Date(r2[0].rented_space_till);
                        if (tillWhen.getTime() > new Date().getTime())
                            size = r2[0].rented_space * 1024 * 1024;
                    }
                    callbackSize(size);
                }
            });
        });
    });
}

function CanStoreSize(userId: number, gameId: number, sizeToPlace: number, checkResult: (result: boolean) => void)
{
    OwnerMaxSize(userId, gameId, (maxSize: number) =>
    {
        if (DirectoryCheck(gameId) + sizeToPlace < maxSize)
        {
            checkResult(true);
        }
        else
        {
            checkResult(false);
        }
    });
}