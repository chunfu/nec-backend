import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

import { excel2json } from '../../lib/util';

const getPath = async (req, res) => {
  const {
    files,
    body: { office },
  } = req;
  try {
    /*
    if (!files) throw new Error('無上傳任何檔案');
    const { mrData, workerData, officeAddress } = files;
    // error handling here
    if (!mrData) throw new Error('年度歷史工作紀錄 未上傳');
    if (!workerData) throw new Error('年度員工服務紀錄 未上傳');
    if (!officeAddress) throw new Error('各據點地址資訊 未上傳');
    if (!office) throw new Error('據點未指定');
    Object.values(files).forEach(f => f.mv(`./${f.name}`));
    */
    /*
    const { stdout, stderr } = await execAsync(
      `python -c "import NEC_OptCCModel1_PathDist; NEC_OptCCModel1_PathDist.PathDist('mrData.xlsx', 'workerData.xlsx', 'officeAddress.xlsx', '${office}')"`,
    );
    */

    // output 2 files: pathDistDetail.xlsx, pathDistAnaly.xlsx
    const [rows] = excel2json('./loc_PathDist_analy.xlsx');
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));

    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

const getPathDetail = async (req, res) => {
  const {
    params: { pathId },
  } = req;
  try {
    if (!pathId) throw new Error('Path Id is not passed');

    // output 2 files: loc_DailyAssign_cost, loc_DailyAssign_detail
    const workbook = xlsx.readFile('./loc_PathDist_detail.xlsx');
    const wsname = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsname];
    let rows = xlsx.utils.sheet_to_json(ws);
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));
    // ccn is string, CCcars_num is integer
    rows = rows.filter(({ Unique_PathID }) => Unique_PathID === pathId);

    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }};

export { getPath, getPathDetail };
