import Contact from "../models/Contact";
import { Op } from "sequelize";
import * as Yup from "yup";

import { parseISO } from "date-fns";
import Customer from "../models/Customer";

class ContactsController {

    async index(req, res) {
        const { 
            name,
            email,
            status,
            createdBefore,
            createdAfter,
            updateBefore,
            updateAfter,
            sort
        } = req.query;

        const page = req.query.page || 1;
        const limit = req.query.limit || 25;

        let where = {customer_id: req.params.customerId};
        let order = [];

        if (name) {
            where = {
                ...where,
                name: {
                    [Op.iLike]: name,
                }
            }
        }

        if (status) {
            where = {
                ...where,
                status: {
                    [Op.in]: status.split(",").map(item => item.toUpperCase()),
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

        const data = await Contact.findAll({
            include: [
                {
                    model: Customer,
                    attributes: ["id"],
                    required: true,
                }
              ],
            where,
            order,
            limit,
            offset: limit * page - limit,
            
        });
        return res.json(data);
    }

    // Recupera um contact
    async show(req, res) {
        const contact = await Contact.findOne({
            where: {
                customer_id: req.params.customerId,
                id: req.params.id
            },
            attributes: {
                exclude: [
                    "customer_id", "customerId"
                ]
            }
        });

        if (!contact){
            return res.status(404).json({error: "Not Found."});
        }

        console.debug("GET :: /Contact/:id ", contact);

        return res.status(200).json(contact);
    }

    // Cria um novo contact
    async create(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required("Name is required"),
            email: Yup.string().email("Not a valid email").required("E-mail is required"),
            status: Yup.string().uppercase(),
        });

        if (!(await schema.isValid(req.body))){
            return res.status(400).json({error: "Error on validate schema."});
        }

        const newcontact = await Contact.create({
            customerId: req.params.customerId,
            ...req.body,
        });

        return res.status(201).json(newcontact);
    }

    // Atualiza um contact
    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            status: Yup.string().uppercase(),
        });

        if (!(await schema.isValid(req.body))){
            return res.status(400).json({error: "Error on validate schema."});
        }

        const contactUpdate = await Contact.findOne({
            where: {
                customer_id: req.params.customerId,
                id: req.params.id
            }
        });

        if (!contactUpdate){
            return res.status(404).json({error: "Not Found"});
        }
        await contactUpdate.update(req.body)

        return res.json(contactUpdate);
    }

    // Exclui um contact
    async destroy(req, res) {
        const contactDestroy = await Contact.findOne({
            where: {
                customer_id: req.params.customerId,
                id: req.params.id
            }
        });

        if (!contactDestroy){
            return res.status(404).json({error: "Not Found"});
        }
        contactDestroy.destroy();

        return res.json();
    }
}

export default new ContactsController();