import IntroPage from "./pages/IntroPage.jsx";
import SignUpPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MenteeDashboard from "./pages/MenteeDashboard.jsx";
import MentorDashboard from "./pages/MentorDashboard.jsx";
import {MentorMatching} from "./pages/MentorMatching.jsx";
import ConnectPage from "./pages/ConnectPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Show loading spinner while checking authentication
    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    const DashboardRoute = () => {
        const { userType } = useParams();
        
        // No need to get authUser again, it's already in the parent component's scope
        console.log("user", userType);
        
        return userType === "mentor" ? <MentorDashboard /> : <MenteeDashboard />;
    };

    // Only render routes after authentication check is complete
    return (
        <div>
            <Routes>
                <Route path="/" element={<IntroPage />} />
                <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
                <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/dashboard/:userType" element={authUser ? <DashboardRoute /> : <Navigate to="/" />} />
                <Route path="/mentorMatching" element={authUser ? <MentorMatching /> : <Navigate to="/" />} />
                <Route path="/connect/:menteeID" element={authUser ? <ConnectPage /> : <Navigate to="/" />} />
            </Routes>
            <Toaster />
        </div>
    );
};

export default App;