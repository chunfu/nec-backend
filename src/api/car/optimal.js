import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
const execAsync = util.promisify(exec);

import * as futil from '../../lib/files';
import { excel2json } from '../../lib/util';

const getOptimal = async (req, res) => {
  const {
    files,
    body: {
      restTime = '', // works_buffer
      comapnyCarFuelConsumption = '', // CCcars_Fuel
      privateCarDistance = '', // basic_Mileage
      privateCarBonus = '', // below_PCcarsFuel
      privateCarExtraBonus = '', // upper_PCcarsFuel
      office = '', // office
    },
  } = req;
  try {
    if (!files) throw new Error('無上傳任何檔案');
    const { taxiCost } = files;
    // error handling here
    if (!taxiCost) throw new Error('年度歷史工作紀錄 未上傳');
    if (!restTime) throw new Error('車輛工作間隔時間下限 未指定');
    if (!comapnyCarFuelConsumption) throw new Error('社車每單位行使油耗 未指定');
    if (!privateCarDistance) throw new Error('私車基本里程數 未指定');
    if (!privateCarBonus) throw new Error('私車基本里程數內單位補貼 未指定');
    if (!privateCarExtraBonus) throw new Error('私車基本里程數外單位補貼 未指定');
    if (!office) throw new Error('據點 未指定');
    Object.values(files).forEach(f => f.mv(futil.fullPath(f.name)));
    const { stdout, stderr } = await execAsync(
      `cd ${futil.projectRoot}/modules && python -c "import NEC_OptCCModel_2_OptModule; NEC_OptCCModel_2_OptModule.OptModel(${restTime}, ${comapnyCarFuelConsumption}, ${privateCarDistance}, ${privateCarBonus}, ${privateCarExtraBonus}, '${office}', '${futil.TAXI_COST_PATH}', '${futil.OFFICE_ADDRESS_PATH}', '${futil.LOC_PATH_DIST_ANALY_PATH(office)}')"`,
    );

    // read CarOpt_Conclusion.txt
    var text = fs.readFileSync(futil.CAROPT_CONCLUSION_PATH(office), "utf-8");

    // output 2 files: loc_DailyAssign_cost, loc_DailyAssign_detail
    const [rows] = excel2json(futil.LOC_DAILY_ASSIGN_COST_PATH(office));
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));

    res.json({ columns, rows, messages: text.split('\n') });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

const getOptimalDetail = async (req, res) => {
  const {
    params: { ccn },
    query: { office },
  } = req;
  try {
    const ccnInt = parseInt(ccn, 10);
    if (ccnInt === NaN) throw new Error('Company car number is not a number');

    // output 2 files: loc_DailyAssign_cost, loc_DailyAssign_detail
    let [rows] = excel2json(futil.LOC_DAILY_ASSIGN_DETAIL_PATH(office));
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));
    // ccn is string, CCcars_num is integer
    rows = rows.filter(({ CCcars_num }) => CCcars_num === ccnInt);

    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

export { getOptimal, getOptimalDetail };
