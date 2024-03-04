export const fetchTestApi = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/v1/tours', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();

    console.log(data);
  } catch (err) {
    throw new Error(err.message);
  }
};

export const fetchUsers = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/v1/users', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();

    console.log(data);
  } catch (err) {
    throw new Error(err.message);
  }
};
