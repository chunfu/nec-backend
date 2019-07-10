import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: theme.spacing(2, 4, 4),
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexWrap: 'wrap',
    outline: 'none',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
  },
  dense: {
    marginTop: theme.spacing(2),
  },
  menu: {
    width: 200,
  },
  input: {
    display: 'none',
  }
}));

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default function OutlinedTextFields() {
  const classes = useStyles();
  // const modalClasses = useModalStyles();
  const [values, setValues] = useState({
    name: 'Cat in the Hat',
    age: '',
    multiline: 'Controlled',
    currency: 'EUR',
  });

  const [paramsModalOpen, setParamsModalOpen] = useState(false);

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleOpenParamsModal = () => setParamsModalOpen(true);
  const handleCloseParamsModal = () => setParamsModalOpen(false);

  return (
    <React.Fragment>
      <Button variant="contained" onClick={handleOpenParamsModal}>
        讀取模型參數
      </Button>
      <input
        accept=".csv,.xls,.xlsx"
        className={classes.input}
        id="upload-history"
        multiple
        type="file"
      />
      <label htmlFor="upload-history">
        <Button variant="contained" component="span" className={classes.button}>
          讀取歷史工作
        </Button>
      </label>
      <Button variant="contained" color="primary">
        最佳化資源配置
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell >Calories</TableCell>
            <TableCell >Fat&nbsp;(g)</TableCell>
            <TableCell >Carbs&nbsp;(g)</TableCell>
            <TableCell >Protein&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name}>
              <TableCell >
                {row.name}
              </TableCell>
              <TableCell >{row.calories}</TableCell>
              <TableCell >{row.fat}</TableCell>
              <TableCell >{row.carbs}</TableCell>
              <TableCell >{row.protein}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={paramsModalOpen}
        onClose={handleCloseParamsModal}
      >
      <form className={classes.container} noValidate autoComplete="off">
        <TextField
          label="目前據點社車供應"
          placeholder="X 輛"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="目前據點私車供應"
          placeholder="X 輛"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="車輛工作間隔時間下限"
          placeholder="X 分鐘"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="社車年租賃費用"
          placeholder="X 元/輛"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="社車每單位行使油耗"
          placeholder="X 元/公里"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="私車基本里程數"
          placeholder="X 公里"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="私車基本里程數內單位補貼"
          placeholder="X 元/公里"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="私車基本里程數外單位補貼"
          placeholder="X 元/公里"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="計程車基本里程數"
          placeholder="X 公尺"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="計程車基本起跳價（基本里程數內）"
          placeholder="X 元"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="計程車基本里程數外單位價格"
          placeholder="X 元/公里"
          value={values.age}
          onChange={handleChange('age')}
          type="number"
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
      </form>
      </Modal>
    </React.Fragment>
  );
}
