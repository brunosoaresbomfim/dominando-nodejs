import jwt from "jsonwebtoken";
import { promisify } from "util";

import authConfig from "../../config/auth";

export default async (req, res, next) => {
    
    const  authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({error: "Token was not provided."});
    }

    //Pega apenas o token
    const [, token] = authHeader.split(" ");

    try {
        // foi necessário user o promisify pos o verify do jwt não suport async await
        const decode = await promisify(jwt.verify)(token, authConfig.secret);

        req.userId = decode.id;

        return next();
    } catch (error) {
        return res.status(401).json({error: "Token invalid."});
    }
    
}