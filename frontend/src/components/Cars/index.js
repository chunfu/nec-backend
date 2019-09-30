import React, { useState } from 'react';

import { IndexContext } from '../../App';
import useLocalStorage from '../../utils/useLocalStorage';
import StepsComp from '../../widget/StepsComp';
import FileStep from './FileStep';
import ParameterStep from './ParameterStep';
import InfoStep from './InfoStep';
import ResultStep from './ResultStep';

export const CarContext = React.createContext({
  parameter: {},
  file: {},
});

const steps = [
  { label: '檔案讀取', comp: FileStep },
  { label: '參數設定', comp: ParameterStep },
  { label: '路徑資訊', comp: InfoStep },
  { label: '輸出結果', comp: ResultStep },
];

const Cars = props => {
  const { showLoading, showErrDialog} = props;
  const [values, setValues] = useLocalStorage('cars-parameters', {
    // daily parameter
    comapnyCarNumber: '',
    // daily parameter
    privateCarNumber: '',
    // daily parameter
    office: '',
    restTime: '',
    comapnyCarAnnualCost: '',
    comapnyCarFuelConsumption: '',
    privateCarDistance: '',
    privateCarBonus: '',
    privateCarExtraBonus: '',
  });

  const [files, setFiles] = useState({});

  return (
    <CarContext.Provider
      value={{
        parameter: { values, setValues },
        file: { files, setFiles },
        showErrDialog,
        showLoading,
      }}
    >
      <StepsComp steps={steps} />
    </CarContext.Provider>
  );
};

const withContext = () => (
  <IndexContext.Consumer>
    {props => <Cars {...props} />}
  </IndexContext.Consumer>
);

export default withContext;
