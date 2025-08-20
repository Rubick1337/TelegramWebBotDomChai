import logo from './logo.svg';
import './App.css';
import {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import Header from "./Components/Header/Header";
import {Form, Route, Routes} from "react-router-dom";
import ProductList from "./Components/ProductList/ProductList";
import AuthForm from "./Components/Form/Form";
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
        </Routes>
    </div>
  );
}

export default App;
