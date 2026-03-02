const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ✅ Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Patient Schema
const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dob: String,
  age: Number,
  weight: Number,
  height: Number,
  bloodGroup: String,
  medicalHistory: String,
  currentMedications: String,
  allergies: String,
  email: { type: String, unique: true, required: true },
  contact: String,
  oktaUserId: String
});

const Patient = mongoose.model("Patient", patientSchema);

// ✅ Doctor Schema
const doctorSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true, unique: true },
  specialization: String,
  phone: String,
  organization: String,
  experience: Number,
  consultationFee: Number,
  location: String,

  // ✅ Updated: Availability as an Array
  availability: [{
    day: String,   // e.g., "Monday"
    fromTime: String, // e.g., "09:00 AM"
    toTime: String   // e.g., "05:00 PM"
  }]
});

const Doctor = mongoose.model("Doctor", doctorSchema);



// ✅ Appointment Schema
const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: String,
  time: String,
  consultationType: { type: String, enum: ["In-Person", "Online"], required: true },
  reasonForVisit: String,
  status: { type: String, enum: ["Upcoming", "Completed", "Follow-up"], default: "Upcoming" },

  // ✅ Link to Payment & Medications
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Medication" },

  notes: String // ✅ Doctor's summary after consultation
});

const Appointment = mongoose.model("Appointment", appointmentSchema);


