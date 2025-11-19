import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../services";
//  session checker middleware
export function hasSession(req: Request, res: Response, next: NextFunction) {
  // if (!MY_USER_ID) {
  //   console.log("no session for some reason.");
  //   console.log(req.session);
  //   return ResponseHandler.clientError(res, "User not logged in.");
  // } else {
  return next();
  // }
}
