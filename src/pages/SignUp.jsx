import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Define Blood Groups & Genders outside component
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Prefer not to say"];

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    contact: "", dob: "", age: "", gender: "", weight: "", height: "",
    bloodGroup: "", medicalHistory: "", allergies: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Name validation: Only alphabets allowed
    if ((name === "firstName" || name === "lastName") && !/^[A-Za-z ]*$/.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: "Only alphabets allowed!" }));
      return;
    }

    // Contact number validation: Exactly 10 digits
    if (name === "contact" && !/^\d{0,10}$/.test(value)) {
      return;
    }

    // Auto-calculate age when DOB is selected
    if (name === "dob") {
      const today = new Date();
      const birthDate = new Date(value);
      if (birthDate >= today) {
        setErrors((prev) => ({ ...prev, dob: "DOB must be before today!" }));
      } else {
        const age = today.getFullYear() - birthDate.getFullYear();
        setFormData({ ...formData, dob: value, age: age.toString() });
        setErrors((prev) => ({ ...prev, dob: "", age: "" }));
      }
      return;
    }

    // Height & Weight Validation: Max 3 Digits
    if ((name === "weight" || name === "height") && !/^\d{0,3}$/.test(value)) {
      return;
    }

    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "Required!";
      if (!formData.lastName.trim()) newErrors.lastName = "Required!";
      if (!/^[A-Za-z ]+$/.test(formData.firstName)) newErrors.firstName = "Only alphabets!";
      if (!/^[A-Za-z ]+$/.test(formData.lastName)) newErrors.lastName = "Only alphabets!";
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid Email!";
      if (formData.password.length < 6) newErrors.password = "Min 6 characters!";
      if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords do not match!";
      if (formData.contact.length !== 10) newErrors.contact = "Must be 10 digits!";
    } else if (step === 2) {
      if (!formData.dob) newErrors.dob = "DOB is required!";
      if (!formData.age) newErrors.age = "Invalid Age!";
      if (!genders.includes(formData.gender)) newErrors.gender = "Select a valid gender!";
      if (!bloodGroups.includes(formData.bloodGroup)) newErrors.bloodGroup = "Select a valid blood group!";
      if (!/^\d{1,3}$/.test(formData.weight)) newErrors.weight = "Must be a number (Max 999 kg)!";
      if (!/^\d{1,3}$/.test(formData.height)) newErrors.height = "Must be a number (Max 999 cm)!";
    } else if (step === 3) {
      if (!formData.medicalHistory.trim()) newErrors.medicalHistory = "Enter Medical History!";
      if (!formData.allergies.trim()) newErrors.allergies = "Enter Allergies (if none, type 'None')";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
  
    try {
      const response = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, // ✅ Sends firstName & lastName separately
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("🎉 Registration successful! You can now log in.");
        navigate("/login");
      } else {
        alert(`⚠ Registration failed: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Registration Error:", error);
      alert("❌ An error occurred during registration.");
    }
  };  

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black opacity-70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 animate-pulse opacity-20 rounded-full bg-blue-500 blur-3xl"></div>
        </div>
      </div>

      {/* SignUp Card */}
      <div className="relative bg-gray-900 p-8 rounded-2xl shadow-lg w-[380px] text-center border border-gray-700 backdrop-blur-lg">
        <h1 className="text-4xl font-extrabold text-white mb-4">⚕️ Join HEAL</h1>
        <p className="text-gray-400 mb-6">Your Health, Your Future</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {step === 1 && (
            <>
              <FloatingInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
              <FloatingInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
              <FloatingInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
              <PasswordInput label="Password" name="password" value={formData.password} onChange={handleChange} error={errors.password} showPassword={showPassword} setShowPassword={setShowPassword} />
              <PasswordInput label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} showPassword={showConfirmPassword} setShowPassword={setShowConfirmPassword} />
              <FloatingInput label="Contact Number" name="contact" type="tel" value={formData.contact} onChange={handleChange} error={errors.contact} />
            </>
          )}

          {step === 2 && (
            <>
              <FloatingInput label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} error={errors.dob} />
              <FloatingInput label="Age" name="age" type="number" value={formData.age} onChange={handleChange} disabled />
              <DropdownInput label="Gender" name="gender" value={formData.gender} onChange={handleChange} error={errors.gender} options={genders} />
              <DropdownInput label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} error={errors.bloodGroup} options={bloodGroups} />
              <FloatingInput label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} error={errors.weight} />
              <FloatingInput label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} error={errors.height} />
            </>
          )}

          {step === 3 && (
            <>
              <TextAreaInput label="Medical History" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} error={errors.medicalHistory} />
              <TextAreaInput label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} error={errors.allergies} />
            </>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="w-2/3 px-6 py-3 text-lg font-bold bg-gray-700 text-white rounded-lg shadow-md transition transform hover:scale-105">
                ← Back
              </button>
            )}

            <button type={step === 3 ? "submit" : "button"} onClick={step === 3 ? undefined : handleNext} className="w-2/3 px-6 py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md transition transform hover:scale-105">
              {step === 3 ? "Sign Up 🚀" : "Next →"}
            </button>
          </div>

          {/* Login Redirection */}
          <p className="text-gray-400 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-purple-400 font-semibold hover:underline transition hover:text-purple-500"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

function PasswordInput({ label, name, value, onChange, error, showPassword, setShowPassword }) {
  return (
    <div className="relative">
      <input type={showPassword ? "text" : "password"} name={name} value={value} onChange={onChange} placeholder=" " className="input-field peer" required />
      <label className="floating-label">{label}</label>
      <button type="button" className="absolute right-3 top-3 text-gray-400" onClick={() => setShowPassword(!showPassword)}>👁</button>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function FloatingInput({ label, name, type = "text", value, onChange, error }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" " // This makes floating label work
        className="input-field peer"
        required
      />
      <label className="floating-label">{label}</label>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function DropdownInput({ label, name, value, onChange, error, options }) {
  return (
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className="input-field peer bg-gray-800 text-white border border-gray-700 rounded-md focus:border-purple-400">
        <option value="" disabled>Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-gray-900">{option}</option>
        ))}
      </select>
      <label className="floating-label">{label}</label>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function TextAreaInput({ label, name, value, onChange, error }) {
  return (
    <div className="relative">
      <textarea name={name} value={value} onChange={onChange} placeholder=" " className="input-field peer h-24 resize-none" required></textarea>
      <label className="floating-label">{label}</label>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}