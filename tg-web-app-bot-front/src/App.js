import logo from './logo.svg';
import './App.css';
import {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import Header from "./Components/Header/Header";
import { Route, Routes} from "react-router-dom";
import ProductList from "./Components/ProductList/ProductList";
import AuthForm from "./Components/Form/Form"
import UserOrders from "./Components/UserOrders/UserOrders";
import AdminProductList from "./Components/AdminProductList/AdminProductList";
import AdminTypeList from "./Components/AdminTypeList/AdminTypeList";

function App() {
  const {tg,onToogleButton} = useTelegram();
  useEffect(() => {
    tg.ready();
  })

  return (
    <div className="App">
        <Routes>
            <Route path="/products" element={<ProductList/>}></Route>
            <Route path="/form" element={<AuthForm/>}></Route>
            <Route path="/order" element={<UserOrders/>}></Route>
            <Route path="/admin/products" element={<AdminProductList/>}></Route>
            <Route path="/admin/types" element={<AdminTypeList/>}></Route>
        </Routes>
    </div>
  );
}

export default App;
