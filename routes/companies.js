const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const slugify = require("slugify")

router.get('/', async(req,res,next)=>{
    try{
        const results = await db.query(`SELECT * FROM companies`);
        if(results.rows === 0){
            throw new ExpressError('No Companies found!', 404);
        }
        return res.status(200).json({
            companies: results.rows
        })
    }catch(e){
        return next(e);
    }
})

router.get('/:code', async(req,res,next)=>{
    try{
        const {code} = req.params;
        // debugger
        const results = await db.query(
            `SELECT code , name, description, ic.industry
            FROM companies
            LEFT JOIN industry_company AS ic
            ON code = ic.comp_code
            WHERE code = $1`, [code]);
        if(results.rowCount === 0){
            throw new ExpressError('Company Not found!', 404);
        }
        console.log(results.rows)
        const invc = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [code])
        const invoices = invc.rows
        const {c, name, description} = results.rows[0]
        const industries = results.rows.map(r=>r.industry)
        return res.status(200).json({c,name,description,industries,invoices})
    }catch(e){
        return next(e);
    }
})

router.post('/', async(req,res,next)=>{
    try{
        const {code, name, description} = req.body;
        if(!code || !name || !description){
            throw new ExpressError('Code, name, and description are required!')
        }
        const slugCode = slugify(code, {replacement: '_', remove: undefined, lower:true})
        const checkDuplicate = await db.query(`SELECT * FROM companies WHERE code = $1`, [slugCode])
        if(checkDuplicate.rowCount !== 0){
            throw new ExpressError(`Company with code ${code} already exists!`, 500)
        }
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) RETURNING *`, [slugCode, name, description]);
        return res.status(201).json({company : results.rows[0] })
    }catch(e){
        return next(e)
    }
})

router.patch('/:code', async(req,res,next)=>{
    try{
        const {name, description} = req.body
        if(!name || !description){
            throw new ExpressError('Name and description are required!')
        }
        const {code} = req.params;
        const checkCompany = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        if(checkCompany.rowCount === 0){
            throw new ExpressError(`Company with code ${code} does not exists!`, 404)
        }
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
            [name, description, code]
        );
        return res.status(200).json({company: results.rows[0]})
    }catch(e){
        return next(e)
    }
})

router.delete('/:code', async(req,res,next)=>{
    try{
        const {code} = req.params;
        const checkCompany = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        if(checkCompany.rowCount === 0){
            throw new ExpressError(`Company with code ${code} does not exists!`, 404)
        }
        await db.query(`DELETE FROM companies WHERE code = $1 RETURNING *`, [code])
        return res.status(200).json({status: 'Deleted'})
    }catch(e){
        return next(e)
    }
})

module.exports = router;