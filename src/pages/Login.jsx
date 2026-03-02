import { useState } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { oktaAuth } = useOktaAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });

    // Handle login with Okta
    const handleLogin = () => {
        oktaAuth.signInWithRedirect();
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
            
            {/* Animated Background Particles */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black opacity-70"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-96 h-96 animate-pulse opacity-20 rounded-full bg-blue-500 blur-3xl"></div>
                </div>
            </div>

            {/* Login Card with Futuristic Glow */}
            <div className="relative bg-gray-900 p-8 rounded-2xl shadow-lg w-96 text-center border border-gray-700 backdrop-blur-lg">
                <h1 className="text-4xl font-extrabold text-white mb-4">⚕️ Welcome to HEAL</h1>
                <p className="text-gray-400 mb-6">Your Health, Your Future</p>

                {/* 3D Animated Login Button */}
                <button 
                    onClick={handleLogin} 
                    className="w-full px-6 py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md transition transform hover:scale-105 hover:shadow-lg hover:shadow-purple-400/50"
                >
                    Login with Okta 🚀
                </button>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-b border-gray-600"></div>
                    <span className="mx-4 text-gray-400">OR</span>
                    <div className="flex-1 border-b border-gray-600"></div>
                </div>

                {/* Sign Up Link */}
                <p className="text-gray-400">
                    Don't have an account?{" "}
                    <button 
                        onClick={() => navigate("/signup")}
                        className="text-purple-400 font-semibold hover:underline transition hover:text-purple-500"
                    >
                        Sign Up Now
                    </button>
                </p>
            </div>
        </div>
    );
}
