import jsonwebtoken from "jsonwebtoken"
import { nanoid } from "nanoid"

export const generateNanoId = (length) => {
    return nanoid(length)
}

export const signToken = (payload) => {
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {expiresIn: "5m"})
}

export const verifyToken = (payload) => {
    const decoded = jsonwebtoken.verify(payload, process.env.JWT_SECRET);
    return decoded.id;
}