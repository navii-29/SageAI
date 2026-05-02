import { Routes, Route, useNavigate } from 'react-router-dom';
import ImageGen from './ChatSection/imagegen';
import Chat from './ChatSection/chatbar';
import Summarize from './ChatSection/summarise';
import Reasoning from './ChatSection/reasoning';
import Notfound from './Notfound';
// import Register from './Credentials/Register';
// import Signin from './Credentials/Sigin';
import Tokens from './Credentials/Tokens';
import Refill from './Credentials/Refill';


const Aggregate = () => {
  const navigate = useNavigate();

  const handleChange = (e) => {
    navigate(e.target.value);
  };

  return (
    <div className='w-full h-screen scroll-px-16 flex flex-col bg-linear-to-br from-amber-50 to-blue-100'>
      {/* Dropdown Navigation */}
      <select onChange={(e) => navigate(e.target.value)} className='w-fit bg-amber-200'>
        <option value="/chat">Chat</option>
        <option value="/chat/summarize">Summarize</option>
        <option value="/chat/reasoning">Reasoning</option>
        <option value="/chat/img">Image</option>
        <option value="/chat/tokens">tokens</option>
        <option value="/chat/refill">Refill Request</option>

      </select>

      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="summarize" element={<Summarize />} />
        <Route path="reasoning" element={<Reasoning />} />
        <Route path="img" element={<ImageGen />} />
        <Route path="tokens" element={<Tokens />} />
         <Route path="Refill" element={<Refill /> } />
        <Route path="*" element={<Notfound />} />

      </Routes>
    </div>
  );
};

export default Aggregate;