const express = require('express');
const app = express();
require('dotenv').config();
const ZoomerActionFactory = require('./ZoomerActionFactory');
const BotMessageReceiver = require('./lineworks/bot/MessageReceiver');

const _actionFactory = new ZoomerActionFactory();
const _botMessageReceiver = new BotMessageReceiver();

var port = process.env.PORT || 3000
app.listen(port, function() {
  console.log('To view your app, open this link in your browser: http://localhost:' + port);
});

app.use(express.json({verify:(req, res, buf, encoding) => {
  if (!_botMessageReceiver.isVaidSignature(req, buf)) {
    throw 'NOT_MATCHED signature';
  }
}}));

/* 
* 疎通確認API
*/
app.get('/', function (req, res) {
  res.send('起動してます！');
});

/**
 * LINE WORKS からのメッセージを受信するAPI
 */
app.post('/callback', async function (req, res, next) {
  res.sendStatus(200);
  
  try {
    const actions = await _actionFactory.create(req.body);
    if (!actions) {
      return;
    }
    for (let i = 0; i < actions.length; i++) {
      await actions[i].execute();
    }
  } catch (error) {
    await _actionFactory.error(req.body, error);
    return next(error);
  }
});

