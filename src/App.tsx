import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import UploadPhoto from "./pages/UploadPhoto";
import Analyzing from "./pages/Analyzing";
import DiagnosisSurvey from "./pages/DiagnosisSurvey";
import Result from "./pages/Result";
import DiagnosisHistory from "./pages/DiagnosisHistory";
import DiagnosisHistoryDetail from "./pages/DiagnosisHistoryDetail";
import Recommendation from "./pages/Recommendation";
import Home from "./pages/Home";
import MyPage from "./pages/MyPage";
import Login from "./pages/Login";
import ToneProducts from "./pages/ToneProducts";
import SavedProducts from "./pages/SavedProducts";
import Feedback from "./pages/Feedback";
import Inquiries from "./pages/Inquiries";
import NewInquiry from "./pages/NewInquiry";
import InquiryDetail from "./pages/InquiryDetail";
import AdminInquiries from "./pages/AdminInquiries";
import AdminInquiryDetail from "./pages/AdminInquiryDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import Sazu from "./pages/Sazu";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/sazu" element={<Sazu />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/booth" element={<Onboarding />} />
        <Route path="/photo" element={<UploadPhoto />} />
        <Route path="/booth/photo" element={<UploadPhoto />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/booth/analyzing" element={<Analyzing />} />
        <Route path="/diagnosis-survey" element={<DiagnosisSurvey />} />
        <Route path="/booth/survey" element={<DiagnosisSurvey />} />
        <Route path="/result" element={<Result />} />
        <Route path="/booth/result" element={<Result />} />
        <Route path="/diagnosis-history" element={<DiagnosisHistory />} />
        <Route path="/diagnosis-history/:id" element={<DiagnosisHistoryDetail />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/booth/recommendation" element={<Recommendation />} />
        <Route path="/tone-products" element={<ToneProducts />} />
        <Route path="/saved-products" element={<SavedProducts />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/inquiries" element={<Inquiries />} />
        <Route path="/inquiries/new" element={<NewInquiry />} />
        <Route path="/inquiries/:id" element={<InquiryDetail />} />
        <Route path="/admin" element={<AdminUsers />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin/inquiries" element={<AdminInquiries />} />
        <Route path="/admin/inquiries/:id" element={<AdminInquiryDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
