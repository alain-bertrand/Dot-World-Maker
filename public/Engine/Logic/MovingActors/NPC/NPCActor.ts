/// <reference path="../MovingActor.ts" />

var npc = new (class
{
    public Dialogs: Dialog[];
    public Answers: Answer[];
    public currentNPC: NPC;
    public canJump: boolean;
});

class NPCActor extends MovingActor
{
    public baseNpc: NPC;

    public static Create(npc: NPC, worldArea: WorldArea, x: number, y: number): NPCActor
    {
        var result = new NPCActor(worldArea.world);
        result.CurrentArea = worldArea;
        result.X = x;
        result.Y = y;
        result.Name = npc.Name;
        result.baseNpc = npc;
        return result;
    }

    public CanReachArea(x: number, y: number): boolean
    {
        return (Math.abs(this.World.Player.CurrentArea.X - x) < 2 && Math.abs(this.World.Player.CurrentArea.Y - y) < 2);
    }

    public Handle(): void
    {
    }

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number): void
    {
        var img = renderEngine.GetActorImage(this.baseNpc.Look);
        if (!img)
            return;
        if (img.width)
        {
            var actorArtInfo: TilesetCharacterDetails = null;
            actorArtInfo = renderEngine.world.art.characters[this.baseNpc.Look];
            var w = img.width / actorArtInfo.frames;
            var h = img.height / actorArtInfo.directions;
            var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
            var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);
            ctx.drawImage(img, w * 1, h * this.Direction, w, h, ix, iy, w, h);

            ctx.font = "10px sans-serif";
            var tw = ctx.measureText(this.Name).width;
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            ctx.strokeText(this.Name, Math.floor(ix + w / 2 - tw / 2) + 0.5, Math.floor(iy + h) + 0.5);
            ctx.fillStyle = "#00E000";
            ctx.lineWidth = 1;
            ctx.fillText(this.Name, Math.floor(ix + w / 2 - tw / 2) + 0.5, Math.floor(iy + h) + 0.5);
        }
    }

    public PlayerInteract(ax: number, ay: number): void
    {
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        if (this.DistanceTo(world.Player) > 160)
        {
            Framework.ShowMessage("You are too far, move nearer.");
            return true;
        }

        setTimeout(Play.MouseUp, 100);

        world.Player.InDialog = true;
        $("#npcDialog").show();
        $("#npcDialog .gamePanelHeader").html(this.baseNpc.Name.htmlEntities());
        npc.Dialogs = this.baseNpc.Dialogs;
        npc.currentNPC = this.baseNpc;
        NPCActor.ShowDialog(0);
        return true;
    }

    public static ShowDialog(id: number): void
    {
        // Close dialog
        if (id < 0)
        {
            world.Player.InDialog = false;
            $("#npcDialog").hide();
            return;
        }

        var dialog = npc.Dialogs[id];
        npc.Answers = dialog.Answers;

        $("#dialogSentence").html(Main.TextTransform(dialog.Text, true));
        play.onDialogPaint = [];

        var html = "";
        for (var i = 0; i < dialog.Answers.length; i++)
            if (NPCActor.CanShow(dialog.Answers[i].Conditions))
                html += "<div onclick='NPCActor.ClickAnswer(" + i + ");' class='gameButton'>" + dialog.Answers[i].Text.htmlEntities() + "</div>";
        $("#dialogAnswers").html(html);
    }

    private static ClickAnswer(id: number)
    {
        var answer = npc.Answers[id];
        if (!NPCActor.CanShow(answer.Conditions))
            return;
        npc.canJump = true;

        // Execute code
        if (answer.Actions) for (var i = 0; i < answer.Actions.length; i++)
            dialogAction.code[answer.Actions[i].Name].Execute(answer.Actions[i].Values);

        if (npc.canJump)
            NPCActor.ShowDialog(answer.JumpTo);
    }

    private static CanShow(conditions: DialogCondition[]): boolean
    {
        if (!conditions)
            return true;
        for (var i = 0; i < conditions.length; i++)
            if (!dialogCondition.code[conditions[i].Name].Check(conditions[i].Values))
                return false;
        return true;
    }

    public static ShowShop()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GetTotalCredits',
            data: {
                token: framework.Preferences['token'],
            },
            success: function (msg)
            {
                $("#field_currentCredits").html(msg);
                var credits = parseInt(msg);

                var havePremiumItems = false;
                for (var i = 0; i < npc.currentNPC.ShopItems.length; i++)
                {
                    if (npc.currentNPC.ShopItems[i].PremiumShop === true)
                    {
                        havePremiumItems = true;
                        break;
                    }
                }


                var html = "";
                var moneyStat = world.Player.FindStat("Money");
                html += "Your " + (moneyStat.BaseStat.CodeVariable('DisplayName') ? moneyStat.BaseStat.CodeVariable('DisplayName') : moneyStat.Name).htmlEntities() + ": " + ("" + moneyStat.Value).htmlEntities();
                if (havePremiumItems)
                    html += "<br><a href='https://www.dotworldmaker.com/add_credits.html' target='credits'>Game premium credits: " + msg + "</a> <div class='gameButton' onclick='NPCActor.ShowShop()'>Refresh</div><br><br>";

                html += "<table>";
                //html += "<thead><tr><td>&nbsp;</td><td>Item:</td><td>Price:</td><td>In Inventory:</td></tr></thead>";
                html += "<thead><tr><td>&nbsp;</td><td>Item:</td><td>Buy Price:</td><td>Sell Price:</td><td>In Inventory:</td></tr></thead>";
                for (var i = 0; i < npc.currentNPC.ShopItems.length; i++)
                {
                    var details = world.GetInventoryObject(npc.currentNPC.ShopItems[i].Name);
                    if (!details)
                        continue;
                    var qt = world.Player.GetInventoryQuantity(npc.currentNPC.ShopItems[i].Name);

                    html += "<tr>";
                    html += "<td>";
                    if ((moneyStat.Value >= npc.currentNPC.ShopItems[i].SellPrice && npc.currentNPC.ShopItems[i].PremiumShop !== true) ||
                        (credits >= npc.currentNPC.ShopItems[i].SellPrice && npc.currentNPC.ShopItems[i].PremiumShop === true))
                        html += "<div class='gameButton' onclick='NPCActor.Buy(" + i + ")'>Buy</div>";
                    if (qt > 0 && npc.currentNPC.ShopItems[i].BuyPrice > 0)
                        html += "<div class='gameButton' onclick='NPCActor.Sell(" + i + ")'>Sell</div>";
                    html += "&nbsp;";
                    html += "</td>";
                    html += "<td>" + npc.currentNPC.ShopItems[i].Name.htmlEntities() + "</td>";
                    html += "<td>" + ("" + npc.currentNPC.ShopItems[i].SellPrice).htmlEntities() + "</td>";
                    html += "<td>" + ("" + (npc.currentNPC.ShopItems[i].BuyPrice === 0 ? "" : npc.currentNPC.ShopItems[i].BuyPrice)).htmlEntities() + "</td>";
                    html += "<td>" + (qt ? qt : 0) + "</td>";
                    html += "<td>" + (npc.currentNPC.ShopItems[i].PremiumShop === true ? "Credits" : "") + "</td>";
                    html += "</tr>";
                }
                html += "</table>";
                $("#dialogSentence").html(html);
                play.onDialogPaint = [];

                $("#dialogAnswers").html("<div onclick='NPCActor.HideShop();' class='gameButton'>Close</div>");
            },
            error: function (msg, textStatus)
            {
            }
        });

    }

    public static Sell(rowId: number)
    {
        var shopItem = npc.currentNPC.ShopItems[rowId];
        var qt = world.Player.GetInventoryQuantity(shopItem.Name);
        if (qt < 1)
            return;

        if (shopItem.PremiumShop)
        {
            Framework.Confirm("This is a premium item, are you sure you want to sell it?", () =>
            {
                world.Player.SetStat("Money", world.Player.GetStat("Money") + shopItem.BuyPrice);
                world.Player.RemoveItem(shopItem.Name, 1);
                NPCActor.ShowShop();
            });
        }
        else
        {
            world.Player.SetStat("Money", world.Player.GetStat("Money") + shopItem.BuyPrice);
            world.Player.RemoveItem(shopItem.Name, 1);
            NPCActor.ShowShop();
        }
    }

    public static Buy(rowId: number)
    {
        var shopItem = npc.currentNPC.ShopItems[rowId];

        if (shopItem.PremiumShop)
        {
            Framework.Confirm("This is a premium item, are you sure you want to purchase it?", () =>
            {
                $.ajax({
                    type: 'POST',
                    url: '/backend/PremiumPurchase',
                    data: {
                        token: framework.Preferences['token'],
                        item: shopItem.Name,
                        game: world.Id,
                        credits: shopItem.SellPrice
                    },
                    success: function (msg)
                    {
                        var res = TryParse(msg);
                        if (res === true)
                        {
                            world.Player.AddItem(shopItem.Name, 1);
                            NPCActor.ShowShop();
                            Framework.ShowMessage("Operation succeeded !");
                        }
                        else
                            Framework.ShowMessage("Operation failed...");
                    },
                    error: function (msg, textStatus)
                    {
                    }
                });
            });
        }
        else
        {
            if (world.Player.GetStat("Money") < shopItem.SellPrice)
                return;
            world.Player.SetStat("Money", world.Player.GetStat("Money") - shopItem.SellPrice);
            world.Player.AddItem(shopItem.Name, 1);
            NPCActor.ShowShop();
        }
    }

    public static HideShop()
    {
        NPCActor.ShowDialog(0);
    }
}