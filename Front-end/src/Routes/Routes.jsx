import { Routes, Route } from 'react-router-dom';
import Home from './../Pages/Home';
import Signup from './../Components/Signup';
import Login from './../Components/Login';
import ProtectedRoute from './RouteValidation';
import BankExpense from '../Pages/BankExpense';
import CashExpense from '../Pages/CashExpense';
import Accounts from '../Pages/Accounts';
import Months from '../Pages/Month';

function AllRoute() {
  return (
    <>
      <Routes>
        <Route path="/Sign-up" element={<Signup />} />
        <Route path="Login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/bank-expense" element={<BankExpense />} />
          <Route path="/cash-expense" element={<CashExpense />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/months" element={<Months />} />
        </Route>
      </Routes>
    </>
  );
}

export default AllRoute;