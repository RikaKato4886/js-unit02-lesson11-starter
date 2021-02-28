import moment from 'moment';
import App from '../src/index';
import template from './template';

describe('App.getHistory', () => {
  test('it should return collection', () => {
    const startOfToday = moment().startOf('day');
    const val1 = moment(startOfToday).subtract(5, 'days').add(30, 'minutes').valueOf();
    const val2 = moment(startOfToday).subtract(5, 'days').add(60, 'minutes').valueOf();
    const collection = [val1, val2];
    localStorage.setItem('intervalData', JSON.stringify(collection));
    expect(App.getHistory()).toContain(val1);
    localStorage.clear();
  });
});

describe('removeOldHistory', () => {
  test('old history を削除する', () => {
    const startOfToday = moment().startOf('day');
    const val1 = moment(startOfToday).subtract(8, 'days').add(30, 'minutes').valueOf();
    const val2 = moment(startOfToday).subtract(5, 'days').add(60, 'minutes').valueOf();
    const collection = [val1, val2];
    document.body.innerHTML = template;
    const app = new App();
    localStorage.setItem('intervalData', JSON.stringify(collection));
    app.removeOldHistory();
    expect(App.getHistory()).not.toContain(val1);
    expect(App.getHistory()).toContain(val2);
    localStorage.clear();
  });
});

describe('saveIntervalData', () => {
  test('it should save array of items', () => {
    document.body.innerHTML = template;
    const app = new App();
    const startOfToday = moment().startOf('day');
    const item = moment(startOfToday).subtract(5, 'days').add(60, 'minutes');
    app.saveIntervalData(item);
    expect(JSON.parse(localStorage.getItem('intervalData'))).toContain(item.valueOf());
    localStorage.clear();
  });
});

describe('startTimer', () => {
  test('スタートボタンを押せないようにする', () => {
    document.body.innerHTML = template;
    const app = new App();
    app.startTimer();
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    expect(startButton.disabled).toEqual(true);
    expect(stopButton.disabled).toEqual(false);
    expect(app.isTimerStopped).toEqual(false);
  });
  test('startAtとendAtを適切に設定する。', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    app.startTimer(null, now);
    expect(app.startAt.valueOf()).toEqual(now.valueOf());
    expect(app.endAt.valueOf()).toEqual(now.add(25, 'minutes').valueOf());
  });
  test('一時停止後にスタートする際に、止まっていた時間をendAtに追加する', () => {
    // pause中の状態にする
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.pauseButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(25, 'minutes');
    // 10分後に止めるとする
    app.pausedAt = moment(startOfToday).add(10, 'minutes');
    //  スタートは25分後、つまり15分止まっている
    app.startTimer(moment(startOfToday).add(25, 'minutes'));
    // ??? endAtに止まっていた時間をたす-25に15をたす??
    expect(app.onPause).toBeFalsy();
    expect(app.endAt.valueOf()).toEqual(moment(startOfToday).add(45, 'minutes'));
  });
});

