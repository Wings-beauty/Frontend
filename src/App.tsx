import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import UploadPhoto from "./pages/UploadPhoto";
import Analyzing from "./pages/Analyzing";
import Result from "./pages/Result";
import Recommendation from "./pages/Recommendation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/photo" element={<UploadPhoto />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/result" element={<Result />} />
        <Route path="/recommendation" element={<Recommendation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
