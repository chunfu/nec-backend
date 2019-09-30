import { makeStyles } from '@material-ui/core/styles';

const useStyles = () =>
  makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 250,
    },
    input: {
      display: 'none',
    },
    button: {
      margin: theme.spacing(1),
    },
    table: {
      marginTop: theme.spacing(2),
    },
    stepperSpace: {
      marginBottom: '120px',
    },
    fixBottom: {
      position: 'fixed',
      backgroundColor: 'white',
      width: '100%',
      bottom: 0,
    },
    formControl: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 250,
    },
    horizontalFormGroup: {
      flexDirection: 'row',
    },
    inputContainer: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    link: {
      cursor: 'pointer',
    },
    newAddress: {
      '& > div': {
        display: 'inline',
      },
      '& > span': {
        height: '80px',
        lineHeight: '80px',
      },
    },
    loadingMaskContainer: {
      position: 'absolute',
      top: '60px',
      right: 0,
      bottom: 0,
      left: 0,
      background: '#fff',
      opacity: 0.5,
      zIndex: 9999,
    },
    hide: {
      display: 'none',
    },
    loadingInCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      zIndex: 99999,
    },
  }));

export default useStyles;
