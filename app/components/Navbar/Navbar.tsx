'use client'
import React, { useState } from 'react';
import Link from 'next/link';

export const Navbar = () => {
  // State to track registration status
  const [isRegistered, setIsRegistered] = useState(false);

  // Function to handle successful registration
  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
  };

  return (
    <div>
      <nav className='bg-red-400 p-3 flex justify-between '>
        <div className='text-3xl'>
          <Link href='/'>
            <h1>Logo</h1>
          </Link>
        </div>
        <ul className='flex gap-3 mx-3'>
          {!isRegistered && (
            <Link href='/login'>
              <li>
                <button>Login</button>
              </li>
            </Link>
          )}
          {!isRegistered && (
            <Link href='/Registration'>
              <li>
                <button>Registration</button>
              </li>
            </Link>
          )}
          {isRegistered && <li>Signup</li>}
        </ul>
      </nav>
    </div>
  );
};
