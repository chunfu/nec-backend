import * as xlsx from 'xlsx';
import * as _ from 'lodash';
import { API_KEY } from '../../lib/const';
import { excel2json } from '../../lib/util';
import { MOVETIME_FILE_PATH, OFFICE_MAPPING_PATH } from '../../lib/files';

const gmap = require('@google/maps').createClient({
  key: API_KEY,
  Promise: Promise,
});

const getMoveTime = (req, res) => {
  const [rows] = excel2json(MOVETIME_FILE_PATH);
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

const newCustomerDuration = async ({
  columns,
  rows,
  newCustomerAddresses,
  officeAddressesList,
}) => {
  try {
    // existing office locations
    // [{ name, address }, ...]
    const destinations = columns
      .slice(4)
      .map(c => officeAddressesList.find(({ name }) => name === c));
    // all new addresses from req.body
    const origins = newCustomerAddresses.map(addr => addr.customerAddress);
    let response = await calcDuration(
      origins,
      destinations.map(d => d.address),
    );

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
        acc[col.name] = (durationArr[idx] / 60).toFixed(2);
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
    // origins is all customer addresses
    const origins = rows.map(r => r[columns[3]]);
    // destinations is officeAddress
    const destinations = newOfficeAddresses;

    const response = await calcDuration(
      origins,
      destinations.map(addr => addr.officeAddress),
    );
    const values = response.json.rows;

    return rows.map((row, i) => {
      const durationArr = values[i].elements.map(e => e.duration.value);
      const newOfficeObj = destinations.reduce((acc, col, idx) => {
        acc[col.officeName] = (durationArr[idx] / 60).toFixed(2);
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
  const { customerAddresses, officeAddresses } = req.body;
  const newCustomerAddresses = customerAddresses.filter(
    addr => addr.customerAddress,
  );
  const newOfficeAddresses = officeAddresses.filter(addr => addr.officeAddress);
  try {
    let [officeAddressesList, omWorkBook] = excel2json(OFFICE_MAPPING_PATH);
    // update officeMapping first
    if (newOfficeAddresses.length) {
      const total = officeAddressesList.length;
      officeAddressesList = officeAddressesList.concat(
        // add new office address to officeMapping file
        newOfficeAddresses.map((add, idx) => ({
          id: add.officeId || total + idx + 1,
          name: add.officeName,
          address: add.officeAddress,
        })),
      );
      const omSheetNew = xlsx.utils.json_to_sheet(officeAddressesList, {
        header: ['id', 'address'],
      });
      omWorkBook.Sheets[omWorkBook.SheetNames[0]] = omSheetNew;
      xlsx.writeFile(omWorkBook, OFFICE_MAPPING_PATH);
    }

    let [rows, workbook] = excel2json(MOVETIME_FILE_PATH);
    let columns = rows.length && Object.keys(rows[0]);

    if (newCustomerAddresses.length) {
      rows = await newCustomerDuration({
        columns,
        rows,
        newCustomerAddresses,
        officeAddressesList,
      });
    }

    if (newOfficeAddresses.length) {
      rows = await newOfficeDuration({
        columns,
        rows,
        newOfficeAddresses,
      });
      columns = columns.concat(newOfficeAddresses.map(add => add.officeName));
    }

    const newws = xlsx.utils.json_to_sheet(rows, { header: columns });
    workbook.Sheets[workbook.SheetNames[0]] = newws;
    // don't know why can't have path like './movetime.xlsx'
    xlsx.writeFile(workbook, MOVETIME_FILE_PATH);
    res.json({
      columns: columns.map(key => ({ title: key, field: key })),
      rows,
    });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

export { getMoveTime, putMoveTime };
