# Twitch Stats Bot

This bot is intended to be used by companies running events on twitch. The bot will enter the chat and monitor the sentiment.

1. It could be used to monitor the reactions to content on the screen
2. It could be used to pick specific phrases from the fans which can be used to promote the event

## Resources
- [TMI.js](https://tmijs.com/)
  - [github](https://github.com/tmijs/tmi.js)

- [Twitch Developer Console](https://dev.twitch.tv/console)
  - Go here to register the app and view client id and client secret

- [Building the Bot](https://dev.twitch.tv/docs/irc#building-the-bot)
  - Go here to generate oauth token "oauth:xxxxxxxx"
  - Note: I think you can authenticate using normal Authorization code flow using client ID and client secret which can give you more privileges although using this single token seems to be easier and preferred method for chat bots given it is in the official documentation.
