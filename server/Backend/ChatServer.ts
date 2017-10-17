var sockets = [];

function findSockets(game_id: number, user_id: number): any[]
{
    var result = [];
    for (var i = 0; i < sockets.length; i++)
        if (sockets[i].game_id == game_id && sockets[i].user_id == user_id)
            result.push(sockets[i]);
    return result;
}

function ChatSendTo(gameId: number, username: string, message: string, data: any): boolean
{
    for (var i = 0; i < sockets.length; i++)
    {
        if (sockets[i].game_id == gameId && sockets[i].username == username)
        {
            var calls = [message];
            if (data && data.lenegth)
                calls.concat(data);
            else if (data)
                calls.push(data);
            sockets[i].emit.apply(sockets[i], calls);
            return true;
        }
    }
    return false;
}

io.on('connection', function (socket)
{
    socket.serverId = sockets.length;
    sockets.push(socket);
    socket.channels = [];

    socket.on('disconnect', function ()
    {
        if (!socket.username)
            return;
        io.to("" + socket.game_id + "@#global").emit('remove', socket.username);
        for (var i = 0; i < socket.channels.length; i++)
            io.to(socket.channels[i]).emit('leave', socket.username, socket.channels[i].split('@')[1]);
        //io.to("" + socket.game_id + "@" + socket.channels[i]).emit('leave', socket.username, socket.channels[i]);

        var id = <number>socket.serverId;
        // Remove this socket from the known list
        for (var i = id + 1; i < sockets.length; i++)
            sockets[i].serverId--;
        sockets.splice(id, 1);
    });

    socket.on('join', function (game_id: number, token_id: string, channel: string)
    {
        if (!token_id)
            return;

        var tokenInfo = currentTokens[token_id];
        if (!tokenInfo)
            return;

        if (channel != "#global" && !("" + channel).match(/^[a-z _01-9\(\)\-]+$/i))
            return;

        socket.channels.push(game_id + "@" + channel);

        //console.log('Set name: ' + name + ' / ' + game_id);
        socket.game_id = game_id;
        socket.username = tokenInfo.user;
        socket.user_id = tokenInfo.id;
        socket.join("" + game_id + "@" + channel);
        io.to("" + socket.game_id + "@" + channel).emit('join', socket.username, channel);
    });

    socket.on('leave', function (game_id: number, token_id: string, channel: string)
    {
        if (!token_id)
            return;

        var tokenInfo = currentTokens[token_id];
        if (!tokenInfo)
            return;

        if (!("" + channel).match(/^[a-z _01-9\(\)\-]+$/i))
            return;

        for (var i = 0; i < socket.channels.length; i++)
        {
            if (socket.channels[i] == game_id + "@" + channel)
            {
                socket.channels.splice(i, 1);
                break;
            }
        }

        //console.log('Set name: ' + name + ' / ' + game_id);
        socket.game_id = game_id;
        socket.username = tokenInfo.user;
        socket.user_id = tokenInfo.id;
        io.to("" + socket.game_id + "@" + channel).emit('leave', socket.username, channel);
        socket.leave("" + game_id + "@" + channel);
    });

    socket.on('bot', function (botName: string, channel: string, message: string)
    {
        if (!socket.username)
            return;
        if (socket.channels.indexOf(socket.game_id + "@" + channel) == -1)
            return;
        /*if (!channel || channel.length < 3 || channel.charAt(0) != '#')
            return;*/
        if (socket.game_id == null || socket.game_id == undefined)
            return;
        io.to("" + socket.game_id + "@" + channel).emit('chatBot', botName, socket.username, channel, message);
    });

    socket.on('getChannelUserList', function (game_id: number, channel: string)
    {
        var users: string[] = [];
        for (var j = 0; j < sockets.length; j++)
        {
            for (var i = 0; i < sockets[j].channels.length; i++)
            {
                if (sockets[j].channels[i] == game_id + "@" + channel)
                {
                    users.push(sockets[j].username);
                    break;
                }
            }
        }
        socket.emit('channelUserList', channel, users);
    });

    socket.on('send', function (channel: string, message: string)
    {
        if (!socket.username)
            return;
        if (socket.channels.indexOf(socket.game_id + "@" + channel) == -1)
            return;
        /*if (!channel || channel.length < 3 || channel.charAt(0) != '#')
            return;*/
        if (socket.game_id == null || socket.game_id == undefined)
            return;
        //console.log("Send message on " + channel + ": " + message);
        io.to("" + socket.game_id + "@" + channel).emit('chat', socket.username, channel, message);
    });

    socket.on('position', function (zone: string, x: number, y: number, look: string, emote: number, emoteTimer: number, direction: number)
    {
        if (!socket.username)
            return;
        if (!socket.last_update)
        {
            socket.last_update = new Date();
        }
        else
        {
            var now = new Date();
            if ((now.getTime() - socket.last_update.getTime()) / 1000 > 10000)
                UpdatePosition(socket.user_id, socket.game_id, x, y, zone);
        }
        io.to("" + socket.game_id + "@#global").emit('position', zone, x, y, socket.username, look, emote, emoteTimer, direction);
    });
});
