import { useState, useEffect } from 'react';

const useLocalStorage = (itemName, initState) => {
  const [values, setValues] = useState(initState);

  // get values from localStorage when first render
  useEffect(() => {
    const valueFromStorage = localStorage.getItem(itemName);
    if (valueFromStorage) {
      setValues(JSON.parse(valueFromStorage));
    }
  }, []);

  // set values to localStorage every render
  useEffect(() => {
    localStorage.setItem(itemName, JSON.stringify(values));
  });

  return [values, setValues];
}

export default useLocalStorage;
