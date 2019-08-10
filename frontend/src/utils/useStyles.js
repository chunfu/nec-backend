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
  inputContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  link: {
    cursor: 'pointer',
  },
}));

export default useStyles;