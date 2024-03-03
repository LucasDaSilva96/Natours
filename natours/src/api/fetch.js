export const fetchTestApi = async () => {
  try {
    const res = await fetch('http://localhost:3000/api', {
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(res);
  } catch (err) {
    throw new Error(err.message);
  }
};
