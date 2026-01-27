import { getAllUserUrls } from "../dao/user.dao.js";
import wrapAsync from "../utils/tryCatchWrapper.js";

export const get_all_user_urls = wrapAsync( async(req, res) => {
    const {_id} = req.user;
    const urls = await getAllUserUrls(_id);
    res.status(200).json({urls: urls})
})