// ✅ User Registration (API-Based)
app.post("/register", async (req, res) => {
  try {
    console.log("📥 Received registration request:", req.body);

    const { firstName, lastName, email, password, dob, age, weight, height, bloodGroup, medicalHistory, contact } = req.body;

    if (!firstName || !lastName || !email || !password) {
      console.log("❌ Missing required fields!");
      return res.status(400).json({ error: "❌ Missing required fields!" });
    }

    console.log("✅ Checking if user already exists in Okta...");

    // ✅ Query Okta to check if the user already exists
    const existingUserResponse = await fetch(`https://dev-38151158.okta.com/api/v1/users/${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
      },
    });

    if (existingUserResponse.ok) {
      console.log("❌ User already exists in Okta:", email);
      return res.status(400).json({ error: "User with this email already exists!" });
    }

    console.log("✅ User does not exist in Okta. Proceeding with registration...");

    // ✅ Proceed with user registration in Okta
    const response = await fetch("https://dev-38151158.okta.com/api/v1/users?activate=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
      },
      body: JSON.stringify({
        profile: {
          firstName,
          lastName,
          email,
          login: email,
        },
        credentials: {
          password: { value: password }
        },
        groupIds: ["00gn5l3mshG2PupcD5d7"], 
      }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error("❌ Okta Registration Failed:", responseData);
      return res.status(400).json({ error: "Failed to register user in Okta", details: responseData });
    }

    console.log("✅ Okta Registration Successful:", responseData);
    const oktaUserId = responseData.id;

    console.log("📤 Saving user in MongoDB...");
    const newPatient = new Patient({
      firstName,
      lastName,
      email,
      oktaUserId,
      dob,
      age,
      weight,
      height,
      bloodGroup,
      medicalHistory,
      contact
    });

    await newPatient.save();

    console.log("✅ User registered successfully:", newPatient);
    res.status(201).json({ message: "🎉 Registration successful!", oktaUserId });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "❌ Server error! Please try again." });
  }
});

//get appointments
app.get("/get-appointments/:oktaUserId", async (req, res) => {
  try {
    const { oktaUserId } = req.params;
    let { status } = req.query;

    if (!oktaUserId) {
      return res.status(400).json({ error: "❌ Okta User ID is required!" });
    }

    // ✅ Find Patient in MongoDB by Okta ID
    const patient = await Patient.findOne({ oktaUserId });

    if (!patient) {
      return res.status(404).json({ error: "❌ Patient not found in database!" });
    }

    // ✅ Convert Okta ID to MongoDB Patient ID
    const patientId = patient._id;

    // ✅ Handle Status Filtering
    const validStatuses = ["Upcoming", "Completed", "Follow-up", "Previous"];
    if (!status || status === "All") {
      status = null;
    } else if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "❌ Invalid status value!" });
    }

    // ✅ Build Query with Correct MongoDB ObjectId
    let query = { patientId };
    if (status) {
      query.status = status;
    }

    // ✅ Fetch Appointments
    const appointments = await Appointment.find(query)
      .populate("doctorId", "fullName specialization")
      .exec();

    res.json(appointments);

  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ error: "❌ Internal Server Error" });
  }
});

// ✅ Get prescriptions for a specific patient
app.get("/get-prescriptions/:oktaUserId", async (req, res) => {
  try {
    const { oktaUserId } = req.params;

    // 1️⃣ Find the patient using their Okta ID
    const patient = await Patient.findOne({ oktaUserId });
    if (!patient) {
      return res.status(404).json({ error: "❌ Patient not found in database!" });
    }

    // 2️⃣ Get patientId from MongoDB (this is the real ObjectID)
    const patientId = patient._id;

    // 3️⃣ Fetch only "Completed" appointments (which contain prescriptions)
    const prescriptions = await Appointment.find({ patientId, status: "Completed" })
      .populate("doctorId", "fullName specialization")  // Fetch doctor details
      .select("date time doctorNotes medications payment");  // Select fields to return

    // 4️⃣ Return JSON response
    res.json(prescriptions);
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error);
    res.status(500).json({ error: "❌ Internal Server Error" });
  }
});

// ✅ Get Payment History for a Patient
app.get("/get-payments/:oktaUserId", async (req, res) => {
  try {
    const { oktaUserId } = req.params;
    const { search, sort } = req.query;

    if (!oktaUserId) {
      return res.status(400).json({ error: "Patient ID is required!" });
    }

    // ✅ Find the patient using Okta ID
    const patient = await Patient.findOne({ oktaUserId });

    if (!patient) {
      return res.status(404).json({ error: "❌ Patient not found in database!" });
    }

    // ✅ Extract the correct MongoDB ObjectId
    const patientId = patient._id;

    // ✅ Build query using MongoDB ObjectId
    let query = { patientId };

    // ✅ Search by doctorName or transactionId
    if (search) {
      query.$or = [
        { "doctorId.fullName": { $regex: search, $options: "i" } },
        { transactionId: { $regex: search, $options: "i" } }
      ];
    }

    // ✅ Fetch Payments, populate Doctor details
    let payments = await Appointment.find(query)
      .populate("doctorId", "fullName specialization")
      .select("date payment doctorId")
      .exec();

    // ✅ Sort Payments
    payments = payments.sort((a, b) => 
      sort === "oldest" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
    );

    res.json(payments);
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get Medical History by Okta User ID
app.get("/get-medical-history/:oktaUserId", async (req, res) => {
  try {
    const { oktaUserId } = req.params;
    const patient = await Patient.findOne({ oktaUserId });

    if (!patient) {
      return res.status(404).json({ error: "❌ Patient not found!" });
    }

    res.json(patient);
  } catch (error) {
    console.error("❌ Error fetching medical history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Update Medical History
app.put("/update-medical-history/:oktaUserId", async (req, res) => {
  try {
    const { oktaUserId } = req.params;
    const updateFields = {
      age: req.body.age,
      weight: req.body.weight,
      height: req.body.height,
      bloodGroup: req.body.bloodGroup,
      medicalHistory: req.body.medicalHistory,
      currentMedications: req.body.currentMedications,  // ✅ Ensure it's included
      allergies: req.body.allergies  // ✅ Ensure it's included
    };

    const updatedPatient = await Patient.findOneAndUpdate(
      { oktaUserId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ error: "Patient not found!" });
    }

    res.json({ message: "✅ Medical history updated!", updatedPatient });
  } catch (error) {
    console.error("❌ Error updating medical history:", error);
    res.status(500).json({ error: "Server error! Please try again." });
  }
});

//doctors
app.put("/doctor/set-availability/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { availability } = req.body;

    // Validate input
    if (!Array.isArray(availability) || availability.length === 0) {
      return res.status(400).json({ error: "❌ Invalid availability format!" });
    }

    // Find existing doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "❌ Doctor not found!" });
    }

    // ✅ Merge new availability with existing ones (Prevent Duplicates)
    const updatedAvailability = [
      ...doctor.availability.filter((existingSlot) =>
        !availability.some((newSlot) => newSlot.day === existingSlot.day)
      ),
      ...availability,
    ];

    // ✅ Update availability in MongoDB
    doctor.availability = updatedAvailability;
    await doctor.save();

    console.log("✅ Availability Updated in DB:", updatedAvailability);
    res.json({ message: "✅ Availability updated successfully!", doctor });

  } catch (error) {
    console.error("❌ Error updating availability:", error);
    res.status(500).json({ error: "❌ Server error! Please try again." });
  }
});

app.get("/doctor/availability/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId).select("availability");

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found!" });
    }

    res.json(doctor.availability);
  } catch (error) {
    console.error("❌ Error fetching availability:", error);
    res.status(500).json({ error: "❌ Server error! Please try again." });
  }
});

app.get("/get-doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find(); // Fetch all doctors
    res.json(doctors);
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({ error: "❌ Server error! Please try again." });
  }
});

// ✅ Get available slots for a doctor on a specific date
app.get("/doctor/available-slots/:doctorId/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Find doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "❌ Doctor not found!" });

    // Get the day of the week from the date
    const dayOfWeek = new Date(date).toLocaleString("en-US", { weekday: "long" });

    // Find available timings for that day
    const availability = doctor.availability.find(slot => slot.day === dayOfWeek);
    if (!availability) return res.status(400).json({ error: "❌ No available slots on this date!" });

    res.json({ availableTimes: availability.timeSlots });
  } catch (error) {
    console.error("❌ Error fetching available slots:", error);
    res.status(500).json({ error: "❌ Server error! Please try again." });
  }
});


// ✅ Get Profile Data
app.get("/get-profile/:oktaUserId", async (req, res) => {
  try {
    const { oktaUserId } = req.params;

    // ✅ Find the patient by oktaUserId as a string
    const patient = await Patient.findOne({ oktaUserId: oktaUserId });

    if (!patient) {
      console.log("❌ Patient not found in database!");
      return res.status(404).json({ error: "❌ Patient not found in database!" });
    }

    res.json(patient);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ error: "❌ Internal Server Error" });
  }
});

// ✅ Update Profile
app.put("/update-profile/:id", async (req, res) => {
  try {
    const updatedProfile = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ✅ Delete Profile
app.delete("/delete-profile/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
