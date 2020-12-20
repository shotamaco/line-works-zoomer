/**
 * BaseActionクラス
 */
module.exports = class BaseAction {
  /**
   * 初期化します。
   * @param {object} callbackEvent コールバックイベント
   */
  constructor(callbackEvent) {
    this.callbackEvent = callbackEvent;
  }

  /**
   * 送信先を設定します。
   * @param {string} json BotMessage JSON オブジェクト
   */
  setMessageTo(json) {
    if (this.callbackEvent.source.roomId) {
      // 受信したデータにトークルームIDがある場合は、送信先にも同じトークルームIDを指定します。
      json.roomId = this.callbackEvent.source.roomId;
    } else {
      // トークルームIDがない場合はBotとユーザーとの1:1のチャットです。
      json.accountId = this.callbackEvent.source.accountId;
    }
  }

  /**
   * 送信先ルームIDもしくはアカウントIDを取得します。
   */
  getRoomId() {
    if (this.callbackEvent.source.roomId) {
      return this.callbackEvent.source.roomId;
    } else {
      // トークルームIDがない場合はBotとユーザーとの1:1のチャットです。
      return this.callbackEvent.source.accountId;
    }
  }
}