import * as xlsx from 'xlsx';
import { OFFICE_MAPPING_PATH } from '../../lib/files';

const getLocations = async (req, res) => {
  // add new office address to officeMapping file
  const omWorkBook = xlsx.readFile(OFFICE_MAPPING_PATH);
  const omSheetName = omWorkBook.SheetNames[0];
  const omSheet = omWorkBook.Sheets[omSheetName];
  const officeAddressesList = xlsx.utils.sheet_to_json(omSheet);
  res.json(officeAddressesList);
};

export { getLocations };
