import React, { useEffect } from 'react';
import { fetchTestApi } from './api/fetch';

function App() {
  useEffect(() => {
    async function x() {
      await fetchTestApi();
    }
    x();
  }, []);
  return <h1 className=" text-center py-2 text-xl">Hello World</h1>;
}

export default App;
