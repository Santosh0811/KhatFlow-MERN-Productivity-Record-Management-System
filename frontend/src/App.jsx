import React from 'react'
import Navbar from './components/Navbar'
import Form from './components/Form'
import Login from './components/Login'
import { Routes, Route } from "react-router-dom"
import Signup from './components/Signup'
import Forgotpassword from './components/Forgotpassword'
import { ToastContainer } from 'react-toastify';
import KhataNote from './components/KhataNote'
import CustomerCards from './components/CustomerCards'
import Accounts from './components/Accounts'
import Home from './components/Home'
import Grocery_Notes from './components/Grocery_Notes'
import VerificationPage from './components/VerificationPage'
import TodoState from './context/TodoState'

const App = () => {

  return (
    <TodoState>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      // transition={Bounce}
      />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/forgotpassword' element={<Forgotpassword />} />
        <Route path='/form' element={<Form />} />
        <Route path='/khatanote' element={<KhataNote />} />
        <Route path='/customer' element={<CustomerCards />} />
        <Route path='/account/:customerId' element={<Accounts />} />
        <Route path='/groceryNote' element={<Grocery_Notes />} />
        <Route path='/verificationPage/:email' element={<VerificationPage />} />
      </Routes>
    </TodoState>
  )
}

export default App
