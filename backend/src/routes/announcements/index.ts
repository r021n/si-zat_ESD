import { Hono } from "hono";
import topicsRoute from "./topics.js";
import discussionsRoute from "./discussions.js";
import submissionsRoute from "./submissions.js";
import peerReviewRoute from "./peerReview.js";
import { invalidateAnnouncementsServerCache } from "./cache.js";

const announcementsRoute = new Hono();

// Mount specific sub-routes before topics route to avoid parameter shadows
announcementsRoute.route("/", submissionsRoute);
announcementsRoute.route("/", peerReviewRoute);
announcementsRoute.route("/", discussionsRoute);
announcementsRoute.route("/", topicsRoute);

export { invalidateAnnouncementsServerCache };
export default announcementsRoute;
