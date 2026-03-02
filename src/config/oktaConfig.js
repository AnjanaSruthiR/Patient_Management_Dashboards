export const oktaConfig = {
  clientId: "0oan5ita89eUks4yG5d7",
  issuer: "https://dev-38151158.okta.com/oauth2/default",
  redirectUri: window.location.origin + "/login/callback",
  scopes: ["openid", "profile", "email", "groups"],
  pkce: true,
};
