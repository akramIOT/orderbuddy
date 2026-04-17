import Session from "supertokens-web-js/recipe/session";
import { logExceptionError } from "../utils/errorLogger";

export const checkSessionStatus = async () => {
  try {
    return await Session.doesSessionExist();
  } catch (error) {
    logExceptionError(
      error instanceof Error ? error : new Error(String(error)),
      'checkSessionStatus',
      {}
    );
    console.error("Session check error:", error);
    return false;
  }
};
