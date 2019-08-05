///<reference path="../../Logic/MovingActors/PathSolver.ts" />

var play = new (class
{
    public renderer: WorldRender;
    public keys: boolean[] = [];
    public looper: number;
    public path: PathPoint[] = null;
    public lastMouseX: number;
    public lastMouseY: number;
    public mouseDown: boolean = false;
    public selectedActor: number = null;
    public fps: any = null;
    public firstClick: boolean = false;
    public nbLoopsMouseDown: number = 0;
    public inField: boolean = false;
    public lastAction: MapAction = null;
    public afterTeleport: boolean = false;
    public lastZone: string = null;
    public devTools: boolean = false;
    public lastRun: Date = null;
    public loopTimeRemains: number = 0;
    public isFullScreen: boolean = false;
    public lastObjectHover: string;
    public keyHook: KeyHooks;
    public currentFragment: string = "";
    public loopCycle: number = 0;
    public onPaint: CodeEnvironement[] = [];
    public showMinimap: boolean = false;
    public onDialogPaint: string[] = [];
});

interface KeyHooks
{
    [s: string]: string;
}

class Play
{
    public static Dispose()
    {
        if (play.renderer)
            play.renderer.Dispose();
        play.renderer = null;
        play.onDialogPaint = [];

        if (play.looper !== null && play.looper !== undefined)
        {
            if (window['mozRequestAnimationFrame'])
                window['mozCancelAnimationFrame'](play.looper);
            else if (window['requestAnimationFrame'])
                cancelAnimationFrame(play.looper);
            else
                clearTimeout(play.looper);
            play.looper = null;
        }

        if (world.ShowFPS)
            play.fps.hide();

        play.lastAction = null;
        play.path = null;

        $(window).unbind("keydown", Play.KeyDown);
        $(window).unbind("keyup", Play.KeyUp);

        $("#gameCanvas").unbind("mousedown", Play.MouseDown);
        $("#gameCanvas").unbind("mousemove", Play.MouseMove);
        $("#gameCanvas").unbind("mouseup", Play.MouseUp);

        $("#gameCanvas").unbind('touchstart', Play.TouchStart);
        $("#gameCanvas").unbind('touchend', Play.TouchEnd);
        $("#gameCanvas").unbind('touchmove', Play.TouchMove);

        Sounds.ClearSound();
    }

    public static Recover()
    {
        if (play.renderer || !world)
            return;
        play.onDialogPaint = [];
        play.currentFragment = "";
        play.keyHook = {};
        play.loopCycle = 0;
        play.showMinimap = false;

        if (("" + document.location).indexOf("maker.html") == -1 || world.PublicView === true || framework.Preferences['LastNonPublicWarning'] == Main.FormatDate(new Date()) || selfHosted)
            $("#releaseGameMessage").hide();
        else
        {
            framework.Preferences['LastNonPublicWarning'] = Main.FormatDate(new Date());
            Framework.SavePreferences();

            setTimeout(() =>
            {
                $("#releaseGameMessage").hide();
            }, 30000);
        }


        if (!world)
            return;
        if (!$("#menubar").first())
            $("#gameMapContainer").first().style.top = "0px";

        Sounds.Init();

        play.renderer = new WorldRender(world);
        play.inField = false;
        play.keys = [];
        play.onPaint = [];
        world.ResetAreas();
        world.Player.InDialog = false;
        world.Player.ResetVariables();

        for (var i = 0; i < world.Codes.length; i++)
        {
            if (world.Codes[i].Enabled === false)
                continue;
            try
            {
                if (!world.Codes[i].code)
                    world.Codes[i].code = CodeParser.ParseWithParameters(world.Codes[i].Source, world.Codes[i].Parameters);
                if (world.Codes[i].code && world.Codes[i].code.HasFunction("AutoRun"))
                    world.Codes[i].code.ExecuteFunction("AutoRun", []);
                if (world.Codes[i].code && world.Codes[i].code.HasFunction("OnPaint"))
                    play.onPaint.push(world.Codes[i].code);
            }
            catch (ex)
            {
                Main.AddErrorMessage("Error in extension '" + world.Codes[i].Name + "': "+ ex);
            }
        }

        if (play.onPaint && play.onPaint.length > 0)
        {
            play.renderer.OnRender = (ctx: CanvasRenderingContext2D) =>
            {
                // Run all the "OnPaint" functions defined
                engineGraphics.currentContext = ctx;
                //engineGraphics.currentCanvas = null;
                for (var i = 0; i < play.onPaint.length; i++)
                    play.onPaint[i].ExecuteFunction("OnPaint", []);
            }
        }

        $(window).bind("keydown", Play.KeyDown);
        $(window).bind("keyup", Play.KeyUp);

        $("#gameCanvas").bind("mousedown", Play.MouseDown);
        $("#gameCanvas").bind("touchstart", Play.TouchStart);

        if (world.ShowFPS)
        {
            if (play.fps)
                play.fps.show();
            else
                play.fps = new window['FPSMeter']({
                    top: (("" + document.location).indexOf("/maker.html") == -1 ? "5px" : "32px"), graph: 1, history: 40
                });
        }

        world.VisibleCenter(world.Player.AX, world.Player.AY, world.Player.Zone);
        play.mouseDown = false;
        play.firstClick = false;
        if ($("#loginBackground").is(":visible"))
        {
            play.inField = true;
            world.Player.InDialog = true;
        }

        var pos = InventoryMenu.Init(74);
        pos = ProfileMenu.Init(pos);
        pos = JournalMenu.Init(pos);
        pos = MessageMenu.Init(pos);

        Play.GameLoop();
        play.lastZone = null;

        play.lastRun = null;
        play.loopTimeRemains = 0;
    }

