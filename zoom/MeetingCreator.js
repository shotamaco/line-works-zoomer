const moment = require("moment");
const Promise = require("promise");
const request = require("request-promise");
const jwt = require('jsonwebtoken');

/**
 * MeetingCreatorクラス
 */
module.exports = class MeetingCreator {
  /**
   * Zoomのミーティングを作成し結果を返します。
   * @param {string} zoomAccountId ZoomアカウントID
   * @param {string} startDateTime ミーティング開始日時
   * @return {object} ミーティング作成結果オブジェクト
   */
  async create(zoomAccountId, startDateTime) {
    let json = {
      topic: 'LINE WORKS ZOOM連携',
      type: 1, 
      time_zone: 'Asia/Tokyo',
      agenda: 'LINE WORKS ZOOM連携してみる',
      settings: {
        host_video: true,
        participant_video: true,
        approval_type: 0,
        audio: 'both',
        enforce_login: false,
        waiting_room: false,
        registrants_email_notification: false
      }
    };

    if (startDateTime) {
      json.type = 2;
      json.start_time = startDateTime;
    }

    const payload = {
      iss: process.env.ZOOM_API_KEY,
      exp: ((new Date()).getTime() + 5000)
    };
    const token = jwt.sign(payload, process.env.ZOOM_API_SECRET);

    const options = {
      method: "POST",
      url: `https://api.zoom.us/v2/users/${zoomAccountId}/meetings`,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      json : json
    };

    return new Promise((resolve, reject) => {
      request(options)
        .then((res) => {
          console.log(res);
          resolve(res);
        })
        .catch((error) => {
          console.log(`ERROR: ${error}`);
          reject(error);
        });
    });
  }
};