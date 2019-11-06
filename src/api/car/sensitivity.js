import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

import * as futil from '../../lib/files';
import { excel2json } from '../../lib/util';

const getSensitivity = async (req, res) => {
  const {
    query: {
      comapnyCarNumber = '', // CCcars_num
      privateCarNumber = '', // PCcars_num
      privateCarDistance = '', // basic_Mileage
      comapnyCarAnnualCost = '', // CCcars_Rent
    },
  } = req;
  try {
    // error handling here
    if (!comapnyCarNumber) throw new Error('目前據點社車供應 未指定');
    if (!privateCarNumber) throw new Error('目前據點私車供應 未指定');
    if (!comapnyCarAnnualCost) throw new Error('社車年租賃費用 未指定');
    if (!privateCarDistance) throw new Error('私車基本里程數 未指定');
    // loc_DailyAssign_detail.xlsx
    const { stdout, stderr } = await execAsync(
      `cd modules && python -c "import NEC_OptCCModel3_PPcarsPS; NEC_OptCCModel3_PPcarsPS.PPcarsPS(${comapnyCarNumber}, ${privateCarNumber}, ${privateCarDistance}, ${comapnyCarAnnualCost}, '${futil.LOC_DAILY_ASSIGN_DETAIL_PATH}')"`,
    );

    // output 2 files: loc_DailyAssign_cost, loc_DailyAssign_detail
    const [rows] = excel2json(futil.LOC_COST_SENS_PATH);
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));

    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

export { getSensitivity };
