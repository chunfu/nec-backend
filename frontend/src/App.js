import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

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

const menuOptions = [
  { label: '公司車最佳租賃', path: '/cars' },
  { label: '技術服務據點選擇', path: '/pos' },
];

export default function App() {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);
  const handleMenuItemClick = (e, idx) => {
    handleClose();
    setSelectedIndex(idx);
  };

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
              {menuOptions.map(({ label, path }, index) => (
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
              {menuOptions[selectedIndex].label}
            </Typography>
          </Toolbar>
        </AppBar>
      </div>

      <Route exact path="/" component={() => <h1>Cars</h1>} />
      <Route path="/cars" component={() => <h1>Cars</h1>} />
      <Route path="/pos" component={() => {
        setSelectedIndex(1);
        return <h1>POS</h1>
      }} />
    </Router>
  );
}