describe('updateTimer', () => {
  test('タイマーが表示されているか確認', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(25, 'minutes');
    app.updateTimer(moment(startOfToday).add(10, 'seconds'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('24:50');
  });

  test('作業が終わったら5分休憩時間に切り替える', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    // 作業中の状態を作り出す。
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    const endAt = moment(startOfToday).add(25, 'minutes');
    app.endAt = endAt;
    // 終了時間から100ms後でテストする
    app.updateTimer(moment(startOfToday).add(25, 'minutes').add(100, 'millisecond'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('5:00');
    expect(app.onWork).not.toBeTruthy();
    expect(app.getHistory()).toEqual([endAt.add(100, 'millisecond').valueOf()]);
    expect(app.tempCycles).toEqual(1);
  });

  test('作業が終わったら15分休憩時間に切り替える', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    // 作業中の状態を作り出す。
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.tempCycles = 3;
    app.startAt = startOfToday;
    const endAt = moment(startOfToday).add(25, 'minutes');
    app.endAt = endAt;
    // 終了時間から100ms後でテストする
    app.updateTimer(moment(startOfToday).add(25, 'minutes').add(100, 'millisecond'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('15:00');
    expect(app.onWork).not.toBeTruthy();
    expect(app.tempCycles).toEqual(0);
  });

  test('休憩時間から作業時間に表示を切り返す', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.onWork = false;
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(5, 'minutes');
    app.updateTimer(moment(startOfToday).add(5, 'minutes').add(100, 'millisecond'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('25:00');
    expect(app.onWork).toBeTruthy();
  });
});

describe('stopTimer', () => {
  test('タイマーをリセットする', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(now).add(20, 'minutes');
    app.stopTimer();
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('25:00');
    expect(app.onWork).toBeTruthy();
    expect(app.isTimerStopped).toBeTruthy();
    expect(app.startButton.disabled).not.toBeTruthy();
  });
});

describe('displayTime', () => {
  test('初期化時に25:00を表示する。', () => {
    document.body.innerHTML = template;
    const app = new App();
    const timeDisplay = document.getElementById('time-display');
    expect(app.isTimerStopped).toBeTruthy();
    expect(timeDisplay.innerHTML).toEqual('25:00');
  });

  test('カウントダウン出来ているか確認する', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(25, 'minutes');
    app.displayTime(moment(startOfToday).add(51, 'seconds'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('24:09');
  });
});

describe('displayCyclesToday', () => {
  test('当日の完了した作業サイクル数を表示する。', () => {
    document.body.innerHTML = template;
    const app = new App();
    const startOfToday = moment().startOf('day');
    const time = moment(startOfToday).add(5, 'hours');
    const val1 = moment(startOfToday).add(30, 'minutes').valueOf();
    const val2 = moment(startOfToday).add(60, 'minutes').valueOf();
    const collection = [val1, val2];
    localStorage.setItem('intervalData', JSON.stringify(collection));
    app.displayCyclesToday(time);
    const countToday = document.getElementById('count-today');
    const percentToday = document.getElementById('percent-today');
    expect(countToday.innerHTML).toEqual('2回 / 4回');
    expect(percentToday.innerHTML).toEqual('目標を50％達成中です。');
    localStorage.clear();
  });
});

describe('displayHistory', () => {
  test('it should show the numbrer of finished work sessions up to 7 days ago', () => {
    document.body.innerHTML = template;
    const startOfToday = moment().startOf('day');
    const SevenDaysAgo = moment(startOfToday).subtract(7, 'days');
    const val1 = moment(SevenDaysAgo).add(50, 'minutes').valueOf();
    const val2 = moment(SevenDaysAgo).add(80, 'minutes').valueOf();
    const val3 = moment(SevenDaysAgo).add(2, 'days').add('3', 'hours').valueOf();
    const val4 = moment(SevenDaysAgo)
      .add(3, 'days')
      .add('2', 'hours')
      .valueOf();
    const collection = [val1, val2, val3, val4];
    localStorage.setItem('intervalData', JSON.stringify(collection));
    const app = new App();
    const sevenDaysAgoTh = document.getElementsByTagName('th')[0];
    const fiveDaysAgoTh = document.getElementsByTagName('th')[2];
    const sevenDaysAgoTd = document.getElementsByTagName('td')[0];
    const fiveDaysAgoTd = document.getElementsByTagName('td')[2];
    expect(sevenDaysAgoTh.innerHTML).toEqual(SevenDaysAgo.format('MM月DD日'));
    expect(fiveDaysAgoTh.innerHTML).toEqual(SevenDaysAgo.add(2, 'days').format('MM月DD日'));
    expect(sevenDaysAgoTd.innerHTML).toEqual('2回<br>達成率50%');
    expect(fiveDaysAgoTd.innerHTML).toEqual('1回<br>達成率25%');
    expect(app.getHistory().length).toEqual(4);
    localStorage.clear();
  });
});

describe('pauseTimer', () => {
  test('タイマーが止まっているか確認', () => {
    // 作業中の状態を作り出す。
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    // スタートボタンが押されている
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.pauseButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = moment(startOfToday);
    app.endAt = moment(now).add(20, 'minutes');
    app.pauseTimer();
    expect(app.timerUpdater).toBeTruthy();
    expect(app.pauseAt).toBeTruthy();
    expect(app.startButton.disabled).not.toBeTruthy();
  });
});
