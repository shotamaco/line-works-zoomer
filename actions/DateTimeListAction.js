const moment = require("moment");
const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');
const SessionRepository = require('../repositories/SessionRepository');

/**
 * SelectTimeActionクラス
 */
module.exports = class DateTimeListAction extends BaseAction {
  /**
   * 初期化します。
   * @param {object} callbackEvent コールバックイベント
   */
  constructor(callbackEvent) {
    super(callbackEvent);
  }

  /**
   * アクションを実行します。
   */
  async execute() {
    var postbackDate = moment(this.callbackEvent.content.postback);
    let startDate = postbackDate.isValid() ? postbackDate : moment();
    let startHour = 9;
    let hour = postbackDate.isValid() ? startHour : Number(moment().format('H'));
    if (hour < 9) {
    } else if (hour > 19) {
      startDate = moment().add(1, 'd');
    } else {
      startHour = hour;
    }
    let actions = [];
    for (let i = startHour; i < 19; i++) {
      const time = `${String(i).padStart(2, '0')}:00`;
      const dateTime = `${startDate.format('YYYY-MM-DD')} ${time}〜`;
      actions.push({
        type: BotMessageSender.MESSAGE_CONTENT_ACTION_TYPE.message,
        label: dateTime,
        postback: time
      });
    }
    let button = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.buttonTemplate,
        contentText: `Zoomの開始時刻を選択して下さい。`,
        actions: actions
      }
    };
    this.setMessageTo(button);
    const sender = new BotMessageSender();
    await sender.send([ button ]);

    const sessionRepos = new SessionRepository();
    let session = sessionRepos.get(this.getRoomId());
    session.startDate = startDate.format('YYYY-MM-DD');
    sessionRepos.save(session);
  }
}