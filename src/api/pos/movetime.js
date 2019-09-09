import * as xlsx from 'xlsx';
import * as _ from 'lodash';

const MOVETIME_FILE_PATH = './movetime.xlsx';

const gmap = require('@google/maps').createClient({
  key: 'API KEY',
  Promise: Promise,
});

const getMoveTime = (req, res) => {
  const workbook = xlsx.readFile(MOVETIME_FILE_PATH);
  const wsname = workbook.SheetNames[0];
  const ws = workbook.Sheets[wsname];
  const rows = xlsx.utils.sheet_to_json(ws);
  const columns =
    rows.length &&
    Object.keys(rows[0]).map(key => ({ title: key, field: key }));

  res.json({
    columns,
    rows,
  });
};

const calcDuration = async (origins, destinations) => {
  const response = await gmap
    .distanceMatrix({
      origins,
      destinations,
      language: 'zh-TW',
    })
    .asPromise();
  return response;
};

const newCustomerDuration = async ({ columns, rows, newCustomerAddresses }) => {
  try {
    // existing office locations
    const destinations = columns.slice(4);
    // all new addresses from req.body
    const origins = newCustomerAddresses.map(addr => addr.customerAddress);
    let response = await calcDuration(origins, destinations);
    /*
      response.json.rows[0].elements[0].duration.value
      rows === origins
      elements === destinations
      */
    const values = response.json.rows;
    const newAddressRecords = newCustomerAddresses.map((newAddress, i) => {
      const { customerId, customerName, customerAddress } = newAddress;
      const durationArr = values[i].elements.map(e => e.duration.value);
      let newAddressObj = {
        [columns[1]]: customerId,
        [columns[2]]: customerName,
        [columns[3]]: customerAddress,
      };
      return destinations.reduce((acc, col, idx) => {
        acc[col] = durationArr[idx] / 60;
        return acc;
      }, newAddressObj);
    });

    return rows.concat(newAddressRecords);
  } catch (e) {
    console.log(e.stack);
    throw new Error(e.message);
  }
};

const newOfficeDuration = async ({ columns, rows, newOfficeAddresses }) => {
  try {
    // origins is officeAddress
    const origins = rows.map(r => r[columns[3]]);
    // destinations is all customer addresses
    const destinations = newOfficeAddresses.map(addr => addr.officeAddress);

    const response = await calcDuration(origins, destinations);
    const values = response.json.rows;

    return rows.map((row, i) => {
      const durationArr = values[i].elements.map(e => e.duration.value);
      const newOfficeObj = destinations.reduce((acc, col, idx) => {
        acc[col] = durationArr[idx] / 60;
        return acc;
      }, {});
      return {
        ...row,
        ...newOfficeObj,
      };
    });
  } catch (e) {
    console.log(e.stack);
    throw new Error(e.message);
  }
};

const putMoveTime = async (req, res) => {
  const newAddresses = req.body;
  const newCustomerAddresses = newAddresses.filter(
    addr => addr.customerAddress,
  );
  const newOfficeAddresses = newAddresses.filter(addr => addr.officeAddress);
  try {
    console.log('before read', new Date);
    const workbook = xlsx.readFile(MOVETIME_FILE_PATH);
    console.log('before read', new Date);
    const wsname = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsname];
    let rows = xlsx.utils.sheet_to_json(ws);
    let columns = rows.length && Object.keys(rows[0]);

    if (newCustomerAddresses.length) {
      rows = await newCustomerDuration({ columns, rows, newCustomerAddresses });
    }
    if (newOfficeAddresses.length) {
      rows = await newOfficeDuration({ columns, rows, newOfficeAddresses });
      columns = columns.concat(
        newOfficeAddresses.map(add => add.officeAddress),
      );
    }

    console.log('before write', new Date);
    const newws = xlsx.utils.json_to_sheet(rows, { header: columns })
    workbook.Sheets[wsname] = newws;
    // don't know why can't have path like './movetime.xlsx'
    xlsx.writeFile(workbook, 'movetime.xlsx');
    console.log('after write', new Date);
    res.json({
      columns: columns.map(key => ({ title: key, field: key })),
      rows,
    });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ msg: e.message });
  }
};

export { getMoveTime, putMoveTime };
