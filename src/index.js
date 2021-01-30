// import './assets/scss/styles.scss';
/*
STEP1: Appクラスを作成して、サイトを開いたときにインスタンスが作られるようにする。
STEP2: 初期状態のカウントダウンタイマーの表示(25:00)を行う。
STEP3: タイマーをスタートするためのstartTimerファンクションを作成する。
STEP4: カウントダウン中に表示をアップデートするためのupdateTimerファンクションを作成する。
STEP5: カウントダウンをストップするためのstopTImer関数を作成する。
STEP6: 本日の作業回数を表示する。
STEP7: 過去7日間の作業回数を表示する。
STEP8: アプリ立ち上げ時に7日以上前のデータを削除する。
*/

class App {
  constructor() {
    this.workLength = 25; // 25分間
    this.breakLength = 5; // 5分間
    this.isTimerStopped = true; // 最初はタイマーは止まっている
    this.onWork = true; // 最初は作業からタイマーは始まる
  }


}

// ロード時にAppクラスをインスタンス化する。
window.addEventListener('load', () => new App());

export default App;