import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

import * as futil from '../../lib/files';
import { excel2json } from '../../lib/util';

const getSensitivity = async (req, res) => {
  const {
    query: {
      privateCarDistance = '', // basic_Mileage
      office = '',
    },
  } = req;
  try {
    // error handling here
    if (!privateCarDistance) throw new Error('私車基本里程數 未指定');
    if (!office) throw new Error('據點 未指定');
    // loc_DailyAssign_detail.xlsx
    const { stdout, stderr } = await execAsync(
      `cd ${futil.projectRoot}/modules && python -c "import NEC_OptCCModel_3_PPcarsPS; NEC_OptCCModel_3_PPcarsPS.PPcarsPS(${privateCarDistance}, '${office}', '${futil.OFFICE_ADDRESS_PATH}', '${futil.LOC_DAILY_ASSIGN_DETAIL_PATH(office)}')"`,
    );

    // output 2 files: loc_DailyAssign_cost, loc_DailyAssign_detail
    const [rows] = excel2json(futil.LOC_COST_SENS_PATH(office));
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));

    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

const getAllSensitivity = async (req, res) => {
  const {
    body: {
      privateCarDistance = '', // basic_Mileage
      office = '',
    },
  } = req;
  try {
    // error handling here
    if (!privateCarDistance) throw new Error('私車基本里程數 未指定');
    if (!office) throw new Error('據點 未指定');
    /*
    const { stdout, stderr } = await execAsync(
      `cd ${futil.projectRoot}/modules && python -c "import NEC_OptCCModel_3_PPcarsPS; NEC_OptCCModel_3_PPcarsPS.PPcarsPS(${privateCarDistance}, '${office}', '${futil.OFFICE_ADDRESS_PATH}', '${futil.LOC_DAILY_ASSIGN_DETAIL_PATH}')"`,
    );
    */

    // output 2 files: loc_DailyAssign_cost, loc_DailyAssign_detail
    const [rows] = excel2json(futil.LOC_COST_SENS_PATH(office));
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));

    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

export { getSensitivity, getAllSensitivity };
