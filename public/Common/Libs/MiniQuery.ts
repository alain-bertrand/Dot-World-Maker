/**
A small replacement for JQuery
*/

interface Object
{
    /**
    * Cast a data into an object
    */
    cast(rawObj, constructor): any;
}

Object.cast = function cast(rawObj, constructor)
{
    var obj = new constructor();
    for (var i in rawObj)
        obj[i] = rawObj[i];
    return obj;
}

function TryParse(json: string): any
{
    try
    {
        return JSON.parse(json);
    }
    catch (ex)
    {
        return null;
    }
}

interface iElementPosition
{
    left: number;
    top: number;
}

interface IMiniQueryStatic
{
    ajax(settings: MiniQueryAjaxSettings);
    (param: any): MiniQuery;
}

var $ = <IMiniQueryStatic>function (param: any): MiniQuery
{
    if (typeof param === "string")
    {
        // We don't have access to the dom?
        try
        {
            if (!document)
                return new MiniQuery([]);
        }
        catch (ex)
        {
            return new MiniQuery([]);
        }

        var elements: HTMLElement[] = [];
        var src = document.querySelectorAll(param);
        for (var i = 0; i < src.length; i++)
            elements.push(<HTMLElement>src[i]);
        return new MiniQuery(elements);
    }
    else if (typeof param === "function")
    {
        window.addEventListener("load", param);
    }
    return new MiniQuery([param]);
}

