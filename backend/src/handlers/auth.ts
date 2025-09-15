import { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { calculateSecretHash, validatePassword, validateEmail, validateUsername, sanitizeInput } from "../utils";

const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET!;
const REGION = process.env.COGNITO_REGION || "eu-north-1";

if (!CLIENT_ID || !CLIENT_SECRET) throw new Error("Missing COGNITO_CLIENT_ID or COGNITO_CLIENT_SECRET");

const client = new CognitoIdentityProviderClient({ region: REGION });

const baseHeaders = { "Access-Control-Allow-Origin": "*" };

export const signup: APIGatewayProxyHandler = async (event) => {
  if (!event.body) return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Request body required" }) };

  const { email, password, username, name } = JSON.parse(event.body);

  const emailError = validateEmail(email);
  const usernameError = validateUsername(username);
  const passwordError = validatePassword(password);
  if (emailError || usernameError || passwordError || !name?.trim()) {
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: emailError || usernameError || passwordError || "Name required" }) };
  }

  const sanitizedEmail = sanitizeInput(email);
  const sanitizedUsername = sanitizeInput(username);
  const sanitizedName = sanitizeInput(name);

  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: sanitizedUsername,
      Password: password,
      SecretHash: calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET),
      UserAttributes: [
        { Name: "email", Value: sanitizedEmail },
        { Name: "preferred_username", Value: sanitizedUsername },
        { Name: "name", Value: sanitizedName },
      ],
    });
    await client.send(command);
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ message: "User registered successfully. Check your email." }) };
  } catch (err: any) {
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: err.message || "Signup failed" }) };
  }
};

export const login: APIGatewayProxyHandler = async (event) => {
  if (!event.body) return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Request body required" }) };

  const { username, password } = JSON.parse(event.body);
  if (!username?.trim() || !password?.trim()) return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Username and password required" }) };

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET),
      },
    });
    const response = await client.send(command);
    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({
        message: "Login successful",
        idToken: response.AuthenticationResult?.IdToken,
        accessToken: response.AuthenticationResult?.AccessToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        expiresIn: response.AuthenticationResult?.ExpiresIn,
      }),
    };
  } catch (err: any) {
    return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: err.message || "Login failed" }) };
  }
};

export const confirm: APIGatewayProxyHandler = async (event) => {
  if (!event.body) return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Request body required" }) };

  const { username, code } = JSON.parse(event.body);
  if (!username?.trim() || !code?.trim() || code.length !== 6) return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Username and 6-char code required" }) };

  try {
    await client.send(new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: code,
      SecretHash: calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET),
    }));
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ message: "User confirmed successfully" }) };
  } catch (err: any) {
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: err.message || "Confirmation failed" }) };
  }
};
