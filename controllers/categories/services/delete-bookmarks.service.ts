import { Request, Response } from "express";
import { Reference } from "@firebase/database-types";
import { ResponseHandler } from "../../../services";
import { MY_USER_ID } from "../../..";

// Error messages
const NOBOOKMARK_ERROR = { message: "Bookmark does not exist" };
const FIREBASE_ERROR = { message: "Error removing bookmark" };

export async function deleteBookmarksFromCategory(
  req: Request,
  res: Response,
  usersRef: Reference,
) {
  try {
    // user must have a session
    const userId = MY_USER_ID;
    const categoryId = req.params.categoryId;
    const bookmarksToDelete: string[] = req.body.bookmarkIdsToDelete;
    // get a ref to the bookmarks object
    const bookmarksRef = usersRef.child(`${userId}/bookmarks`);
    // Category must exist before any operations
    await usersRef
      .child(`${userId}/categories/${categoryId}`)
      .once("value", async (categorySnapshot) => {
        if (categorySnapshot.exists()) {
          await bookmarksRef.once(
            "value",
            (bookmarksSnapshot) => {
              if (!bookmarksSnapshot.exists()) {
                return ResponseHandler.clientError(
                  res,
                  "No bookmarks in this category.",
                  404,
                );
              } else {
                // flag to track errors
                let ERROR_FLAG = false;
                bookmarksToDelete.forEach(async (bookmarkId) => {
                  try {
                    if (bookmarksSnapshot.hasChild(bookmarkId)) {
                      await bookmarksRef.child(bookmarkId).remove((err) => {
                        if (err) {
                          // TODO: log to logging service
                          console.log(
                            `Error removing bookmark see description below: \n ${err}`,
                          );
                          ERROR_FLAG = true;
                          throw FIREBASE_ERROR;
                        }
                      });
                    } else {
                      ERROR_FLAG = true;
                      throw NOBOOKMARK_ERROR;
                    }
                  } catch (err) {
                    if (err === NOBOOKMARK_ERROR) {
                      return ResponseHandler.clientError(
                        res,
                        "Bookmark does not exist",
                      );
                    } else if (err === FIREBASE_ERROR) {
                      return ResponseHandler.serverError(
                        res,
                        "There was an error removing this bookmark. please try again.",
                      );
                    }
                  }
                });
                if (!ERROR_FLAG) {
                  // return success message
                  return ResponseHandler.requestSuccessful({
                    res,
                    message: "Bookmarks deleted successfully",
                  });
                }
              }
            },
            (errorObject) => {
              // TODO: log to logging service
              console.log(
                `error accessing bookmarks \n ${errorObject.name} : ${errorObject.message}`,
              );
              return ResponseHandler.serverError(
                res,
                "There was an error accessing your bookmarks",
              );
            },
          );
        } else {
          return ResponseHandler.clientError(res, "Category does not exist.");
        }
      });
  } catch (err) {
    // TODO: log to logging service
    console.log(`Error adding bookmarks to category, see below : \n ${err}`);
    return ResponseHandler.clientError(
      res,
      "Error adding bookmarks to category",
    );
  }
}
