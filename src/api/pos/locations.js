import * as xlsx from 'xlsx';

const getLocations = async (req, res) => {
  // add new office address to officeMapping file
  const omWorkBook = xlsx.readFile('./officeMapping.xlsx');
  const omSheetName = omWorkBook.SheetNames[0];
  const omSheet = omWorkBook.Sheets[omSheetName];
  const officeAddressesList = xlsx.utils.sheet_to_json(omSheet);
  res.json(officeAddressesList);
};

export { getLocations };
