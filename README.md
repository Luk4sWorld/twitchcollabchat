# Twitch Collab Chat  

A self contained Twitch chat intended to be embed in a OBS scene. It remembers its settings via URL. The settings are local only and wont be send to any server.  
Can display twitch emotes and badges and uses twitch username colors.

## Work In Progress!  

This project barely qualifies as a functioning prototype. Major changes might happen to the aviable options, the designs and Interface.  

## Usage  

- in OBS, create a new browser source. The URL is [https://Luk4sWorld.github.io/twitchcollabchat/index.html](https://Luk4sWorld.github.io/twitchcollabchat/index.html).  
- after adjusting the settings, make sure to press the `GO` button once to apply settings and confirm that everything works as intended.  
- close the chat-view by clicking anywhere within the page, then copy the URL displayed in the box below the `GO` button inclusive the letters after the #-sign.  
- replace the browser source URL with the URL you just copied and the settings will load on each reload.  

## Roadmap  

- enable user defined designs  
- make settings panel procedual  
- animating updates  
- visually distinguishing between messages sent from different channels  

## Known Issues:  

- due to not having a client id for the twitch API, correctness or existence of entered channelnames cant be confirmed.  
- auto scroll not implemented  
- messages arent removed (memory leak!)  


## Libraries used  

- [tmi.js](https://tmijs.com/)  