import React, { useState, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import LoadingMask from './widget/LoadingMask';
import useStyles from './utils/useStyles';
import Cars from './components/Cars';
import Pos from './components/Pos';

const routeConfig = [
  { label: '社車租賃模組', path: '/cars', comp: Cars },
  { label: '服務據點模組', path: '/pos', comp: Pos },
];

export const IndexContext = React.createContext({});

const App = props => {
  const classes = useStyles()();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);
  const handleMenuItemClick = (e, idx) => {
    handleClose();
    setSelectedIndex(idx);
  };

  useEffect(() => {
    const p = window.location.pathname;
    // set menu index when landing
    let idx = routeConfig.findIndex(({ path }) => path === p);
    if (idx < 0) {
      idx = 0;
    }
    setSelectedIndex(idx);
  }, []);

  const [loading, showLoading] = useState(false);

  const [errDialogOpen, setErrDialogOpen] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const showErrDialog = errMsg => {
    setErrDialogOpen(true);
    setErrMsg(errMsg);
  };

  return (
    <IndexContext.Provider value={{ showLoading, showErrDialog }}>
      <Router>
        <div className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="Menu"
                onClick={e => setAnchorEl(e.currentTarget)}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                {routeConfig.map(({ label, path }, index) => (
                  <MenuItem
                    key={label}
                    selected={index === selectedIndex}
                    onClick={e => handleMenuItemClick(e, index)}
                    component={props => <Link to={path} {...props} />}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Menu>
              <Typography variant="h6" className={classes.title}>
                {routeConfig[selectedIndex].label}
              </Typography>
            </Toolbar>
          </AppBar>
        </div>

        <Route exact path="/" component={Cars} />
        {routeConfig.map(({ path, comp }) => (
          <Route path={path} component={comp} />
        ))}
        <LoadingMask show={loading} />
      <Dialog
        open={errDialogOpen}
        onClose={() => setErrDialogOpen(false)}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">錯誤訊息</DialogTitle>
        <DialogContent>
          <DialogContentText>{errMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setErrDialogOpen(false)}
            color="primary"
            autoFocus
          >
            關閉
          </Button>
        </DialogActions>
      </Dialog>
      </Router>
    </IndexContext.Provider>
  );
};

export default App;
