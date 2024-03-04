import React, { useEffect } from 'react';
import { fetchTestApi, fetchUsers } from './api/fetch';

function App() {
  useEffect(() => {
    async function x() {
      await fetchTestApi();
      await fetchUsers();
    }
    x();
  }, []);
  return <h1 className=" text-center py-2 text-xl">Hello World</h1>;
}

export default App;
