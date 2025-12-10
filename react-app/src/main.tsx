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
import BreathTrainingPage  from "./pages/BreathTrainingPage";
import Breath874Page  from "./pages/Breathing478Page";
import DiaphragmaticBreathingPage from "./pages/DiaphragmaticBreathingPage";
import BoxBreathingPage from "./pages/BoxBreathingPage";
import CountingBreathingPage from "./pages/CountingBreathsPage";
import NostrilBreathingPage from "./pages/AlternateNostrilBreathingPage";
import GuidedBreathingPage from "./pages/GuidedVisualizationBreathingPage";
import Phq2Page from "./pages/Phq2Page";
import Phq9Page from "./pages/Phq9Page";
import SupportFinderPage from "./pages/SupportFinderPage";
import PhotoMemoriesPage from "./pages/PhotoMemoriesPage";

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
        <Route path="/breath" element={<BreathTrainingPage />} />
        <Route path="/breathing/8-7-4" element={<Breath874Page />} />
        <Route path="/breathing/diaphragmatic" element={<DiaphragmaticBreathingPage />} />
        <Route path="/breathing/box" element={<BoxBreathingPage />} />
        <Route path="/breathing/counting" element={<CountingBreathingPage />} />
        <Route path="/breathing/alternate-nostril" element={<NostrilBreathingPage />} />
        <Route path="/breathing/visualization" element={<GuidedBreathingPage />} />
        <Route path="/phq2" element={<Phq2Page />} />
        <Route path="/phq9" element={<Phq9Page />} />
        <Route path="/support" element={<SupportFinderPage />} />
        <Route path="/photo-memories" element={<PhotoMemoriesPage />} />
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
