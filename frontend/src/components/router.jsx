import { Routes, Route } from "react-router-dom";
import Aggregate from "./aggregate"
import Signin from "./Credentials/Sigin";
import Register from "./Credentials/Register";

const App = () => {
  return (
    <Routes>
      <Route path="/signin" element={<Signin />} />
      <Route path="/" element={<Register />} />
      
      {/* Protected/App routes */}
      <Route path="/chat/*" element={<Aggregate />} />
    </Routes>
  );
};

export default App;