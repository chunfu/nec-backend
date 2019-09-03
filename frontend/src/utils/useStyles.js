import { makeStyles } from '@material-ui/core/styles';

const useStyles = () => makeStyles(theme => ({
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
  newAddresses: {
    '& > div:nth-last-child(2)': {
      display: 'inline',
    },
    '& > span': {
      height: '80px',
      lineHeight: '80px',
    },
  },
}));

export default useStyles;