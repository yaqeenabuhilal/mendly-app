import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import SplashPage from "./pages/SplashScreen";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EmotionalBalancePage from "./pages/EmotionalBalancePage";
import ProfilePage from "./pages/ProfilePage";
import JourneyOverviewPage from "./pages/JourneyOverviewPage";
import ChatPage from "./pages/ChatPage";
import CheckInPage from "./pages/CheckInPage";
import MoodTrackPage from "./pages/MoodTrackPage";
import MoodAnalyzePage from "./pages/MoodAnalyzePage";
import PositiveNotificationsPage from "./pages/PositiveNotificationsPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 1) First page = splash (loading with logo) */}
        <Route path="/" element={<SplashPage />} />
        
        <Route path="/emotional-balance" element={<EmotionalBalancePage />} />

        <Route path="/welcome" element={<WelcomePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/journey" element={<JourneyOverviewPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/mood-track" element={<MoodTrackPage />} />
        <Route path="/analyze" element={<MoodAnalyzePage />} />
        <Route path="/positive" element={<PositiveNotificationsPage />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
