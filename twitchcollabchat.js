var config = {
    emoji: true,
    fade: true,
    badges: true,
    channels: [],
};
var client = new tmi.Client({
    connection: {
        reconnect: true,
        secure: true,
    }
});

const badges = {
    global: null,
    channel: {},
};

function createElement(parent, type, properties) {
    const e = document.createElement(type);    
    if(properties) {
        for(const p of Object.keys(properties)) {
            e[p] = properties[p];
        }
    }
    if(parent) parent.appendChild(e);
    return e;
}

function removeAllChildren(e) {
    while(e.children.length) {
        e.children[0].remove();
    }
    return e;
}

async function getBadges(args) {
    if(!args.tags.badges) return [];
    console.log('found badges');
    if(!badges.channel[args.channel]) {
        await fetch(['https://badges.twitch.tv/v1/badges/channels/', args.tags['room-id'], '/display'].join(''))
            .then(r=>r.json())
            .then(d=>badges.channel[args.channel] = d.badge_sets);
    }
    bc = badges.channel[args.channel]
    return Object.keys(args.tags.badges).map(k=>{
        if(bc[k] && bc[k].versions[args.tags.badges[k]]) {
            return bc[k].versions[args.tags.badges[k]].image_url_1x;
        }
        return badges.global[k].versions[args.tags.badges[k]].image_url_1x;
    });
}

const styleFunctions = {
    Style1: async (args)=>{
        const r = createElement(null, 'div');
        r.style.borderTop = "1px"
        const left = createElement(r,'div',{});
        left.style.width = '30%';
        const badgesList = await getBadges(args);
        for(const b of badgesList) {
            const i = createElement(left, 'img', {
                src: b,
            });
            i.style.paddingRight = '1px';
            i.style.paddingLeft = '1px';
        }
        const name = createElement(left, 'text', {
            innerText: args.tags['display-name']
        });
        name.style.color = args.tags.color;
        name.style['font-weight'] = 'bold';
        if(config.emoji) {
            r.appendChild(replaceEmojie(args.message, args.tags));
        } else {
            createElement(r,'text',{
                innerText: args.message,
            });
        }
        return r;
    },
    Style2: async (args)=>{
        const r = createElement(null, 'div');
        const badgesList = await getBadges(args);
        for(const b of badgesList) {
            const i = createElement(r, 'img', {
                src: b,
            });
            i.style.paddingRight = '1px';
            i.style.paddingLeft = '1px';
        }
        const name = createElement(r, 'text',{
            innerText: args.tags['display-name'],
        });
        name.style.color = args.tags.color;
        if(config.emoji) {
            r.appendChild(replaceEmojie(args.message, args.tags));
        } else {
            createElement(r, 'text', {
              innerText: args.message,
            });
        }
        return r;
    }
}
config.style = Object.keys(styleFunctions)[0];


function replaceEmojie(msg, tags) {
    const emojiCheck = document.getElementById('emoji');
    if(emojiCheck.checked) {
        const emotes = []
        if(tags.emotes) {
            for(const emotenr in tags.emotes) {
                for(const em of tags.emotes[emotenr]) {
                    const e = {};
                    emotes.push(e);
                    e.id = emotenr;
                    const [s,f] = em.split('-');
                    e.start = parseInt(s);
                    e.end = parseInt(f)+1;
                }
            }
        }
        emotes.sort(a=>a.start); // loop twice because of this line, making sure its sorted
        let posa = 0;
        let posb;// = emotes[0].start;
        const d = document.createElement('div');
        for(const e of emotes) {
            posb = e.start;
            if(posa < posb) {
                createElement(d,'text',{
                    innerText: msg.substring(posa,posb),
                });
            }
            //https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_12112565f7114e76bed1d39af737090d/default/dark/1.0
            const i = createElement(d,'img',{
                src: ['https://static-cdn.jtvnw.net/emoticons/v2/', e.id, '/default/dark/1.0'].join(''),
                alt: msg.substring(e.start,e.end),
            });
            i.style.paddingLeft = '1px';
            i.style.paddingRight = '1px';
            i.style.width = "20px";
            i.style.height = "18px";
            posa = e.end;
        }
        createElement(d,'text',{
            innerText: msg.substring(posa,msg.length),
        });
        return d;
    }
    return createElement(null, "text", {
        innerText: msg,
    });
}

