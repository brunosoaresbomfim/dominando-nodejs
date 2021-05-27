import User from "../models/User";
import jwt from "jsonwebtoken";
import authConfig from "../../config/auth";

class SessionsController{

    async create (req, res) {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: {
                email
            }
        })

        //verify if exists user
        if(!user){
            return res.status(401).json({error: "User or password not found!"});
        }

        // verify password
        if(! ( await user.checkPassword(password))){
            return res.status(401).json({error: "User or password not found!"});
        }

        const { id, name } = user;

        return res.json({
            user: {
                id,
                name, 
                email
            },
            token: jwt.sign({ id }, authConfig.secret, {
                expiresIn: authConfig.expiresIn
            })
        });
    }


}


export default new SessionsController();