import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import MaterialTable from 'material-table';

import { PosContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const Address = ({ classes, index, value, handleChange, type }) =>
  type === 'customer' ? (
    <div>
      <TextField
        label="客戶ID"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={value.customerId}
        onChange={handleChange(index, 'customerId')}
      />
      <TextField
        label="客戶名稱"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={value.customerName}
        onChange={handleChange(index, 'customerName')}
      />
      <TextField
        label="客戶地址"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={value.customerAddress}
        onChange={handleChange(index, 'customerAddress')}
      />
    </div>
  ) : (
    <div>
      <TextField
        label="據點ID"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={value.officeId}
        onChange={handleChange(index, 'officeId')}
      />
      <TextField
        label="據點名稱"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={value.officeName}
        onChange={handleChange(index, 'officeName')}
      />
      <TextField
        label="據點地址"
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={value.officeAddress}
        onChange={handleChange(index, 'officeAddress')}
      />
    </div>
  );

const NewAddresses = props => {
  const { addresses, setAddresses, classes, type } = props;

  const onFieldChange = (idx, key) => e => {
    let newAddresses = addresses.slice();
    newAddresses[idx][key] = e.target.value;
    setAddresses(newAddresses);
  };

  return (
    <div className={classes.newAddresses}>
      {addresses.map((addr, idx) => (
        <div className={classes.newAddress}>
          <Address
            index={idx}
            value={addr}
            handleChange={onFieldChange}
            classes={classes}
            type={type}
          />
          <Icon
            color="primary"
            onClick={() => {
              let newArr = addresses.slice();
              newArr.splice(idx, 1);
              setAddresses(newArr);
            }}
          >
            remove_circle
          </Icon>
        </div>
      ))}
      <Icon
        color="primary"
        onClick={() => setAddresses(addresses.concat([{}]))}
      >
        add_circle
      </Icon>
    </div>
  );
};

/**
 * TODO:
 * 1. read movetime.xlsx from server
 * 2. render as table in frontend
 * 3. UI to add new address (customer & office)
 * 4. send new addresses to server
 * 5. update movetime.xlsx
 * 6. request movetime.xlsx in frontend to get the latest
 */
const DrivingTimeStep = props => {
  const { showErrDialog, showLoading } = props;
  const classes = useStyles()();

  const [data, loadData] = useFetch('/api/pos/movetime', {});
  const { columns, rows } = data;

  const [customerAddresses, setCustomerAddresses] = useState([{}]);
  const [officeAddresses, setOfficeAddresses] = useState([{}]);

  const onClickLoadButton = async () => {
    try {
      showLoading(true);
      await loadData();
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };

  const onClickNewAddr = async () => {
    try {
      showLoading(true);
      await loadData({
        method: 'PUT',
        body: JSON.stringify({ customerAddresses, officeAddresses }),
      });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };

  return (
    <>
      <Button
        className={classes.button}
        variant="contained"
        onClick={onClickLoadButton}
      >
        載入車行時間表
      </Button>
      <NewAddresses
        addresses={customerAddresses}
        setAddresses={setCustomerAddresses}
        classes={classes}
        type="customer"
      />
      <NewAddresses
        addresses={officeAddresses}
        setAddresses={setOfficeAddresses}
        classes={classes}
      />
      <Button
        className={classes.button}
        variant="contained"
        onClick={onClickNewAddr}
      >
        新增地址
      </Button>
      <div className={classes.table}>
        {columns && (
          <MaterialTable
            title="車行時間"
            columns={columns}
            data={rows}
            {...tableConfig}
          />
        )}
      </div>
    </>
  );
};

const withContext = () => (
  <PosContext.Consumer>
    {props => <DrivingTimeStep {...props} />}
  </PosContext.Consumer>
);

export default withContext;
