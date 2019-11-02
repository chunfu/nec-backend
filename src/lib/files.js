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
const SITE_PATH = fullPath('./site.xlsx');
const ASSIGN_PATH = fullPath('./assign.xlsx');

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
};
