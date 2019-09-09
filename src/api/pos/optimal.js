import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

const getOptimal = async (req, res) => {
  res.json({ msg: 1});
};

export { getOptimal };

