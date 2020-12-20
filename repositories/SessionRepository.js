/**
 * SessionRepositoryクラス
 */
module.exports = class SessionRepository {
  /**
   * DBがないのでとりあえずグローバル変数で管理
   */
  static SESSIONS = new Map();

  /**
   * セッション情報を作成して返します
   * @param {string} セッションID
   * @return {object} セッション情報
   */
  static create(sessionId) {
    return { 
      id: sessionId,
      startDate: null,
      zoomAccountId: null,
      waitingForZoomAcountIdInput: false
    };
  }

  /**
   * セッション情報を取得します。
   * @param {string} セッションID
   * @return {object} セッション情報
   */
  get(sessionId) {
    return this.constructor.SESSIONS[sessionId];
  }

  /**
   * セッション情報を保存します。
   * @return {object} セッション情報
   */
  save(session) {
    this.constructor.SESSIONS[session.id] = session;
  }
};