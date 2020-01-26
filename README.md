# Preliminary
* install git
* GitHub repository: https://github.com/chunfu/nec-backend/
* Make sure fill in Google API Key: `src/lib/const.js`

# How to start up the project
1. get latest code: `git pull origin master`
1. install libs: `npm i`
1. start server: `npm start`

# Where the files being stored
1. xlsx files: `dist/docs/`
1. python modules: `dist/modules/`

# 系統架構
* src/lib/const.js google map api key 存放位置
* src/lib/files.js 檔案存放位置及檔名設定
* src/api 資料夾存放所有後端 api 實作
  * ./pos/movetime.js
車行時間 api
  * ./pos/sla.js 調整 sla api
  * ./pos/optimal.js 服務據點最佳化 api
  * ./pos/locations.js 保留據點選項
  * ./car/path.js 還原工作服務路徑 api
  * ./car/optimal.js 最佳化 api
  * ./car/sensitivity.js 敏感度分析  api
  * ./car/locations.js 據點選擇選項

* frontend/src/components 資料夾存放畫面實作
  * ./Pos/DrivingTimeStep.js 車行時間畫面
  * ./Pos/ParameterStep.js 參數設定畫面
  * ./Pos/FileStep.js 讀取資料畫面
  * ./Pos/SLAStep.js 調整 SLA 畫面
  * ./Pos/ResultStep.js 輸出結果畫面

  * ./Cars/FileStep.js 檔案讀取畫面
  * ./Cars/ParameterStep.js 參數設定畫面
  * ./Cars/InfoStep.js 路徑資訊畫面
  * ./Cars/ResultStep.js 輸出結果畫面
  * ./Cars/AllSensitivityStep.js 全部敏感度分析畫面