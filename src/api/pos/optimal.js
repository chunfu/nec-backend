import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
import * as path from 'path';
const execAsync = util.promisify(exec);

import { excel2json } from '../../lib/util';
import * as futil from '../../lib/files';

const getOptimal = async (req, res) => {
  const {
    files,
    body: { oilprice, reservationSite, otherLocation },
  } = req;

  try {
    if (!files) throw new Error('無上傳任何檔案');
    const { siteInfo, historyCalls, expectedCalls } = files;
    // error handling here
    if (!siteInfo) throw new Error('各據點成本限制 未上傳');
    if (!historyCalls) throw new Error('各據點歷年員工數與服務次數 未上傳');
    if (!expectedCalls) throw new Error('各客戶預期未來年服務次數 未上傳');
    if (!oilprice) throw new Error('油錢未指定');
    if (!reservationSite) throw new Error('必須保留據點未指定');

    const rs = reservationSite
      .split(',')
      .map(rs => `'${rs}'`)
      .join(',');
    // save files on server
    Object.values(files).forEach(f => f.mv(futil.fullPath(f.name)));
    const { stdout, stderr } = await execAsync(
      `cd ${futil.projectRoot}/modules && python -c "import optModel; optModel.optModel(${oilprice}, [${rs}], '${futil.REACHABLE_PATH}', '${futil.NEED_ADJUST_OK_PATH}', '${futil.MOVETIME_FILE_PATH}', '${futil.EXPECTED_CALLS_PATH}', '${futil.HISTORY_CALLS_PATH}', '${futil.SITE_INFO_PATH}', '${futil.OFFICE_MAPPING_PATH}')"`,
    );

    const [rows] = excel2json(futil.SITE_PATH);
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));
    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

const getOptimalDetail = async (req, res) => {
  const { officeName } = req.params;
  try {
    if (!officeName) throw new Error('officeName is not passed');
    let [rows] = excel2json(futil.ASSIGN_PATH);
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));
    rows = rows.filter(({ 指派據點 }) => 指派據點 === officeName);
    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

export { getOptimal, getOptimalDetail };
