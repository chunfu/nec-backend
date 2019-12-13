import findRoot from 'find-root';

export const projectRoot = findRoot(__dirname).replace(/\\/g, '/');

export function fullPath(path) {
  return `${projectRoot}/docs/${path}`;
}

const MOVETIME_FILE_PATH = fullPath('movetime.xlsx');
const OFFICE_MAPPING_PATH = fullPath('officeMapping.xlsx');
const NEED_ADJUST_PATH = fullPath('needAdjust.xlsx');
const NEED_ADJUST_OK_PATH = fullPath('needAdjustOK.xlsx');
const REACHABLE_PATH = fullPath('reachable.xlsx');
const EXPECTED_CALLS_PATH = fullPath('expectedCalls.xlsx');
const HISTORY_CALLS_PATH = fullPath('historyCalls.xlsx');
const SITE_INFO_PATH = fullPath('siteInfo.xlsx');
const SITE_PATH = fullPath('site.xlsx');
const ASSIGN_PATH = fullPath('assign.xlsx');
const MR_DATA_PATH = fullPath('mrData.xlsx');
const WORKER_DATA_PATH = fullPath('workerData.xlsx');
const OFFICE_ADDRESS_PATH = fullPath('officeAddress.xlsx');
const LOC_PATH_DIST_ANALY_PATH = location =>
  fullPath(`${location}_PathDist_analy.xlsx`);
const LOC_PATH_DIST_DETAIL_PATH = location =>
  fullPath(`${location}_PathDist_detail.xlsx`);
const LOC_DAILY_ASSIGN_COST_PATH = location =>
  fullPath(`${location}_DailyAssign_cost.xlsx`);
const LOC_DAILY_ASSIGN_DETAIL_PATH = location =>
  fullPath(`${location}_DailyAssign_detail.xlsx`);
const LOC_COST_SENS_PATH = location =>
  fullPath(`${location}_PriceSens_cost.xlsx`);
const TAXI_COST_PATH = fullPath('taxiCost.xlsx');
const CAROPT_CONCLUSION_PATH = location =>
  fullPath(`${location}_CarOpt_Conclusion.txt`);
const PRICE_SENS_FINAL_PATH = fullPath('PriceSens_final.xlsx');

export {
  MOVETIME_FILE_PATH,
  OFFICE_MAPPING_PATH,
  NEED_ADJUST_PATH,
  NEED_ADJUST_OK_PATH,
  REACHABLE_PATH,
  EXPECTED_CALLS_PATH,
  HISTORY_CALLS_PATH,
  SITE_INFO_PATH,
  SITE_PATH,
  ASSIGN_PATH,
  MR_DATA_PATH,
  WORKER_DATA_PATH,
  OFFICE_ADDRESS_PATH,
  LOC_PATH_DIST_ANALY_PATH,
  LOC_PATH_DIST_DETAIL_PATH,
  LOC_DAILY_ASSIGN_COST_PATH,
  LOC_DAILY_ASSIGN_DETAIL_PATH,
  LOC_COST_SENS_PATH,
  TAXI_COST_PATH,
  CAROPT_CONCLUSION_PATH,
  PRICE_SENS_FINAL_PATH,
};
