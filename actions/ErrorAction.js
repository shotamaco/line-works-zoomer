const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');
const SessionRepository = require('../repositories/SessionRepository');

/**
 * クラス
 */
module.exports = class ErrorAction extends BaseAction {
  /**
   * 初期化します。
   * @param {object} callbackEvent コールバックイベント
   */
  constructor(callbackEvent) {
    super(callbackEvent);
  }

  /**
   * アクションを実行します。
   * @param {object} error エラー
   */
  async execute(error) {
    let message = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.text,
        text: `すいません。エラーが発生しました。（${error.message}）`,
      }
    };

    this.setMessageTo(message);
    const sender = new BotMessageSender();
    await sender.send([ message ]);

    const sessionRepos = new SessionRepository();
    let session = sessionRepos.get(this.getRoomId());
    if (!session) {
      session = SessionRepository.create(this.getRoomId());
    }
    session.startDate = null;
    session.waitingForZoomAcountIdInput = false;
    sessionRepos.save(session);
  }
}