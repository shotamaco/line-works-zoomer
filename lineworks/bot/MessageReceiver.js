const crypto = require('crypto');

/**
 * コールバックタイプ
 */
const CALL_BACK_EVENT_TYPE = {
  /**
   * メンバーからのメッセージ
   */
  message : 'message',
  /**
   * Bot が複数人トークルームに招待された
   * このイベントがコールされるタイミング
   *  ・API を使って Bot がトークルームを生成した
   *  ・API を使って Bot がトークルームを生成した
   *  ・メンバーが Bot を含むトークルームを作成した
   *  ・Bot が複数人のトークルームに招待された
   * ※メンバー１人と Bot のトークルームに他のメンバーを招待したらjoinがコールされる（最初の１回だけ）
   *  招待したメンバーを退会させ、再度他のメンバーを招待するとjoinedがコールされるこれ仕様？
   *  たぶん、メンバー１人と Botの場合、トークルームIDが払い出されてないことが原因だろう。。。
   */
  join : 'join',
  /**
   * Bot が複数人トークルームから退室した
   * このイベントがコールされるタイミング
   *  ・API を使って Bot を退室させた
   *  ・メンバーが Bot をトークルームから退室させた
   *  ・何らかの理由で複数人のトークルームが解散した
   */
  leave : 'leave',
  /**
   * メンバーが Bot のいるトークルームに参加した
   * このイベントがコールされるタイミング
   *  ・Bot がトークルームを生成した
   *  ・Bot が他のメンバーをトークルームに招待した
   *  ・トークルームにいるメンバーが他のメンバーを招待した
   */
  joined : 'joined',
  /**
   * メンバーが Bot のいるトークルームから退室した
   * このイベントがコールされるタイミング
   *  ・Bot が属するトークルームでメンバーが自ら退室した、もしくは退室させられた
   *  ・何らかの理由でトークルームが解散した
   */
  left : 'left',
  /**
   * postback タイプのメッセージ
   * このイベントがコールされるタイミング
   *  ・メッセージ送信(Carousel)
   *  ・メッセージ送信(Image Carousel)
   *  ・トークリッチメニュー
   */
  postback : 'postback',
};

/**
 * コールバックコンテンツタイプ
 */
const CALL_BACK_MESSAGE_CONTENT_TYPE = {
  /**
   * テキスト
   */
  text : 'text',
  /**
   * 場所
   */
  location : 'location',
  /**
   * スタンプ
   */
  sticker : 'sticker',
  /**
   * 画像
   */
  image : 'image'
};

/**
 * Bot開始ポストバック
 */
const BOT_START_POSTBACK = 'start';

/**
 * MessageReceiverクラス
 */
module.exports = class MessageReceiver {
  /**
   * 署名をチェックしOKの場合はtrueを返します。（改ざん防止）
   * @param {object} request リクエスト
   * @param {object} buf バッファー
   * @return {boolean} OKの場合はtrue、NGの場合はfalse
   */
  isVaidSignature(request, buf) {
    const data = crypto.createHmac('sha256', process.env.API_ID).update(buf).digest('base64');
    const signature = request.headers['x-works-signature'];
    return data === signature;
  }

  /**
   * メッセージを受信した場合はtrueを返します
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} メッセージを受信した場合はtrue、それ以外はfalse
   */
  isMessageEvent(callbackEvent) {
    if (callbackEvent.type === CALL_BACK_EVENT_TYPE.message) {
        return true;
    }
    return false;
  }

  /**
   * テキストメッセージを受信した場合、かつ検証に成功した場合はtrueを返します
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @param {object} validateFunc 検証関数(省略した場合は検証しない)
   * @return {boolean} テキストメッセージを受信した場合、かつ検証に成功した場合はtrue、それ以外はfalse
   */
  isTextMessageEvent(callbackEvent, validateFunc) {
    if (this.isMessageEvent(callbackEvent)
      && callbackEvent.content.type === CALL_BACK_MESSAGE_CONTENT_TYPE.text) {
        if (validateFunc === undefined) {
          return true;
        }
        if (validateFunc(callbackEvent.content.text)) {
          return true;
        }
    }
    return false;
  }

  /**
   * テキストメッセージとPostBackデータを受信した場合、かつ検証に成功した場合はtrueを返します
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} テキストメッセージとPostBackデータを受信した場合、かつ検証に成功した場合はtrue、それ以外はfalse
   */
  isTextMessageAndPostBackEvent(callbackEvent, validateFunc) {
    if (this.isTextMessageEvent(callbackEvent)
      && callbackEvent.content.postback) {
        if (validateFunc === undefined) {
          return true;
        }
        if (validateFunc(callbackEvent.content.postback)) {
          return true;
        }
    }
    return false;
  }

  /**
   * Bot利用開始メッセージの場合はtrueを返します
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} Bot利用開始メッセージの場合はtrue、それ以外はfalse
   */
  isBotStartEvent(callbackEvent) {
    if (this.isTextMessageAndPostBackEvent(callbackEvent, postback => postback === BOT_START_POSTBACK)) {
        console.log(`Bot利用開始`);
        return true;
    }
    return false;
  }

  /**
   * Botが複数人トークルームに招待された場合はtrueを返します
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} Botが複数人トークルームに招待された場合はtrue、それ以外はfalse
   */
  isBotJoinEvent(callbackEvent) {
    if (callbackEvent.type === CALL_BACK_EVENT_TYPE.join) {
        console.log(`Botが複数人トークルームに招待された`);
        return true;
    }
    return false;
  }

  /**
   * メンバーが Bot のいるトークルームに参加した場合はtrueを返します
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} メンバーが Bot のいるトークルームに参加した場合はtrue、それ以外はfalse
   */
  isBotJoinedEvent(callbackEvent) {
    if (callbackEvent.type === CALL_BACK_EVENT_TYPE.joined) {
        console.log(`メンバーが Bot のいるトークルームに参加した`);
      return true;
    }
    return false;
  }
}