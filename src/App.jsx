import { useState, useEffect  } from 'react'
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch  } from "react-router-dom";

import Cuestionario from "./Component/Cuestionario/Cuestionario";
import Menu from "./Component/Menu/Menu";
import Dmin1 from "./Component/dmin1/dmin1";


function App() {

  
  return (
    <div className="container">
    <Router>
     <Switch>
        <Route exact path="/">
          <Menu />
        </Route>
        <Route exact path="/Cuestionario">
          <Cuestionario />
        </Route>
        <Route exact path="/dmin1">
          <Dmin1 />
        </Route>
     </Switch>
     </Router>
    </div>
  )
}

export default App
