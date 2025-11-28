import { MoveRight } from 'lucide-react'
import React from 'react'
import { NavLink } from "react-router-dom"

const Payment = () => {
  return (
     <>
      <div className="flex items-center justify-center mb-4 gap-2">
        <NavLink to="/">
          <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>{" "}
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={15} />
        <span className="font-semibold">Payments</span>
      </div>
      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-14 rounded-2xl">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 tracking-wide">
          Payments
        </h2>
      </div>
    </>
  )
}

export default Payment