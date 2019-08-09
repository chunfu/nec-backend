import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import Cars from './components/Cars';
import Pos from './components/Pos';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const routeConfig = [
  { label: '社車租賃模組', path: '/cars', comp: Cars },
  { label: '服務據點模組', path: '/pos', comp: Pos },
];

const App = props => {
  const classes = useStyles();

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

  return (
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
    </Router>
  );
};

export default App;
