import { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { Navigate } from "react-router-dom";

const SecureRoute = ({ allowedRoles, children }) => {
  const { authState, oktaAuth } = useOktaAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authState) return; // Wait for authState to load

    if (authState.isAuthenticated) {
      oktaAuth.getUser().then((user) => {
        console.log("🔍 SecureRoute Debug: Retrieved user from Okta:", user);
        
        let role = "Patient"; // Default Role
        const userGroups = user.groups || [];

        if (userGroups.includes("HEAL_Admins")) role = "Admin";
        else if (userGroups.includes("HEAL_Doctors")) role = "Doctor";

        console.log(`🎯 Assigned Role - ${role}`);
        setUserRole(role);
        setLoading(false);
      }).catch((error) => {
        console.error("❌ Error fetching user:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [authState, oktaAuth]);

  if (loading) return <h1>Loading...</h1>; // Prevent premature redirects

  if (!authState?.isAuthenticated) {
    console.log("🔄 User not authenticated. Redirecting to login...");
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.log("🚫 Access Denied");
    return <h1>🚫 Access Denied</h1>;
  }

  return children;
};

export default SecureRoute;
