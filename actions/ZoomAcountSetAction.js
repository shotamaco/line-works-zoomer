const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');
const SessionRepository = require('../repositories/SessionRepository');

/**
 * ZoomAcountSetActionクラス
 */
module.exports = class ZoomAcountSetAction extends BaseAction {
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
    let message = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.text,
        text: `ZoomアカウントID：${this.callbackEvent.content.text}で登録します。`,
      }
    };
    this.setMessageTo(message);
    const sender = new BotMessageSender();
    await sender.send([ message ]);

    const sessionRepos = new SessionRepository();
    let session = sessionRepos.get(this.getRoomId());
    session.startDate = null;
    session.zoomAccountId = this.callbackEvent.content.text;
    session.waitingForZoomAcountIdInput = false;
    sessionRepos.save(session);
  }
}