    // Switches to full screen mode on the first touch
    private static FullScreen()
    {
        try
        {
            var doc: any = window.document;
            var docEl: any = doc.documentElement;

            var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
            var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

            if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement)
            {
                requestFullScreen.call(docEl);
                play.isFullScreen = true;
            }
            else
            {
                cancelFullScreen.call(doc);
            }
        }
        catch (ex)
        {
            play.isFullScreen = true;
        }
    }

    public static MouseDown(evt: MouseEvent, isTouch = false)
    {
        if (SkillBar.HandleClick(evt.pageX, evt.pageY))
            return;

        play.mouseDown = true;
        play.firstClick = true;
        play.nbLoopsMouseDown = 0;

        if (!isTouch)
        {
            $("#gameCanvas").bind("mousemove", Play.MouseMove);
            $("#gameCanvas").bind("mouseup", Play.MouseUp);
        }

        play.lastMouseX = evt.pageX;
        play.lastMouseY = evt.pageY;
    }

    public static MouseMove(evt: MouseEvent)
    {
        play.lastMouseX = evt.pageX;
        play.lastMouseY = evt.pageY;
    }

    public static HandleMouseDown()
    {
        if (!play.mouseDown)
            return;

        var tileWidth = world.art.background.width;
        var tileHeight = world.art.background.height;

        var coord = play.renderer.ScreenToMap(play.lastMouseX, play.lastMouseY);

        var x = coord.TileX * tileWidth + coord.OffsetX;
        var y = coord.TileY * tileHeight + coord.OffsetY;
        var area = world.GetArea(coord.AreaX, coord.AreaY, world.Player.Zone);

        if (play.firstClick)
        {
            var actors = area.ActorAt(x, y, true);
            if (actors && actors.length > 0)
            {
                for (var i = actors.length - 1; i >= 0; i--)
                    if (actors[i].PlayerMouseInteract(area.X, area.Y))
                        return;
            }

            var objects = area.HitObjects(x, y);
            if (objects && objects.length > 0)
            {
                for (var i = objects.length - 1; i >= 0; i--)
                {
                    if (objects[i].PlayerMouseInteract(area.X, area.Y))
                    {
                        play.mouseDown = false;
                        $("#gameCanvas").unbind("mousemove", Play.MouseMove);
                        $("#gameCanvas").unbind("mouseup", Play.MouseUp);
                        play.firstClick = false;
                        return;
                    }
                }
            }
        }

        play.nbLoopsMouseDown++;

        var actors = area.ActorAt(x, y, false);
        if (actors.length > 0)
            play.selectedActor = actors[actors.length - 1].Id;
        else if (play.selectedActor)
            play.selectedActor = null;

        if (play.firstClick || play.nbLoopsMouseDown % 20 == 0)
        {
            play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth + coord.OffsetY, 20);
            if (!play.path)
            {
                play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth + world.art.background.height, 20);
                if (!play.path)
                    play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth + world.art.background.height * 2, 20);
                if (!play.path)
                    play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth - world.art.background.height, 20);
                if (!play.path)
                    play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth - world.art.background.height * 2, 20);
            }
        }

        if (!play.path)
        {
            var ax = play.lastMouseX - play.renderer.width / 2;
            var ay = play.lastMouseY - play.renderer.height / 2;

            var d = Math.round(EngineMath.CalculateAngle(ax, ay) * 7 / (Math.PI * 2));

            for (var i = 0; i < 4; i++)
                play.keys[i] = false;
            switch (d)
            {
                case 0:
                    play.keys[2] = true;
                    break;
                case 1:
                    play.keys[2] = true;
                    play.keys[3] = true;
                    break;
                case 2:
                    play.keys[3] = true;
                    break;
                case 3:
                    play.keys[3] = true;
                    play.keys[0] = true;
                    break;
                case 4:
                    play.keys[0] = true;
                    break;
                case 5:
                    play.keys[0] = true;
                    play.keys[1] = true;
                    break;
                case 6:
                    play.keys[1] = true;
                    break;
                case 7:
                    play.keys[1] = true;
                    play.keys[2] = true;
                    break;
                default:
                    break;
            }
        }
        play.firstClick = false;
    }

    public static MouseUp(evt: MouseEvent, isTouch = false)
    {
        for (var i = 0; i < 4; i++)
            play.keys[i] = false;

        play.mouseDown = false;
        if (play.nbLoopsMouseDown > 20)
            play.path = null;
        if (!isTouch)
        {
            $("#gameCanvas").unbind("mousemove", Play.MouseMove);
            $("#gameCanvas").unbind("mouseup", Play.MouseUp);
        }
    }


    // Re-route the touch to the mouse down
    public static TouchStart(evt)
    {
        if (!play.isFullScreen)
            Play.FullScreen();

        var touch = null;
        for (var i = 0; i < evt.touches.length; i++)
        {
            touch = evt.touches[i];
            break;
        }
        if (touch != null)
            Play.MouseDown(touch, true);
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.cancelBubble = true;
        evt.returnValue = false;

        $("#gameCanvas").bind('touchend', Play.TouchEnd);
        $("#gameCanvas").bind('touchmove', Play.TouchMove);

        return false;
    }

    // Re-route to mouse up, and removes the bindings
    public static TouchEnd(evt)
    {
        var touch = null;
        for (var i = 0; i < evt.changedTouches.length; i++)
        {
            touch = evt.changedTouches[i];
            break;
        }

        if (touch != null)
        {
            Play.MouseUp(touch, true);
        }

        $("#gameCanvas").unbind('touchend', Play.TouchEnd);
        $("#gameCanvas").unbind('touchmove', Play.TouchMove);

        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.cancelBubble = true;
        evt.returnValue = false;
        return false;
    }

    // Re-route to mouse move
    public static TouchMove(evt)
    {
        var touch = null;
        for (var i = 0; i < evt.changedTouches.length; i++)
        {
            touch = evt.changedTouches[i];
            break;
        }

        if (touch != null)
            Play.MouseMove(touch);
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.cancelBubble = true;
        evt.returnValue = false;
        return false;
    }


    public static KeyDown(evt: KeyboardEvent)
    {
        if (play.inField)
            return;

        var keyString = evt.key.toLowerCase();
        if (play.keys[16]) // Shift key
            keyString = keyString.toUpperCase();
        if (play.keys[17]) // Control key
            keyString = "^" + keyString;
        if (play.keys[18]) // Alt key
            keyString = "!" + keyString;

        if (play.keyHook[keyString])
        {
            ExecuteCodeFunction.ExecuteFunction([play.keyHook[keyString]]);
            return;
        }

        // http://keycode.info/
        switch (evt.keyCode)
        {
            case 13:
                Chat.Focus();
                break;
            case 73: // i
                InventoryMenu.Toggle();
                break;
            case 74: // j
                JournalMenu.Toggle();
                break;
            case 77: // m
                MessageMenu.Toggle();
                break;
            case 80: // p
                ProfileMenu.Toggle();
                break;
            case 48: // 0
            case 49: // 1
            case 50: // 2
            case 51: // 3
            case 52: // 4
            case 53: // 5
            case 54: // 6
            case 55: // 7
            case 56: // 8
            case 57: // 9
                SkillBar.SelectQuickslot(evt.keyCode - 48);
                break;
            default:
                play.keys[evt.keyCode] = true;
                break;
        }
        //console.log(evt.keyCode);
    }

    public static KeyUp(evt: KeyboardEvent)
    {
        if (play.inField)
            return;
        play.keys[evt.keyCode] = false;
    }

    public static HandleKeys()
    {
        if (!world.Player.CurrentArea)
            return;

        var updateFrame = false;
        var nx = world.Player.X;
        var ny = world.Player.Y;
        // Up key
        if (play.keys[1] === true || play.keys[38] === true || play.keys[87] === true)
        {
            ny -= world.Player.Speed;
            world.Player.Direction = 3;
            updateFrame = true;
            play.path = null;
        }
        // Left key
        if (play.keys[0] === true || play.keys[37] === true || play.keys[65] === true)
        {
            nx -= world.Player.Speed;
            world.Player.Direction = 1;
            updateFrame = true;
            play.path = null;
        }
        // Right key
        if (play.keys[2] === true || play.keys[39] === true || play.keys[68] === true)
        {
            nx += world.Player.Speed;
            world.Player.Direction = 2;
            updateFrame = true;
            play.path = null;
        }
        // Down key
        if (play.keys[3] === true || play.keys[40] === true || play.keys[83] === true)
        {
            ny += world.Player.Speed;
            world.Player.Direction = 0;
            updateFrame = true;
            play.path = null;
        }

        if (play.path && play.path.length > 0)
        {
            var p = play.path[0];
            var sx = Math.abs(p.x - world.Player.X);
            var sy = Math.abs(p.y - world.Player.Y);
            if (sx <= world.Player.Speed && sy <= world.Player.Speed)
            {
                nx = p.x;
                ny = p.y;
                play.path.shift();
            }
            else
            {
                if (p.x > nx && sx > world.Player.Speed)
                {
                    nx += world.Player.Speed;
                    world.Player.Direction = 2;
                    updateFrame = true;
                }
                else if (p.x < nx && sx > world.Player.Speed)
                {
                    nx -= world.Player.Speed;
                    world.Player.Direction = 1;
                    updateFrame = true;
                }
                if (p.y > ny && sy > world.Player.Speed)
                {
                    ny += world.Player.Speed;
                    world.Player.Direction = 0;
                    updateFrame = true;
                }
                else if (p.y < ny && sy > world.Player.Speed)
                {
                    ny -= world.Player.Speed;
                    world.Player.Direction = 3;
                    updateFrame = true;
                }
            }
        }

        var tileWidth = world.art.background.width;
        var tileHeight = world.art.background.height;

        if (nx != world.Player.X || ny != world.Player.Y)
        {
            //console.log("" + world.Player.X + ", " + world.Player.Y);
            if (world.Player.CanWalkOn(nx, ny))
            {
                var ox = Math.floor(world.Player.X / tileWidth);
                var oy = Math.floor(world.Player.Y / tileHeight);
                world.Player.X = nx;
                world.Player.Y = ny;

                var ax = world.Player.CurrentArea.X;
                var ay = world.Player.CurrentArea.Y;

                if (updateFrame)
                {
                    if (world.art.characters[world.Player.Name].animationCycle == "simple")
                        world.Player.Frame = (world.Player.Frame + 1) % (world.art.characters[world.Player.Name].frames * world.art.characters[world.Player.Name].imageFrameDivider);
                    else
                        world.Player.Frame = (world.Player.Frame + 1) % ((world.art.characters[world.Player.Name].frames + 1) * world.art.characters[world.Player.Name].imageFrameDivider);
                }

                world.Player.UpdatePosition();

                //var action = world.Player.CurrentArea.GetActions(world.Player.X, world.Player.Y, world.Player.Zone, world.art.background.width * 2);
                if (!world.Player.CurrentArea)
                    return;
                var action = world.Player.CurrentArea.GetActions(world.Player.X, world.Player.Y, world.Player.Zone);
                if (action && action.Check())
                {
                    if (action != play.lastAction)
                        action.Execute();
                    play.lastAction = action;
                }
                else
                    play.lastAction = action;

                if (world.Player.CurrentArea)
                {
                    var objects = world.Player.CurrentArea.GetObjects(Math.floor(world.Player.X / world.art.background.width), Math.floor(world.Player.Y / world.art.background.height), world.Player.Zone);
                    for (var i = 0; i < objects.length; i++)
                    {
                        if (!(objects[i] instanceof WorldObject))
                            continue;
                        var objInfo = world.art.objects[objects[i].Name];
                        if (objInfo && objInfo.walkActions && objInfo.walkActions.length > 0)
                        {
                            //var hoverObj = "" + objects[i].Name + "," + world.Player.Zone + "," + (objects[i].X + world.Player.AX * world.areaWidth * world.art.background.width) + "," + (objects[i].Y + world.Player.AY * world.areaHeight * world.art.background.height);
                            var hoverObj = (<WorldObject>objects[i]).GetId(world.Player.AX, world.Player.AY, world.Player.Zone);
                            if (play.lastObjectHover != hoverObj)
                            {
                                play.lastObjectHover = hoverObj;
                                (<WorldObject>objects[i]).PlayerInteract(world.Player.AX, world.Player.AY);
                            }
                        }
                    }
                }

                // Update path after crossing the border
                if (play.path && play.path.length > 0)
                {
                    if (ax > world.Player.CurrentArea.X)
                        for (var i = 0; i < play.path.length; i++)
                            play.path[i].x += (world.areaWidth - 0) * tileWidth;
                    if (ax < world.Player.CurrentArea.X)
                        for (var i = 0; i < play.path.length; i++)
                            play.path[i].x -= (world.areaWidth - 0) * tileWidth;

                    if (ay > world.Player.CurrentArea.Y)
                        for (var i = 0; i < play.path.length; i++)
                            play.path[i].y += (world.areaHeight - 0) * tileHeight;
                    if (ay < world.Player.CurrentArea.Y)
                        for (var i = 0; i < play.path.length; i++)
                            play.path[i].y -= (world.areaHeight - 0) * tileHeight;
                }
            }
            else
            {
                play.path = null;
                // Currently walking?
                if (updateFrame)
                {
                    var collidedWith = world.Player.CollideObject(nx, ny);
                    if (collidedWith)
                        collidedWith.PlayerInteract(world.Player.AX, world.Player.AY);
                }
            }
        }
        else
            world.Player.UpdatePosition();
    }

    static DeveloperTools(): boolean
    {
        if (("" + document.location).indexOf("localhost") != -1 || Main.CheckNW())
            return false;

        if (!window['devChromeDetect'])
        {
            window['devChromeDetect'] = new Image();
            window['devChromeDetect']['__defineGetter__']('id', function ()
            {
                play.devTools = true;
            });
        }

        if (!play.devTools)
        {
            if (window['__IE_DEVTOOLBAR_CONSOLE_COMMAND_LINE'])
                play.devTools = true;

            if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) == true) 
            {
                console.log(window['devChromeDetect']);
                console.clear();
            }
        }

        return play.devTools;
    }

    public static GameLoop()
    {
        if (world.IsLoading())
        {
            if (window['mozRequestAnimationFrame'])
                play.looper = window['mozRequestAnimationFrame'](Play.GameLoop);
            else if (window['requestAnimationFrame'])
                play.looper = window['requestAnimationFrame'](Play.GameLoop);
            else
                play.looper = setTimeout(Play.GameLoop, 16);
            play.lastRun = new Date();
            play.loopTimeRemains = 0;
            return;
        }

        if (Play.DeveloperTools())
        {
            $("#cheatDetected").show();
        }

        if (!play.renderer)
            return;

        if (play.loopCycle % 15 && play.loopCycle != 0)
        {
            var newFrag = AreaFragment.AllCurrentFragments(world.Player.Zone);
            if (newFrag != play.currentFragment)
                world.ResetFragments();
            play.currentFragment = newFrag;
            play.loopCycle = 0;
        }
        play.loopCycle++;

        if (world.ShowFPS)
            play.fps.tickStart();
        if (window['mozRequestAnimationFrame'])
            play.looper = window['mozRequestAnimationFrame'](Play.GameLoop);
        else if (window['requestAnimationFrame'])
            play.looper = window['requestAnimationFrame'](Play.GameLoop);
        else
            play.looper = setTimeout(Play.GameLoop, 16);

        if (!world.Player.CurrentArea || world.Player.CurrentArea.Zone != world.Player.Zone)
        {
            world.Player.CurrentArea = world.GetArea(world.Player.AX, world.Player.AY, world.Player.Zone);
            if (world.Player.CurrentArea)
                world.Player.CurrentArea.actors.push(world.Player);
            else
            {
                return;
            }
        }

        if (!world.Player.CurrentArea)
        {
            play.lastRun = new Date();
            play.loopTimeRemains = 0;
            return;
        }

        play.renderer.minimap = play.showMinimap
        play.renderer.offsetX = world.Player.X - Math.round(play.renderer.width / 2);
        play.renderer.offsetY = world.Player.Y - Math.round(play.renderer.height / 2);
        play.renderer.areaX = world.Player.CurrentArea.X;
        play.renderer.areaY = world.Player.CurrentArea.Y;
        play.renderer.zone = world.Player.Zone;
        play.renderer.Render();

        //Play.RenderPlayerPath();

        if (world.Player.InDialog)
        {
            for (var i = 0; i < play.onDialogPaint.length; i++)
            {
                CodeParser.ExecuteStatement(play.onDialogPaint[i]);
            }
        }

        var now = new Date();
        if (!play.lastRun)
            play.lastRun = now;
        var diff = now.getTime() - play.lastRun.getTime();
        play.loopTimeRemains += diff;
        play.lastRun = now;
        var i = 0;
        var maxRun = 4
        for (; i < maxRun && play.loopTimeRemains >= 16 && ((new Date()).getDate() - now.getDate()) < 35; i++)
        {
            Play.GameLogic();
            play.loopTimeRemains -= 16;
        }
        if (play.loopTimeRemains > 16 * (maxRun - 1))
            play.loopTimeRemains = 16 * (maxRun - 1);
        if (diff < 22)
            play.loopTimeRemains = 0;

        SkillBar.Render();
        if (world.ShowFPS)
            play.fps.tick();
    }

    static GameLogic()
    {
        if (!world.Player.CurrentArea)
            return;
        // Still running
        if (world.CountAreaToLoad() > 0 && play.afterTeleport)
            return;

        if (play.lastZone != world.Player.Zone)
        {
            var zoneInfo = world.GetZone(world.Player.Zone);
            play.currentFragment = "";
            play.lastZone = world.Player.Zone;
            Sounds.Init();
            if (zoneInfo.MapMusic)
                Sounds.Play(zoneInfo.MapMusic, 0.6, true);

            if (world.Edition != EditorEdition.Demo && zoneInfo.MapEffect && zoneInfo.MapEffect != "None")
                play.renderer.mapEffect = new window[zoneInfo.MapEffect + "Effect"]();
            else
                play.renderer.mapEffect = null;
        }

        if (play.afterTeleport)
        {
            var action = world.Player.CurrentArea.GetActions(world.Player.X, world.Player.Y, world.Player.Zone);
            if (action && action.Check())
                play.lastAction = action;
            else
                play.lastAction = null;
            play.afterTeleport = false;
        }

        // Handles the actors around
        for (var a = -1; a < 2; a++)
        {
            for (var b = -1; b < 2; b++)
            {
                if (!world.Player.CurrentArea)
                    return;

                var area = world.GetArea(world.Player.CurrentArea.X + a, world.Player.CurrentArea.Y + b, world.Player.Zone);
                if (area) area.HandleActors();
            }
        }

        if (!world.Player.InDialog && !$("#mapLoadingPage").is(":visible"))
        {
            Play.HandleMouseDown();

            if (play.selectedActor)
            {
                if (MovingActor.FindActorById(play.selectedActor))
                    world.Player.InvokeSkillFunction(world.Player.CurrentSkill, "Action", [new VariableValue(play.selectedActor)]);
                else
                    play.selectedActor = null;
            }

            Play.HandleKeys();
        }
    }

    static RenderPlayerPath()
    {
        if (!play.path || play.path.length == 0)
            return;
        var ctx = (<HTMLCanvasElement>$("#gameCanvas").first()).getContext("2d");

        ctx.fillStyle = "#FF0000";
        for (var i = 0; i < play.path.length; i++)
        {
            var p = play.renderer.MapToScreen(play.path[i].x, play.path[i].y);
            ctx.fillRect(p.X + world.art.background.width / 2 - 4, p.Y + world.art.background.height / 2 - 4, 8, 8);
        }
    }

    static EnterField()
    {
        play.inField = true;
    }

    static ExitField()
    {
        play.inField = false;
    }
}