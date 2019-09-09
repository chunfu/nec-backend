import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MaterialTable from 'material-table';
import { PosContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const locations = [
  '南港',
  '淡水',
  '桃園',
  '新竹',
  '台中',
  '宜蘭',
  '花蓮',
  '台東',
  '台南',
  '嘉義',
  '高雄',
  '屏東',
];
const Location = ({ onChange = () => null }) => {
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
        {locations.map(l => (
          <MenuItem value={l}>{l}</MenuItem>
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
  } = props;
  const classes = useStyles()();

  const [data, loadData] = useFetch('/api/pos/sla', {});
  let { columns, rows } = data;
  if (columns) {
    columns = columns.concat({
      title: '服務據點',
      field: 'location',
      render: rowData => {
        const i = rows.indexOf(rowData);
        return <Location onChange={(e, v) => (rows[i]['location'] = v)} />;
      },
    });
  }
  useEffect(() => {
    async function fetchData() {
      await loadData({ query: { serviceQuality } });
    }
    fetchData();
  }, []);
  return (
    <div className={classes.table}>
      {columns && (
        <MaterialTable
          title="調整SLA無法滿足之客戶"
          columns={columns}
          data={rows}
          {...tableConfig}
        />
      )}
    </div>
  );
};

const withContext = () => (
  <PosContext.Consumer>{props => <SLAStep {...props} />}</PosContext.Consumer>
);

export default withContext;
