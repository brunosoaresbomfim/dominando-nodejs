import User from "../models/User";
import { Op } from "sequelize";
import * as Yup from "yup";

import Mail from "../../lib/Mail";

import { parseISO } from "date-fns";

class UsersController {

    async index(req, res) {
        const { 
            name,
            email,
            createdBefore,
            createdAfter,
            updateBefore,
            updateAfter,
            sort
        } = req.query;

        const page = req.query.page || 1;
        const limit = req.query.limit || 25;

        let where = {};
        let order = [];

        if (name) {
            where = {
                ...where,
                name: {
                    [Op.iLike]: name,
                }
            }
        }

        if (email) {
            where = {
                ...where,
                email: {
                    [Op.iLike]: email,
                }
            }
        }

        if (createdBefore) {
            where = {
                ...where,
                createdAt: {
                    [Op.gte]: parseISO(createdBefore),
                }
            }
        }

        if (createdAfter) {
            where = {
                ...where,
                createdAt: {
                    [Op.lte]: parseISO(createdAfter),
                }
            }
        }

        if (updateBefore) {
            where = {
                ...where,
                updatedAt: {
                    [Op.gte]: parseISO(updateBefore),
                }
            }
        }

        if (updateAfter) {
            where = {
                ...where,
                updatedAt: {
                    [Op.lte]: parseISO(updateAfter),
                }
            }
        }

        if (sort) {
            order = sort.split(",").map(item => item.split(":"));
        }

        const data = await User.findAll({
            where,
            attributes: {
                exclude: ["password_hash", "password", "fileId"], 
            },
            order,
            limit,
            offset: limit * page - limit,
            
        });
        console.log({ userId: req.userId });
        return res.json(data);
    }

    // Recupera um User
    async show(req, res) {
        const id = parseInt(req.params.id);
        const user = await User.findByPk(id, {
            attributes: {
                exclude: ["password_hash", "password", "fileId"], 
            }
        });
        if(!user) {
            return res.status(404).json({error: "Not found!"});
        }
        console.debug("GET :: /customers/:id ", user);

        return res.status(200).json(user);
    }

    // Cria um novo User
    async create(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required("Name is required"),
            email: Yup.string().email("Not a valid email").required("E-mail is required"),
            password: Yup.string().required("Password is required").min(8),
            passwordConfirmation: Yup.string().when("password", (password, field) => 
                   password ? field.required().oneOf([Yup.ref("password")]) : field
            )
        });

        if (!(await schema.isValid(req.body))){
            return res.status(400).json({error: "Error on validate schema."});
        }
    
        const { id, name, email, file_id, createdAt, updatedAt} = await User.create(req.body);

        Mail.send({
            to: email,
            subject: "Bem vindo(a)",
            text: `Olá, ${name}, bem vindo(a) ao nosso sistema.` 
        })

        return res.status(201).json({ id, name, email, file_id, createdAt, updatedAt});
    }

    // Atualiza um User
    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email("Not a valid email"),
            oldPassword: Yup.string().min(8),
            password: Yup.string().min(8).when("oldPassword", (oldPassword, field) => {
                oldPassword ? field.required() : field
            }),
            passwordConfirmation: Yup.string().when("password", (password, field) => 
                   password ? field.required().oneOf([Yup.ref("password")]) : field
            )
        });

        if (!(await schema.isValid(req.body))){
            return res.status(400).json({error: "Error on validate schema."});
        }

        const user = await User.findByPk(req.params.id);

        if(!user) {
            return res.status(404).json({error: "Not found!"});
        }

        const { oldPassword } = req.body;

        if(oldPassword && !(await user.checkPassword(oldPassword))){
            return res.status(401).json({error: "User password not match!"});
        }

        const { id, name, email, file_id, createdAt, updatedAt} = await user.update(req.body);

        return res.status(200).json({ id, name, email, file_id, createdAt, updatedAt});
    }

    // Exclui um User
    async destroy(req, res) {
        const userDestroy = await User.findByPk(req.params.id);
        if(!userDestroy){
            return res.status(404).json({error: "Not found!"});
        }
        userDestroy.destroy();

        return res.json();
    }
}

export default new UsersController();