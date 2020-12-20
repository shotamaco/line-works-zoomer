const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');
const SessionRepository = require('../repositories/SessionRepository');

/**
 * ZoomAcountConfirmActionクラス
 */
module.exports = class ZoomAcountConfirmAction extends BaseAction {
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
    const sessionRepos = new SessionRepository();
    let session = sessionRepos.get(this.getRoomId());
    let buttun = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.buttonTemplate,
        contentText: `ZoomアカウントID：${session.zoomAccountId}で登録しますか？`,
        actions: [
          {
            type: BotMessageSender.MESSAGE_CONTENT_ACTION_TYPE.message,
            label: `はい`,
            postback: 'menu'
          },
          {
            type: BotMessageSender.MESSAGE_CONTENT_ACTION_TYPE.message,
            label: 'いいえ。入力する',
            postback: 'zoomAccountInput'
          }
        ]
      }
    };
    this.setMessageTo(buttun);
    const sender = new BotMessageSender();
    await sender.send([ buttun ]);

    session.startDate = null;
    session.waitingForZoomAcountIdInput = false;
    sessionRepos.save(session);
  }
}