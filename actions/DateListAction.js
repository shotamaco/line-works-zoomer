const moment = require("moment");
const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');

/**
 * DateListActionクラス
 */
module.exports = class DateListAction extends BaseAction {
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
    let startDate = moment().add(1, 'd');
    let actions = [];
    let i = 0;
    while (i < 10) {
      const date = startDate.add(1, 'd').format('YYYY-MM-DD');
      actions.push({
        type: BotMessageSender.MESSAGE_CONTENT_ACTION_TYPE.message,
        label: date,
        postback: date
      });
      i++;
    }
    let button = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.buttonTemplate,
        contentText: `Zoomの開始日を選択して下さい。`,
        actions: actions
      }
    };
    this.setMessageTo(button);
    const sender = new BotMessageSender();
    await sender.send([ button ]);
  }
}