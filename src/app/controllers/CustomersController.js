import Customer from "../models/Customer";
import Contact from "../models/Contact";
import { Op } from "sequelize";
import * as Yup from "yup";

import { parseISO } from "date-fns";

class CustomersController {

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

        const data = await Customer.findAll({
            include: [
                {
                    model: Contact,
                    attributes: ["id"]
                }
              ],
            where,
            order,
            limit,
            offset: limit * page - limit,
            
        });
        return res.json(data);
    }

    // Recupera um Customer
    async show(req, res) {
        const id = parseInt(req.params.id);
        const customer = await Customer.findByPk(id);
        const status = customer ? 200 : 404;

        console.debug("GET :: /customers/:id ", customer);

        return res.status(status).json(customer);
    }

    // Cria um novo Customer
    async create(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required("Name is required"),
            email: Yup.string().email("Not a valid email").required("E-mail is required"),
            status: Yup.string().uppercase(),
        });

        if (!(await schema.isValid(req.body))){
            return res.status(400).json({error: "Error on validate schema."});
        }

        const newCustomer = await Customer.create(req.body);

        return res.status(201).json(newCustomer);
    }

    // Atualiza um Customer
    async update(req, res) {
        const id = parseInt(req.params.id);

        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            status: Yup.string().uppercase(),
        });

        if (!(await schema.isValid(req.body))){
            return res.status(400).json({error: "Error on validate schema."});
        }

        const customerUpdate = await Customer.findByPk(id);
        await customerUpdate.update(req.body)
        const statusCode = customerUpdate ? 200 : 404;

        return res.status(statusCode).json(customerUpdate);
    }

    // Exclui um Customer
    async destroy(req, res) {
        const id = parseInt(req.params.id);
        //const index = customers.findIndex(item => item.id === id);
        const customerDestroy = await Customer.findByPk(id);
        if(!customerDestroy){
            return res.status(404).json({error: "Not found!"});
        }
        customerDestroy.destroy();

        return res.json();
    }
}

export default new CustomersController();