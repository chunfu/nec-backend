import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
import * as path from 'path';
const execAsync = util.promisify(exec);

import { excel2json } from '../../lib/util';

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
      .map(rs => `"${rs}"`)
      .join(',');
    // save files on server
    Object.values(files).forEach(f => f.mv(`./${f.name}`));
    const { stdout, stderr } = await execAsync(
      `python -c 'import optModel; optModel.optModel(${oilprice}, [${rs}], "reachable.xlsx", "needAdjustOK.xlsx", "movetime.xlsx", "expectedCalls.xlsx", "historyCalls.xlsx", "siteInfo.xlsx", "officeMapping.xlsx")'`,
    );

    const [rows] = excel2json('./site.xlsx');
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
    let [rows] = excel2json('./assign.xlsx');
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));
    rows = rows.filter(({ assignSite }) => assignSite === officeName);
    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

export { getOptimal, getOptimalDetail };
