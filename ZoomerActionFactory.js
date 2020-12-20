const MessageReceiver = require('./lineworks/bot/MessageReceiver');
const SessionRepository = require('./repositories/SessionRepository');
const ErrorAction = require('./actions/ErrorAction');
const StartAction = require('./actions/StartAction');
const JoinAction = require('./actions/JoinAction');
const JoinedAction = require('./actions/JoinedAction');
const ZoomAcountInputAction = require('./actions/ZoomAcountInputAction');
const ZoomAcountConfirmAction = require('./actions/ZoomAcountConfirmAction');
const ZoomAcountSetAction = require('./actions/ZoomAcountSetAction');
const MenuAction = require('./actions/MenuAction');
const DateListAction = require('./actions/DateListAction');
const DateTimeListAction = require('./actions/DateTimeListAction');
const ZoomMeetingCreateAction = require('./actions/ZoomMeetingCreateAction');

const START_STRINGS = [ 'ず', 'Z', 'z', 'Ｚ', 'ｚ' ];

/**
 * ZoomerActionFactoryクラス
 */
module.exports = class ZoomerActionFactory {
  constructor() {
    this.messageReceiver = new MessageReceiver();
  }

  /**
   * シナリオ作成して返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {object} シナリオオブジェクト
   */
  create(callbackEvent) {
    if (this.messageReceiver.isBotStartEvent(callbackEvent)) {
      return [ new StartAction(callbackEvent) ];
    }

    if (this.messageReceiver.isBotJoinEvent(callbackEvent)) {
      return [ new JoinAction(callbackEvent) ]
    }

    if (this.messageReceiver.isBotJoinedEvent(callbackEvent)) {
      return [ new JoinedAction(callbackEvent) ];
    }

    const sessionRepos = new SessionRepository();
    const sessionId = this.getRoomId(callbackEvent);
    let session = sessionRepos.get(sessionId);

    if (this.isZoomerStartEvent(callbackEvent)) {
      if (this.checkZoomAccountId(session)) {
        return [ new ZoomAcountConfirmAction(callbackEvent) ];
      }
      return [ new ZoomAcountInputAction(callbackEvent) ];
    }

    if (this.waitingForZoomAcountIdInput(session)) {
      if (this.messageReceiver.isTextMessageAndPostBackEvent(callbackEvent)) {
        return [ new ZoomAcountInputAction(callbackEvent) ];
      }
      return [ new ZoomAcountSetAction(callbackEvent), new MenuAction(callbackEvent) ];
    }

    if ((session && !session.zoomAccountId)
      || this.isSendZoomAccountInputEvent(callbackEvent)) {
      return [ new ZoomAcountInputAction(callbackEvent) ];
    }

    if (this.checkZoomAccountId(session)
      && this.isSendMenuEvent(callbackEvent)) {
      return [ new MenuAction(callbackEvent) ];
    }

    if (this.checkZoomAccountId(session)
      && (this.isCreateMeetingEvent(callbackEvent)
      || this.canCreateMetting(callbackEvent, session))) {
      return [ new ZoomMeetingCreateAction(callbackEvent) ];
    }

    if (this.checkZoomAccountId(session) 
      && this.isSendDateEvent(callbackEvent)) {
      return [ new DateListAction(callbackEvent) ];
    }

    if (this.checkZoomAccountId(session) 
      && (this.isSendDateTimeEvent(callbackEvent)
      || this.needTime(callbackEvent, session))) {
      return [ new DateTimeListAction(callbackEvent) ];
    }
}

  /**
   * 送信先ルームIDもしくはアカウントIDを取得します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   */
  getRoomId(callbackEvent) {
    if (callbackEvent.source.roomId) {
      return callbackEvent.source.roomId;
    } else {
      // トークルームIDがない場合はBotとユーザーとの1:1のチャットです。
      return callbackEvent.source.accountId;
    }
  }

  /**
   * 開始メニューイベントの場合はtrueを返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} 開始メニューイベントの場合はtrue、それ以外はfalse
   */
  isZoomerStartEvent(callbackEvent) {
    if (this.messageReceiver.isTextMessageEvent(
      callbackEvent,
      text => START_STRINGS.some(s => s === text))) {
        return true;
    }
    return false;
  }

  /**
   * ZoomアカウントIDが設定されている場合はtrueを返します。
   * @param {object} session セッション情報
   * @return {boolean} ZoomアカウントIDが設定されている場合はtrue、それ以外はfalse
   */
  checkZoomAccountId(session) {
    return session && session.zoomAccountId;
  }

  /**
   * ZoomアカウントID入力待ちの場合はtrueを返します。
   * @param {object} session セッション情報
   * @return {boolean} ZoomアカウントID入力待ちの場合はtrue、それ以外はfalse
   */
  waitingForZoomAcountIdInput(session) {
    return session && session.waitingForZoomAcountIdInput;
  }

  /**
   * 時間の設定が必要な場合はtrueを返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @param {object} session セッション情報
   * @return {boolean} 時間の設定が必要な場合はtrue、それ以外はfalse
   */
  needTime(callbackEvent, session) {
    return this.messageReceiver.isTextMessageAndPostBackEvent(callbackEvent) 
      && session && !session.startDate;
  }

  /**
   * Zoomミーティングが作成できる場合はtrueを返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @param {object} session セッション情報
   * @return {boolean} Zoomミーティングが作成できる場合はtrue、それ以外はfalse
   */
  canCreateMetting(callbackEvent, session) {
    return this.messageReceiver.isTextMessageAndPostBackEvent(callbackEvent) 
      && session && session.startDate;
  }

  /**
   * ミーティング作成イベントの場合はtrueを返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} ミーティング作成イベントの場合はtrue、それ以外はfalse
   */
  isSendZoomAccountInputEvent(callbackEvent) {
    if (this.messageReceiver.isTextMessageAndPostBackEvent(
      callbackEvent,
      postback => postback === `zoomAccountInput`)) {
      return true;
    }
    return false;
  }

  /**
   * 時間選択イベントの場合はtrueを返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} 時間選択イベントの場合はtrue、それ以外はfalse
   */
  isSendMenuEvent(callbackEvent) {
    if (this.messageReceiver.isTextMessageAndPostBackEvent(
      callbackEvent,
      postback => postback === 'menu')) {
      return true;
    }
    return false;
  }

  /**
   * 日付選択イベントの場合はtrueを返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} 日付選択イベントの場合はtrue、それ以外はfalse
   */
  isSendDateEvent(callbackEvent) {
    if (this.messageReceiver.isTextMessageAndPostBackEvent(
      callbackEvent,
      postback => postback.startsWith('dateList'))) {
      return true;
    }
    return false;
  }

  /**
   * 時間選択イベントの場合はtrueを返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} 時間選択イベントの場合はtrue、それ以外はfalse
   */
  isSendDateTimeEvent(callbackEvent) {
    if (this.messageReceiver.isTextMessageAndPostBackEvent(
      callbackEvent,
      postback => postback.startsWith('dateTimeList'))) {
      return true;
    }
    return false;
  }

  /**
   * ミーティング作成イベントの場合はtrueを返します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @return {boolean} ミーティング作成イベントの場合はtrue、それ以外はfalse
   */
  isCreateMeetingEvent(callbackEvent) {
    if (this.messageReceiver.isTextMessageAndPostBackEvent(
      callbackEvent,
      postback => postback.startsWith('meetingCreate'))) {
      return true;
    }
    return false;
  }

  /**
   * エラーアクションを実行します。
   * @param {object} callbackEvent リクエストのコールバックイベント
   * @param {object} error エラー
   */
  async error(callbackEvent, error) {
    const errorAction = new ErrorAction(callbackEvent);
    await errorAction.execute(error);
  }
}