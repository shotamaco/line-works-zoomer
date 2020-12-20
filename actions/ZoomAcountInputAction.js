const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');
const SessionRepository = require('../repositories/SessionRepository');

/**
 * ZoomAcountInputActionクラス
 */
module.exports = class ZoomAcountInputAction extends BaseAction {
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
    if (!session) {
      session = SessionRepository.create(this.getRoomId());
    }

    let message = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.text,
        text: `Zoomアカウントを入力して下さい。`,
      }
    };

    this.setMessageTo(message);
    const sender = new BotMessageSender();
    await sender.send([ message ]);

    session.startDate = null;
    session.zoomAccountId = null;
    session.waitingForZoomAcountIdInput = true;
    sessionRepos.save(session);
  }
}