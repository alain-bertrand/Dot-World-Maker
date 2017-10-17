

var skillBar = new (class
{
    SkillIcons: ImageCache = {};
    SlotBar: HTMLImageElement;
    StatBar: HTMLImageElement;
    lastCheckInventory: number = 0;
});


class SkillBar
{
    public static Render()
    {
        if (!framework.Preferences['token'] && !game && !Main.CheckNW())
            return;

        var canvas = (<HTMLCanvasElement>document.getElementById("gameCanvas"));
        var height = canvas.height;
        var width = canvas.width;
        var ctx = canvas.getContext("2d");

        if (!skillBar.SlotBar)
        {
            skillBar.SlotBar = new Image();
            skillBar.SlotBar.src = world.art.quickslotStyle.file;
        }

        if (!skillBar.StatBar)
        {
            skillBar.StatBar = new Image();
            skillBar.StatBar.src = world.art.statBarStyle.file;
        }

        if (!skillBar.SlotBar || !skillBar.SlotBar.width)
            return;

        ctx.save();
        if (world.art.statBarStyle.barsToDisplay === null || world.art.statBarStyle.barsToDisplay === undefined)
            world.art.statBarStyle.barsToDisplay = 1;
        if ((world.art.statBarStyle.barsToDisplay == 1 || world.art.statBarStyle.barsToDisplay == 2) && skillBar.StatBar && skillBar.StatBar.width)
        {
            var v = world.Player.GetStat('Life');
            var maxV = world.Player.GetStatMaxValue('Life');
            v = Math.min(Math.max(v, 0), maxV);
            var h = Math.round((skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder)) * (maxV - v) / maxV);
            //h = Math.min(Math.max(h, 0), 100);
            ctx.drawImage(skillBar.StatBar, 0, 0, skillBar.StatBar.width / 3, skillBar.StatBar.height, 10, height - (skillBar.StatBar.height + 10), skillBar.StatBar.width / 3, skillBar.StatBar.height);
            try
            {
                ctx.drawImage(skillBar.StatBar, skillBar.StatBar.width / 3, world.art.statBarStyle.topBorder + h,
                    skillBar.StatBar.width / 3, skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder + h),
                    10, height - ((skillBar.StatBar.height - (world.art.statBarStyle.topBorder + h)) + 10), skillBar.StatBar.width / 3, skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder + h));
            }
            catch (ex)
            {
            }
        }

        if ((world.art.statBarStyle.barsToDisplay == 2) && skillBar.StatBar && skillBar.StatBar.width)
        {
            var v = world.Player.GetStat('Energy');
            var maxV = world.Player.GetStatMaxValue('Energy');
            v = Math.min(Math.max(v, 0), maxV);
            var h = Math.round((skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder)) * (maxV - v) / maxV);
            //h = Math.min(Math.max(h, 0), 100);
            ctx.drawImage(skillBar.StatBar, 0, 0, skillBar.StatBar.width / 3, skillBar.StatBar.height, 10 + skillBar.StatBar.width / 3, height - (skillBar.StatBar.height + 10), skillBar.StatBar.width / 3, skillBar.StatBar.height);
            try
            {
                ctx.drawImage(skillBar.StatBar, skillBar.StatBar.width * 2 / 3, world.art.statBarStyle.topBorder + h,
                    skillBar.StatBar.width / 3, skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder + h),
                    10 + skillBar.StatBar.width / 3, height - ((skillBar.StatBar.height - (world.art.statBarStyle.topBorder + h)) + 10), skillBar.StatBar.width / 3, skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder + h));
            }
            catch (ex)
            {
            }
        }
        if (world.art.quickslotStyle.quickslotVisible === false)
        {
            ctx.restore();
            return;
        }

        var pos = Math.round(width / 2 - skillBar.SlotBar.width / 2);
        ctx.drawImage(skillBar.SlotBar, pos, height - skillBar.SlotBar.height);
        pos += world.art.quickslotStyle.leftBorder;

        for (var i = 0; i < world.Player.QuickSlot.length; i++)
        {
            var q: string = world.Player.QuickSlot[i];
            if (q == null)
            {
                pos += 32 + world.art.quickslotStyle.itemSpacing;
                continue;
            }

            var name = q.substring(2);

            // Skill quickslot
            if (q.substring(0, 2) == "S/")
            {
                if (!skillBar.SkillIcons[q] && world.GetSkill(name))
                {
                    var skillInfo = world.GetSkill(name);

                    skillBar.SkillIcons[q] = new Image();
                    skillBar.SkillIcons[q].src = (skillInfo.CodeVariable("icon") ? skillInfo.CodeVariable("icon") : "/art/tileset2/fist_icon.png");
                }
                if (!skillBar.SkillIcons[q])
                    continue;

                ctx.drawImage(skillBar.SkillIcons[q], pos, height - skillBar.SlotBar.height + world.art.quickslotStyle.topBorder);
                var timer = world.Player.GetTimer(name);
                if (timer && !timer.IsOver())
                {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.globalAlpha = 0.8;
                    var h = Math.round(Math.max(timer.Length - timer.Ellapsed(), 0) * 32 / timer.Length);
                    ctx.fillRect(pos, height - skillBar.SlotBar.height + world.art.quickslotStyle.topBorder + (32 - h), 32, h);
                }

                if (world.Player.CurrentSkill.toLowerCase() == name.toLowerCase())
                {
                    ctx.strokeStyle = world.art.quickslotStyle.selectedSkillColor;
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.strokeRect(pos, height - skillBar.SlotBar.height + world.art.quickslotStyle.topBorder, 32, 32);
                    ctx.stroke();
                }
            }
            else if (q.substring(0, 2) == "I/")
            {
                var details = world.GetInventoryObject(name);

                if (skillBar.lastCheckInventory <= 0)
                {
                    if (world.Player.GetInventoryQuantity(name) <= 0)
                    {
                        world.Player.QuickSlot[i] = null;
                        world.Player.StoredCompare = world.Player.JSON();
                        world.Player.Save();
                        continue;
                    }
                }

                if (!skillBar.SkillIcons[q] && details)
                {
                    skillBar.SkillIcons[q] = new Image();
                    skillBar.SkillIcons[q].src = (details.Image ? details.Image : "/art/tileset2/inventory_object.png");
                }
                if (!skillBar.SkillIcons[q])
                    continue;

                ctx.drawImage(skillBar.SkillIcons[q], pos, height - skillBar.SlotBar.height + world.art.quickslotStyle.topBorder);
            }
            pos += 32 + world.art.quickslotStyle.itemSpacing;
        }

        ctx.restore();
        skillBar.lastCheckInventory--;
        if (skillBar.lastCheckInventory < 0)
            skillBar.lastCheckInventory = 30;
    }

    public static SelectQuickslot(slot: number)
    {
        if (slot == 0)
            slot = 9;
        else
            slot--;
        if (world.Player.QuickSlot[slot] && world.Player.QuickSlot[slot].substring(0, 2) == "S/")
        {
            var oldSkill = world.Player.CurrentSkill;
            var selectedSkill = world.Player.QuickSlot[slot].substring(2);
            world.Player.CurrentSkill = selectedSkill;

            var skill = world.GetSkill(selectedSkill);
            var res = skill.InvokeFunction("Activate", []);
            // Prevent selection
            if (res !== null && res.GetBoolean() === false)
            {
                world.Player.CurrentSkill = oldSkill;
            }

            world.Player.StoredCompare = world.Player.JSON();
            world.Player.Save();
        }
        else if (world.Player.QuickSlot[slot] && world.Player.QuickSlot[slot].substring(0, 2) == "I/")
        {
            var name = world.Player.QuickSlot[slot].substring(2);
            var details = world.GetInventoryObject(name);
            if (!details)
                return;

            if (world.Player.GetInventoryQuantity(name) > 0)
            {
                if (details.CanWear())
                    world.Player.Wear(name);
                else if (details.ActionLabel() && details.CanUse())
                    details.Use();
            }
        }
    }

    public static HandleClick(x: number, y: number): boolean
    {
        if (world.art.quickslotStyle.quickslotVisible === false)
            return false;
        if (!skillBar.StatBar)
            return;

        var canvas = (<HTMLCanvasElement>document.getElementById("gameCanvas"));

        y -= $("#gameCanvas").position().top;

        var width = canvas.width;
        var height = canvas.height;
        var barX = Math.round(width / 2 - skillBar.SlotBar.width / 2);
        var barY = height - skillBar.SlotBar.height;

        if (x >= barX && x <= barX + skillBar.SlotBar.width && y >= barY && y <= barY + skillBar.SlotBar.height)
        {
            var s = Math.floor((x - (barX + world.art.quickslotStyle.leftBorder)) / (32 + world.art.quickslotStyle.itemSpacing));
            if (s >= 0 && s <= 9)
            {
                s = (s + 1) % 10;
                SkillBar.SelectQuickslot(s);
            }
            return true;
        }

        return false;
    }
}