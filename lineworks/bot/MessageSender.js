const request = require('request');
const ServerTokenManager = require('../ServerTokenManager');

/**
 * MessageServiceクラス
 */
module.exports = class MessageSender {
  /**
   * 初期化します。
   */
  constructor() {
    this.tokenManager = new ServerTokenManager();
  }

  /**
   * メッセージコンテンツタイプ
   */
  static get MESSAGE_CONTENT_TYPE() {
    return {
      /**
       * テキスト
       */
      text : 'text',
      /**
       * 画像
       */
      image : 'image',
      /**
       * リンク
       */
      link : 'link',
      /**
       * スタンプ
       */
      sticker : 'sticker',
      /**
       * ボタンテンプレート
       */
      buttonTemplate : 'button_template',
      /**
       * リストテンプレート
       */
      listTemplate : 'list_template',
      /**
       * カルーセル
       */
      carousel : 'carousel',
      /**
       * 画像カルーセル
       */
      imageCarousel : 'image_carousel'
    };
  }

  /**
   * メッセージコンテンツタイプ
   */
  static get MESSAGE_CONTENT_ACTION_TYPE() {
    return {
      /**
       * メッセージ
       */
      message : 'message',
      /**
       * URL
       */
      uri: 'uri',
      /**
       * カメラ
       */
      camera: 'camera',
      /**
       * カメラロール
       */
      cameraRoll: 'cameraRoll',
      /**
       * カメラロール
       */
      cameraRoll: 'location'
    };
  }

  /**
   * LINE WORKS にBotメッセージを送信します。
   * @param {object} jsons メッセージ送信するJSONリスト
   */
  async send(jsons) {
    if (!jsons) return;
    const token = await this.tokenManager.getToken();
    for (let i = 0; i < jsons.length; i++) {
      await this._send(this._createRequestOptions(token, jsons[i]));
    }
  }

  /**
   * LINE WORKS に送信するBotメッセージを作成して返します。
   * @param {string} token サーバートークン
   * @param {object} bodyJson Body JSON
   */
  _createRequestOptions(token, bodyJson) {
    return {
      url: `https://apis.worksmobile.com/r/${process.env.API_ID}/message/v1/bot/${process.env.BOT_NO}/message/push`,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        consumerKey: process.env.CONSUMER_KEY,
        Authorization: `Bearer ${token}`
      },
      json: bodyJson
    };
  }

  async _send(options) {
    return new Promise((resolve, reject) => {
      // LINE WORKS にメッセージを送信するリクエスト
      request.post(options, (error, response, body) => {
          if (error) {
            console.log('MessageSender._send error');
            console.log(error);
          }
          console.log(body);
          // 揉み消してます！
          resolve();
      });
    });
  }
}