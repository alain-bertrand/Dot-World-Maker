var sounds = {};

class Sounds
{
    public static Init(clearAtStart: boolean = true)
    {
        if (clearAtStart)
            Sounds.ClearSound();
        if (!world.art.sounds)
            return;
        for (var item in world.art.sounds)
            Sounds.Load(item, world.art.sounds[item].mp3, world.art.sounds[item].ogg);
    }

    public static ClearSound()
    {
        /*var soundArea = $('#sounds').first();
        while (soundArea.firstChild != null)
            soundArea.removeChild(soundArea.firstChild);
        sounds = {};*/
        for (var item in sounds)
        {
            for (var i = 0; i < sounds[item].stack; i++)
            {
                try
                {
                    sounds[item].sounds[i].pause();
                    sounds[item].sounds[i].currentTime = 0;
                }
                catch (ex)
                {
                }
            }
        }
        Sounds.Init(false);
    }

    public static Load(name: string, mp3: string, ogg: string, stack?: number)
    {
        name = name.id();

        if (document.getElementById("sound_" + name + "_" + 0))
            return;

        var soundArea = $('#sounds').first();

        if (!stack)
            stack = 6;

        var audioStack = { round: 0, stack: stack, sounds: [] };
        for (var i = 0; i < stack; i++)
        {
            var audio = document.createElement('audio');

            var source = document.createElement('source');
            if (("" + document.location).substr(0, 5) == "file:" && mp3 != null && mp3 != undefined && mp3.charAt(0) == '/')
                source.src = mp3.substr(1);
            else
                source.src = mp3;
            source.type = "audio/mpeg";
            audio.appendChild(source);

            audio.id = "sound_" + name + "_" + i;
            soundArea.appendChild(audio);
            audio.oncanplay = () =>
            {
                audio['loaded'] = true;
            };
            audioStack.sounds[i] = audio;
        }
        sounds[name] = audioStack;
    }

    public static Play(name: string, volume: number = 0.6, looped: boolean = false)
    {
        name = name.id();
        var browser: string = "";
        if (("" + navigator.userAgent).toLowerCase().indexOf("chrome") != -1)
            browser = "Chrome";
        else if (("" + navigator.userAgent).toLowerCase().indexOf("msie") != -1)
            browser = "Internet Explorer";
        else if (("" + navigator.userAgent).toLowerCase().indexOf("opera") != -1)
            browser = "Opera";
        else if (("" + navigator.userAgent).toLowerCase().indexOf("firefox") != -1)
            browser = "Firefox";

        var s: HTMLAudioElement = null;
        try
        {
            if (sounds[name].stack == null || sounds[name].stack == undefined)
            {
                s = sounds[name];
            }
            else
            {
                try
                {
                    sounds[name].sounds[sounds[name].round].currentTime = 0;
                }
                catch (ex2)
                {
                }
                if (browser == "Chrome")
                    sounds[name].sounds[sounds[name].round].load();
                sounds[name].round = (sounds[name].round + 1) % sounds[name].stack;
                s = sounds[name].sounds[sounds[name].round];
            }
            s.loop = looped;
            try
            {
                s.currentTime = 0;
            }
            catch (ex2)
            {
            }
            s.volume = volume;
            s.play();
        }
        catch (ex)
        {
        }
    }
}