import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MaterialTable from 'material-table';
import { PosContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const Location = ({ onChange = () => null, options }) => {
  const [value, setValue] = useState('');
  const onChangeSelect = e => {
    const v = e.target.value;
    setValue(v);
    onChange(e, v);
  };
  return (
    <FormControl>
      <Select
        value={value}
        onChange={onChangeSelect}
        inputProps={{
          name: 'location',
          id: 'location',
        }}
      >
        {options.map(({ id, name }) => (
          <MenuItem value={id}>{name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const SLAStep = props => {
  const {
    // read parameter from context provider
    parameter: {
      values: { serviceQuality },
    },
    showErrDialog,
    showLoading,
  } = props;
  const classes = useStyles()();

  const [locations, loadLocations] = useFetch('/api/pos/locations', []);

  const [_, putSla] = useFetch('/api/pos/sla', {}, { method: 'PUT' });
  const [data, loadData] = useFetch('/api/pos/sla', {});
  let { columns, rows } = data;
  if (columns) {
    columns = columns.concat({
      title: '服務據點',
      field: 'location',
      render: rowData => {
        const i = rows.indexOf(rowData);
        return (
          <Location
            onChange={(e, v) => (rows[i]['location'] = v)}
            options={locations}
          />
        );
      },
    });
  }

  useEffect(() => {
    async function fetchData() {
      try {
        showLoading(true);
        await loadLocations();
        await loadData({ query: { serviceQuality } });
      } catch (e) {
        showErrDialog(e.message);
      }
      showLoading(false);
    }
    fetchData();
  }, []);

  const onClickConfirmButton = async () => {
    try {
      showLoading(true);
      await putSla({ body: JSON.stringify({ columns, rows }) });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };

  return (
    <div className={classes.table}>
      {columns && (
        <>
          <Button
            className={classes.button}
            variant="contained"
            onClick={onClickConfirmButton}
          >
            確認
          </Button>
          <MaterialTable
            title="調整SLA無法滿足之客戶"
            columns={columns}
            data={rows}
            {...tableConfig}
          />
        </>
      )}
    </div>
  );
};

const withContext = () => (
  <PosContext.Consumer>{props => <SLAStep {...props} />}</PosContext.Consumer>
);

export default withContext;
