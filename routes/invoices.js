const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError')

router.get('/', async(req,res,next)=>{
    try{
        const results = await db.query(`SELECT * FROM invoices`);
        if(results.rows === 0){
            throw new ExpressError('No invoices found!', 404);
        }
        return res.status(200).json({
            invoices: results.rows
        })
    }catch(e){
        return next(e)
    }
})

router.get('/:id', async(req,res,next)=>{
    try{
        const {id} = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
        if(results.rowCount === 0){
            throw new ExpressError('Invoice Not found!', 404);
        }
        return res.status(200).json({
            invoice: results.rows[0]
        })
    }catch(e){
        return next(e);
    }
})

router.post('/', async(req,res,next)=>{
    try{
        const {comp_code, amt} = req.body;
        if(!comp_code || !amt){
            throw new ExpressError('Company code and amount are required!')
        }
        const checkCompany = await db.query(`SELECT * FROM companies WHERE code = $1`, [comp_code])
        if(checkCompany.rowCount === 0){
            throw new ExpressError(`Company with code ${comp_code} does not exists!`)
        }
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING *`, [comp_code, amt]);
        return res.status(201).json({invoice : results.rows[0] })
    }catch(e){
        return next(e)
    }
})

router.patch('/:id', async(req,res,next)=>{
    try{
        let {amt, paid} = req.body;
        if(!amt){
            throw new ExpressError('Amount is required!');
        }
        const {id} = req.params;
        let paidDate;
        const currResult = await db.query(`SELECT paid, paid_date FROM invoices WHERE id = $1`, [id]);
        if(currResult.rowCount === 0){
            throw new ExpressError(`Invoice ${id} not found!`, 404);
        }
        let currPaidDate = currResult.rows[0].paid_date;
        console.log(currPaidDate);
        if (paid === true) {
            if(currPaidDate === null){
                paidDate = new Date();
            }else{
                paidDate = currPaidDate;
            }
        }else if(paid === false){
            paidDate = null;
        }else{
            paidDate = currPaidDate;
        }
        console.log(paidDate);
        const result = await db.query(
            `UPDATE invoices
            SET amt=$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]);
        return res.status(200).json({"invoice": result.rows[0]});
    }catch(e){
        return next(e)
    }
});


router.delete('/:id', async(req,res,next)=>{
    try{
        const {id} = req.params;
        const checkInvoice = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
        if(checkInvoice.rowCount === 0){
            throw new ExpressError(`Invoice ${id} does not exists!`, 404)
        }
        await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING *`, [id])
        return res.json({status: 'Deleted'})
    }catch(e){
        return next(e)
    }
})

module.exports = router;