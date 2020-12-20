const jwt = require('jsonwebtoken');
const request = require('request');

/**
 * ServerTokenManagerクラス
 */
module.exports = class ServerTokenManager {
  /**
   * DBがないのでとりあえずグローバル変数で管理
   */
  static TOKEN = null;

  /**
   * LINE WORKS から Serverトークンを取得します。
   * @return {string} Serverトークン
   */
  async getToken() {
    const jwtData = await this._createJWT();
    // 注意:
    // 本番稼働時は、取得したServerトークンを NoSQL データベース等に保持し、
    // 有効期限が過ぎた場合にのみ、再度 LINE WORKS から取得するように実装してください。
    if (this.constructor.TOKEN) {
      // スレッドセーフではない。
      return this.constructor.TOKEN;
    }

    const postdata = {
      url: `https://authapi.worksmobile.com/b/${process.env.API_ID}/server/token`,
      headers : {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      form: {
        grant_type: encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer'),
        assertion: jwtData
      }
    };

    return new Promise((resolve, reject) => {
      // LINE WORKS から Serverトークンを取得リクエスト
      request.post(postdata, (error, response, body) => {
        if (error) {
          console.log('ServerTokenManager getToken error');
          reject(error);
        } else {
          this.constructor.TOKEN = JSON.parse(body).access_token;
          resolve(this.constructor.TOKEN);
        }
      });
    });
  }

  /**
   * JWTを作成します。
   * @return {string} JWT
   */
  _createJWT() {
    const iss = process.env.SERVER_ID;
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60;
    const cert = process.env.PRIVATE_KEY;

    return new Promise((resolve, reject) => {
      jwt.sign({ iss: iss, iat: iat, exp: exp }, cert, { algorithm: 'RS256' }, (error, jwtData) => {
        if (error) {
          console.log('createJWT error');
          reject(error);
        } else {
          resolve(jwtData);
        }
      });
    });
  }
}