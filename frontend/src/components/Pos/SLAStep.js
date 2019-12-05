import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MaterialTable from 'material-table';
import * as _ from 'lodash';

import { PosContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const Location = ({ onChange = () => null, options, value, setValue }) => {
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
        {options.map(({ name }) => (
          <MenuItem value={name}>{name}</MenuItem>
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
    prevData,
    setPrevData,
    showErrDialog,
    showLoading,
  } = props;
  const slaPrevData = prevData.slaStep || {};
  const classes = useStyles()();

  const [locations, loadLocations] = useFetch('/api/pos/locations', []);

  const [dummy, putSla] = useFetch('/api/pos/sla', {}, { method: 'PUT' });
  const [data, loadData] = useFetch('/api/pos/sla', {});
  const [locationSelections, updateLocationSelections] = useState([]);

  const renderedData = _.isEmpty(data) ? slaPrevData : data;
  let { columns, rows } = renderedData;
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
            value={locationSelections[i]}
            setValue={v => {
              let newSelections = locationSelections.slice();
              newSelections[i] = v;
              updateLocationSelections(newSelections);
            }}
          />
        );
      },
    });
  }

  useEffect(() => {
    async function fetchData() {
      // load location everytime comes in
      await loadLocations();

      // initialize location selection first
      const renderedData = _.isEmpty(data) ? slaPrevData : data;
      const { rows } = renderedData;
      updateLocationSelections((rows || []).map(({ location }) => location));
    }
    fetchData();
  }, []);

  const onClickSlaBtn = async () => {
    try {
      showLoading(true);
      const resp = await loadData({ query: { serviceQuality } });
      setPrevData({ ...prevData, slaStep: resp });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };

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
    <>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={onClickSlaBtn}
      >
        調整SLA無法滿足之客戶
      </Button>
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
    </>
  );
};

const withContext = () => (
  <PosContext.Consumer>{props => <SLAStep {...props} />}</PosContext.Consumer>
);

export default withContext;
