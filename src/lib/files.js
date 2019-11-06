import findRoot from 'find-root';

export function fullPath(path) {
  return `${findRoot(__dirname)}/docs/${path}`;
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
const LOC_PATH_DIST_ANALY_PATH = fullPath('loc_PathDist_analy.xlsx');
const LOC_PATH_DIST_DETAIL_PATH = fullPath('loc_PathDist_detail.xlsx');
const LOC_DAILY_ASSIGN_COST_PATH = fullPath('loc_DailyAssign_cost.xlsx');
const LOC_DAILY_ASSIGN_DETAIL_PATH = fullPath('loc_DailyAssign_detail.xlsx');
const LOC_COST_SENS_PATH = fullPath('loc_Costsens.xlsx');
const TAXI_COST_PATH = fullPath('taxiCost.xlsx');

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
};
