import * as xlsx from 'xlsx';
import { OFFICE_ADDRESS_PATH } from '../../lib/files';

const getCarLocations = async (req, res) => {
  const omWorkBook = xlsx.readFile(OFFICE_ADDRESS_PATH);
  const omSheetName = omWorkBook.SheetNames[0];
  const omSheet = omWorkBook.Sheets[omSheetName];
  const officeAddressesList = xlsx.utils.sheet_to_json(omSheet);
  res.json(officeAddressesList);
};

export { getCarLocations };
