const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');
const SessionRepository = require('../repositories/SessionRepository');

/**
 * MenuActionクラス
 */
module.exports = class MenuAction extends BaseAction {
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
    let button = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.buttonTemplate,
        contentText: 'Zoomのミーティングを登録します。',
        actions: [
          {
            type: BotMessageSender.MESSAGE_CONTENT_ACTION_TYPE.message,
            label: '日付を指定する',
            postback: 'dateList'
          },
          {
            type: BotMessageSender.MESSAGE_CONTENT_ACTION_TYPE.message,
            label: '時間を指定する',
            postback: 'dateTimeList'
          },
          {
            type: BotMessageSender.MESSAGE_CONTENT_ACTION_TYPE.message,
            label: '今すぐ',
            postback: 'meetingCreate'
          }
        ]
      }
    };
    this.setMessageTo(button);
    const sender = new BotMessageSender();
    await sender.send([ button ]);

    const sessionRepos = new SessionRepository();
    let session = sessionRepos.get(this.getRoomId());
    session.startDate = null;
    session.waitingForZoomAcountIdInput = false;
    sessionRepos.save(session);
  }
}