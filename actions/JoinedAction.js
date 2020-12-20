const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');
const SessionRepository = require('../repositories/SessionRepository');

/**
 * JoinedActionクラス
 */
module.exports = class JoinedAction extends BaseAction {
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
    let mention = '';
    this.callbackEvent.memberList.forEach(member => {
      mention += `<m accountId="${member}">　`
    });
    let message = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.text,
        text: `${mention}Zoomerです。\n「ず」や「z」を入力して、メッセージを送信するとZoomミーティング登録のお手伝いを開始します。`,
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