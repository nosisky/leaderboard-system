import { APIGatewayProxyHandler } from "aws-lambda";
import { signup, login, confirm} from "./handlers/auth";
import { submitScore, getLeaderboard } from "./handlers/scores";
import { connect, disconnect, message } from "./handlers/websocket";

export const signupHandler: APIGatewayProxyHandler = signup;
export const loginHandler: APIGatewayProxyHandler = login;
export const submitScoreHandler: APIGatewayProxyHandler = submitScore;
export const getLeaderboardHandler: APIGatewayProxyHandler = getLeaderboard;
export const confirmHandler: APIGatewayProxyHandler = confirm;
export const connectHandler: APIGatewayProxyHandler = connect;
export const disconnectHandler: APIGatewayProxyHandler = disconnect;
export const messageHandler: APIGatewayProxyHandler = message;

export const handlers = {
  signup: signupHandler,
  login: loginHandler,
  submitScore: submitScoreHandler,
  getLeaderboard: getLeaderboardHandler,
  confirm: confirmHandler,
  connect: connectHandler,
  disconnect: disconnectHandler,
  message: messageHandler,
};
