const moment = require("moment");
const BaseAction = require('./BaseAction');
const BotMessageSender = require('../lineworks/bot/MessageSender');
const ZoomMeetingCreator = require('../zoom/MeetingCreator');
const SessionRepository = require('../repositories/SessionRepository');

/**
 * ZoomMeetingCreateActionクラス
 */
module.exports = class ZoomMeetingCreateAction extends BaseAction {
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
    var postbackTime = this.callbackEvent.content.postback;

    const sessionRepos = new SessionRepository();
    let session = sessionRepos.get(this.getRoomId());

    const meetingCreator = new ZoomMeetingCreator();
    let startDateTime = null;
    if (postbackTime) {
      if (session.startDate) {
        startDateTime = moment(`${session.startDate}T${postbackTime}`);
      } else {
        startDateTime = moment(`${moment().format('YYYYY-MM-DD')}T${postbackTime}`);
      }
    }
    if (!startDateTime.isValid()) {
      startDateTime = null;
    }
    
    const res = await meetingCreator.create(session.zoomAccountId, startDateTime);
    console.log(res);
    let message1 = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.text,
        text: `Zoomミーティングを${session.zoomAccountId}で登録しました。\nHostのURLはこちら。`,
      }
    };
    this.setMessageTo(message1);

    let message2 = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.text,
        text: `${res.start_url}`,
      }
    };
    this.setMessageTo(message2);

    let message3 = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.text,
        text: `招待のURLはこちら。`,
      }
    };
    this.setMessageTo(message3);

    let message4 = {
      content: {
        type: BotMessageSender.MESSAGE_CONTENT_TYPE.text,
        text: `${res.join_url}`,
      }
    };
    this.setMessageTo(message4);

    const sender = new BotMessageSender();
    await sender.send([ message1, message2, message3, message4 ]);

    session.startDate = null;
    session.waitingForZoomAcountIdInput = false;
    sessionRepos.save(session);
  }
}