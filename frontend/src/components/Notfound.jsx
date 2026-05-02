import React from 'react'
import { useNavigate } from 'react-router-dom'

const Notfound = () => {
    const navigate = useNavigate()
    const navigate1 = useNavigate()
    const navigate2 = useNavigate()

    const handle = () => {
        navigate('/')
    }

    const handle1 = () => {
        navigate1(-1)
    }

    const handle2 = () => {
        navigate2(+1)
    }
    
 
 
  return (
  <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-amber-100 p-10">
    <h1 className="text-red-600 text-5xl font-bold text-center">
      404 | The page doesn't exist!
    </h1>

    <button 
      onClick={handle} 
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-transform active:scale-110"
    >
      Go Home
    </button>
  </div>
);

}

export default Notfound
