import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

const getPath = async (req, res) => {
  const {
    files,
    body: { office },
  } = req;
  try {
    if (!files) throw new Error('無上傳任何檔案');
    const { mrData, workerData, officeAddress } = files;
    // error handling here
    if (!mrData) throw new Error('年度歷史工作紀錄 未上傳');
    if (!workerData) throw new Error('年度員工服務紀錄 未上傳');
    if (!officeAddress) throw new Error('各據點地址資訊 未上傳');
    if (!office) throw new Error('據點未指定');
    Object.values(files).forEach(f => f.mv(`./${f.name}`));
    /* Mark it out temporarily
    const { stdout, stderr } = await execAsync(
      `python3 -c 'import NEC_OptCCModel1_PathDist; print NEC_OptCCModel1_PathDist.PathDist("mrData.xlsx", "workerData.xlsx", "officeAddress.xlsx", "${office}")'`,
    );
    */

    // output 2 files: pathDistDetail.xlsx, pathDistAnaly.xlsx
    res.json({ msg: 1 });
  } catch (e) {
    res.status(500).json({ errMsg: e.message });
  }
};

export { getPath };