var chatContainer;
client.on('message', async (target, tags, message, self) => {
    //if(self) return; //should never be the case, bc we are in incognito mode
    if(chatContainer.hidden) return;
    const e = await styleFunctions[config.style]({
        target,
        tags,
        message,
        channel: target.replace('#',''),
    });
    e.id = tags.id;
    e.username = tags.username;
    chatContainer.appendChild(e);
    cleanMsgList(chatContainer);
})
client.on('messagedeleted', (target, username, deletedMessage, tags) => {
    document.getElementById(tags['target-msg-id']).remove();
});

function cleanMsgList(cc) {
    cc = cc || chatContainer;
    cc.scrollBy(0, cc.scrollMaxY);
    while(chatContainer.children.length && chatContainer.children[0].offsetTop < 0) {
        chatContainer.children[0].remove();
    }
}

function rebuildChannelList(s) {
    s = s || config;
    const l = s.channels;
    const channelBox = document.getElementById("channel-box");
    removeAllChildren(channelBox);
    for(const ch of l.sort()) {
        const e = createElement(channelBox, "div", {
            innerText: ch,
            classList: "channel-list",
            onclick: () => {
                e.remove();
                l.splice(l.indexOf(ch),1);
                storeConfigInURL(config)
            }
        });
    }
}


function storeConfigInURL(c) {
    c = c || config;
    window.location.hash = '#' + btoa(JSON.stringify(c));
    document.getElementById('make-config').value = window.location.href;
}

function loadConfigFromURL(s) {
    s = s || {};
    try {
        const c = JSON.parse(atob(window.location.hash.substring(1)));
        for(const k in c) {
            s[k] = c[k];
        }
    } catch (e) {
        console.error(e);
    }
    return s;
}

function applyConfigToUI(s) {
    s = s || config;
    storeConfigInURL(s);
    document.getElementById("fade").checked = s.fade;
    document.getElementById("emoji").checked = s.emoji;
    document.getElementById("styles").value = s.style;
    document.getElementById('badges').checked = s.badges;
    rebuildChannelList(config);
}

function gatherConfigFromUI(s) {
    s = s || config;
    s.fade = document.getElementById('fade').checked;
    s.emoji = document.getElementById('emoji').checked;
    s.style = document.getElementById('styles').value;
    s.badges = document.getElementById('badges').checked;
    return s
}


async function appylChannelListToClient(s, cl) {
    s  = s  || config;
    cl = cl || client;
    const currentList = cl.getChannels().map(a=>a.replace('#',''));
    for(const c of currentList) {
        if(s.channels.indexOf(c) < 0) {
            await cl.leave(c);
            delete badges.channel[c];
        }
    }
    for(const c of s.channels) {
        if(currentList.indexOf(c) < 0) {
            await cl.join(c);
        }
    }
}


async function init() {
    await fetch('https://badges.twitch.tv/v1/badges/global/display')
        .then(r=>r.json())
        .then(d=>badges.global = d.badge_sets);
    loadConfigFromURL(config);
    await client.connect();
    const fadeCheck = document.getElementById('fade');
    fadeCheck.onclick = () => {
        config.fade = fadeCheck.checked;
        storeConfigInURL(config);
    };
    const emojiCheck = document.getElementById('emoji')
    emojiCheck.onclick = () => {
        config.emoji = emojiCheck.checked;
        storeConfigInURL(config);
    }
    chatContainer = document.getElementById('chat-container')
    settingsContainer = document.getElementById('settings-container');
    chatContainer.onclick = () => {
        chatContainer.hidden=true;
        settingsContainer.hidden=false;
    };
    const channelInput = document.getElementById('channel-input');
    channelInput.addEventListener("keyup", e=>{
        if(event.keyCode !== 13) return; // enter key
        if(config.channels.indexOf(channelInput.value) < 0)
            config.channels.push(channelInput.value);
        channelInput.value = "";
        applyConfigToUI(config)
        rebuildChannelList(config);
    });
    goButton = document.getElementById('gobtn');
    goButton.onclick = async () => {
        await appylChannelListToClient(config, client);
        settingsContainer.hidden = true;
        chatContainer.hidden = false;
    }
    const stylesSelect = document.getElementById('styles');
    stylesSelect.addEventListener('change', e => {
        console.log('changed styles');
        config.style = stylesSelect.value;
        //gatherConfigFromUI(config);
        storeConfigInURL(config);
    })
    Object.keys(styleFunctions).forEach(style=>
        stylesSelect.add(createElement(null, "option", {
                text: style,
            }))
    );
    applyConfigToUI(config);
    if(config.channels.length)
        goButton.onclick();
}
window.onload = init;

/*
/store config in URL
//load config from url
//apply config to UI
//gather config from UI
//apply channel list to client
*/