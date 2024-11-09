import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import ChatHome from "./Components/ChatHome";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatHome />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
