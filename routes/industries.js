const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async(req,res,next)=>{
    try{
        const results = await db.query(`SELECT * FROM industries`);
        if(results.rowCount === 0){
            throw new ExpressError('No Industries found!', 404);
        }
        let industryInfo = {}
        let data = await db.query(
            `SELECT ind.industry, ic.comp_code
            FROM industries AS ind
            LEFT JOIN industry_company AS ic
            ON ind.industry = ic.industry
            LEFT JOIN companies AS c
            ON ic.comp_code = c.code`)
        let indCount = data.rows.length
        for(let i = 0; i < indCount; i++){
            let add = data.rows[i]
            console.log(add)

            let k = add.industry
            let v = add.comp_code
            if(industryInfo.hasOwnProperty(k)){
                industryInfo[k].push(v)
            } else{
                industryInfo[k] = [v]
            }
        }
        return res.send(industryInfo)
    }catch(e){
        return next(e);
    }
})

router.post('/', async(req,res,next)=>{
    try{
        const {industry} = req.body;
        if(!industry){
            throw new ExpressError('Industry is required!', 404)
        }
        const checkDuplicate = await db.query(`SELECT industry FROM industries WHERE industry = $1`, [industry])
        if(checkDuplicate.rowCount !== 0){
            throw new ExpressError(`Industry already exists!`, 500)
        }
        const results = await db.query(`INSERT INTO industries (industry) VALUES ($1) RETURNING *`, [industry]);
        return res.status(201).json({industry : results.rows[0] })
    }catch(e){
        return next(e)
    }
})

router.post('/:industry', async (req,res,next)=>{
    try{
        const {industry} = req.params;
        const {comp_code} = req.body;
        if(!industry || !comp_code){
            throw new ExpressError('Industry and company code are required!', 404)
        }
        const checkIndustry = await db.query(`SELECT industry FROM industries WHERE industry = $1`, [industry]);
        if(checkIndustry.rowCount === 0){
            throw new ExpressError('Invalid industry!', 404)
        }
        const checkCompany = await db.query(`SELECT name FROM companies WHERE code = $1`, [comp_code]);
        if(checkIndustry.rowCount === 0){
            throw new ExpressError('Invalid industry!', 404)
        }
        const results = await db.query(
            `INSERT INTO industry_company (industry, comp_code) 
            VALUES ($1, $2)
             RETURNING *`, [industry, comp_code]);
        return res.status(201).json({status : 'created'})

    }catch(e){
        return next(e)
    }
})


module.exports = router;
