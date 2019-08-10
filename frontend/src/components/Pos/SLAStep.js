import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MaterialTable from 'material-table';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';

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
const Location = (/*{ value, onChange }*/) => {
  const [value, setValue] = useState('');
  return (
    <FormControl>
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
  const classes = useStyles()();

  const [data, loadData] = useFetch('/api/carModule', {});
  let columns = [];
  let rows = [];
  if (data.columns) {
    columns = data.columns.concat({ label: '服務據點', key: 'location' });
    rows = data.rows.map(r => ({ ...r, location: <Location /> }));
  }
  useEffect(() => {
    async function fetchData() {
      await loadData();
    }
    fetchData();
  }, []);
  return (
    <div className={classes.table}>
      {columns && <MaterialTable columns={columns} data={rows} />}
    </div>
  );
};

export default SLAStep;