$.ajax = function (settings: MiniQueryAjaxSettings): XMLHttpRequest
{
    var http;

    try
    {
        http = new XMLHttpRequest();
    }
    catch (e)
    {
        try
        {
            http = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch (e2)
        {
            http = false;
        }
    }
    if (!http)
    {
        return;
    }

    http.open(settings.method ? settings.method : (settings.type ? settings.type : "GET"), settings.url);
    if (settings.contentType)
        http.setRequestHeader("Content-type", settings.contentType);

    http.onreadystatechange = function ()
    {
        if (http.readyState != 4)
            return;
        if (http.status == 200 && settings.success)
            settings.success(http.responseText);
        else if (http.status != 200 && settings.error)
            settings.error(http.responseText);
    }

    if (settings.dataType === "json")
        http.setRequestHeader("Accept", "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01");

    if (settings.data)
    {
        var destData = "";

        if (!settings.contentType || settings.contentType == "application/x-www-form-urlencoded")
        {
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            for (var i in settings.data)
            {
                if (destData != "")
                    destData += "&";
                destData += i + "=";
                destData += encodeURIComponent(settings.data[i]);
            }
        }
        else
            destData = JSON.stringify(settings.data);
        http.send(destData);
    }
    else
        http.send(null);

    return http;
}

interface MiniQueryAjaxSettings
{
    method?: string;
    type?: string;
    url?: string;
    data?: any;
    contentType?: string;
    dataType?: string;
    success?: any;
    error?: any;
}

class MiniQuery
{
    private elements: HTMLElement[];
    public length;
    private parentMiniQuery: MiniQuery = null;

    constructor(elements: HTMLElement[])
    {
        this.elements = elements;
        this.length = elements.length;
    }

    public first()
    {
        if (this.elements && this.elements.length > 0)
            return this.elements[0];
        return null;
    }

    public html(): string;
    public html(source: string): MiniQuery;
    public html(source?: any): any
    {
        if (source == undefined)
            return this.elements[0].innerHTML;

        this.elements.forEach((c) =>
        {
            c.innerHTML = source;
        });
        return this;
    }

    public text(): string;
    public text(source: string): MiniQuery;
    public text(source?: any): any
    {
        if (source == undefined)
            return this.elements[0].innerText;

        this.elements.forEach((c) =>
        {
            c.innerText = source;
        });
        return this;
    }

    public scrollTop(): number;
    public scrollTop(value: number): MiniQuery;

    public scrollTop(value?: any): any
    {
        if (value === undefined)
            return this.first().scrollTop;
        this.elements.forEach((c) =>
        {
            c.scrollTop = value;
        });
        return this;
    }

    public submit(): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            (<HTMLFormElement>c).submit();
        });
        return this;
    }

    public val(): string;
    public val(source: any): MiniQuery;
    public val(source?: any): any
    {
        if (this.elements.length === 0)
        {
            if (source === undefined)
                return null;
            else
                return this;
        }
        if (source === undefined)
        {
            if (this.elements[0].nodeName == "SELECT")
            {
                var s = <HTMLSelectElement>this.elements[0];

                if (s.multiple)
                {
                    var result = [];
                    for (var i = 0; i < s.options.length; i++)
                        if ((<HTMLOptionElement>s.options[i]).selected)
                            result.push((<HTMLOptionElement>s.options[i]).value);
                    return result;
                }
                else
                {
                    if (s.selectedIndex == -1)
                        return (<HTMLOptionElement>s.options[0]).value;
                    return (<HTMLOptionElement>s.options[s.selectedIndex]).value;
                }
            }
            return (<any>this.elements[0]).value;
        }
        this.elements.forEach((c) =>
        {
            if (c.nodeName == "SELECT")
            {
                var s = <HTMLSelectElement>c;
                for (var i = 0; i < s.options.length; i++)
                {
                    if ((<HTMLOptionElement>s.options[i]).value == source)
                    {
                        s.selectedIndex = i;
                        break;
                    }
                }
            }
            else
                (<any>c).value = source;
        });
        return this;
    }

    public show(): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            c.style.display = "block";
            c.style.visibility = "visible";
        });
        return this;
    }

    public hide(): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            c.style.display = "none";
            c.style.visibility = "hidden";
        });
        return this;
    }

    public mouseover(callback: any): MiniQuery
    {
        this.bind("mouseover", callback);
        return this;
    }

    public mouseout(callback: any): MiniQuery
    {
        this.bind("mouseout", callback);
        return this;
    }

    public bind(event: string, callback: any): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            if (!c['mini_event_list'])
                c['mini_event_list'] = [];
            c['mini_event_list'].push(callback);

            c.addEventListener(event, callback);
            if (event.toLowerCase() == "mousewheel")
                c.addEventListener("DOMMouseScroll", callback);
        });
        return this;
    }

    public unbind(event: string, callback?: any): MiniQuery
    {
        if (!callback)
        {
            this.elements.forEach((c) =>
            {
                if (c['mini_event_list'])
                {
                    for (var i = 0; i < c['mini_event_list'].length; i++)
                        c.removeEventListener(event, c['mini_event_list'][i]);
                    c['mini_event_list'] = [];
                }
                c["on" + event] = null;
                if (event.toLowerCase() == "mousewheel")
                    c["onDOMMouseScroll"] = null;
            });
            return this;
        }

        this.elements.forEach((c) =>
        {
            for (var i = 0; i < c['mini_event_list'].length;)
            {
                if (c['mini_event_list'][i] == callback)
                    c['mini_event_list'].splice(i, 1);
                else
                    i++;
            }

            c.removeEventListener(event, callback);
            if (event.toLowerCase() == "mousewheel")
                c.removeEventListener("DOMMouseScroll", callback);
        });
        return this;
    }

    public focus(): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            c.focus();
        });
        return this;
    }

    public blur(): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            c.blur();
        });
        return this;
    }

    public eq(id: number): MiniQuery
    {
        if (this.elements[id])
            return new MiniQuery([this.elements[id]]);
        return new MiniQuery([]);
    }

    public css(name: string): any

    public css(name: string, value: string): MiniQuery;

    public css(name: any, value?: string): any
    {
        if (value === null || value === undefined)
            return window.getComputedStyle(this.elements[0])[name];

        if (typeof name == "string")
        {
            var propName = name;
            name = {};
            name[propName] = value;
        }

        this.elements.forEach((c) =>
        {
            for (var i in name)
            {
                c.style[i] = value;
            }
        });

        return this;
    }

    public height(): number;
    public height(val: number): MiniQuery;
    public height(val?: any): any
    {
        if (val === null || val === undefined)
            return this.elements[0].clientHeight;
        this.elements[0].style.height = "" + val + "px";
        return this;
    }

    public width(): number
    public width(val: number): MiniQuery
    public width(val?: any): any
    {
        if (val === null || val === undefined)
        {
            if (this.elements.length > 0)
                return this.elements[0].clientWidth;
            return null;
        }
        for (var i = 0; i < this.elements.length; i++)
            this.elements[i].style.width = "" + val + "px";
        return this;
    }

    public animate(properties: any, time: number, callback?: any): MiniQuery
    {
        return this;
    }

    public clearClass(): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            c.className = "";
        });
        return this;
    }

    public toggleClass(className: string): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            if ((c.className ? c.className : "").indexOf(className) == -1)
                c.className += " " + className;
            else
                c.className = c.className.replace(className, "");
            c.className = c.className.replace(/ {2,}/g, " ").trim();
        });

        return this;
    }

    public addClass(className: string): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            if ((c.className ? c.className : "").indexOf(className) == -1)
                c.className += " " + className;
            c.className = c.className.replace(/ {2,}/g, " ").trim();
        });

        return this;
    }

    public removeClass(className: string): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            c.className = c.className.replace(className, "");
            c.className = c.className.replace(/ {2,}/g, " ").trim();
        });
        return this;
    }

    public position(): iElementPosition
    {
        var parent = this.elements[0];
        var result = { left: 0, top: 0 };
        while (parent != null)
        {
            result.left += parent.offsetLeft;
            result.top += parent.offsetTop;
            parent = parent.parentElement;
        }
        return result;
    }

    public prop(property: string, value: any): MiniQuery;

    public prop(property: string): any;

    public prop(property: string, value?: any): any
    {
        if (value === undefined)
            return this.elements[0][property];
        this.elements.forEach((c) =>
        {
            c[property] = value;
        });

        return this;
    }

    public find(toSearch: string): MiniQuery
    {
        var elements: HTMLElement[] = [];
        this.elements.forEach((c) =>
        {
            var src = c.querySelectorAll(toSearch);
            for (var i = 0; i < src.length; i++)
                elements.push(<HTMLElement>src[i]);
        });

        var result = new MiniQuery(elements);
        result.parentMiniQuery = this;
        return result;
    }

    public end(): MiniQuery
    {
        return this.parentMiniQuery;
    }

    public remove(): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            try
            {
                c.remove();
            }
            catch (ex)
            {
            }
        });
        return this;
    }

    public append(content: string): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            c.innerHTML += content;
        });
        return this;
    }

    public is(attribute: string): boolean
    {
        if (attribute != ":visible")
            return false;
        if (this.elements.length == 0)
            return false;
        return (this.first().offsetParent !== null && this.first().offsetParent !== undefined ? true : false);
    }

    public before(toAdd: string): MiniQuery
    {
        this.elements.forEach((c) =>
        {
            c.insertAdjacentHTML('beforebegin', toAdd);
        });
        return this;
    }
}