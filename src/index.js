import './assets/scss/styles.scss';

const moment = require('moment');

const SECOND = 1000; // 1000ミリ秒
const MINUTE = 60 * SECOND; // 1分のミリ秒数
// const DAY = 24 * 60 * MINUTE; // 1日のミリ秒数

class App {
  constructor() {
    this.workLength = 25; // 25分間
    this.breakLength = 5; // 5分間
    this.isTimerStopped = true; // 最初はタイマーは止まっている
    this.onWork = true; // 最初は作業からタイマーは始まる

    this.timeDisplay = document.getElementById('time-display');
    this.startAt = null; // カウントダウン開始時の時間
    this.endAt = null; // カウントダウン終了時の時間

    this.startTimer = this.startTimer.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.displayTime = this.displayTime.bind(this);

    this.getElements();
    this.toggleEvents();
    this.displayTime();
    // 初期化時にdisplayTimeを呼び出す。
  }

  getElements() {
    this.timeDisplay = document.getElementById('time-display');
    this.startButton = document.getElementById('start-button'); // スタートボタン
    this.stopButton = document.getElementById('stop-button'); // ストップボタン
  }

  updateTimer(time = moment()) {
    this.displayTime(time);
  }

  displayTime(time = moment()) {
    // 残りの分数と秒数を与えるための変数
    let mins;
    let secs;
    if (this.isTimerStopped) {
      mins = this.workLength.toString();
      secs = 0;
    } else {
      const diff = this.endAt.diff(time); // 与えられた時間(通常現在時刻)と、終了時刻との差を取得。差はミリ秒で得られる。
      mins = Math.floor(diff / MINUTE); // 分数を得て、少数点以下の切り捨てを行う
      secs = Math.floor((diff % MINUTE) / 1000); // 秒数を得て、少数点以下の切り捨てを行う
    }
    const minsString = mins.toString();
    let secsString = secs.toString();
    if (secs < 10) {
      secsString = `0${secsString}`;
    }
    this.timeDisplay.innerHTML = `${minsString}:${secsString}`;
  }

  toggleEvents() {
    this.startButton.addEventListener('click', this.startTimer);
  }

  startTimer(e = null, time = moment()) {
    if (e) e.preventDefault();
    this.startButton.disabled = true;
    this.stopButton.disabled = false;
    this.isTimerStopped = false;

    this.startAt = time;
    const startAtClone = moment(this.startAt);
    this.endAt = startAtClone.add(this.workLength, 'minutes');
    // 25分後にendAtを設定する
    this.timerUpdater = window.setInterval(this.updateTimer, 500);
    // タイムラグがあるので、0.5秒ごとにアップデートする。
    this.displayTime();
  }
}

// ロード時にAppクラスをインスタンス化する。
window.addEventListener('load', () => new App());

export default App;
