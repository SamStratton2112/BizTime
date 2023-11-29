process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('./app')
const db = require('./db')

let testInv;
let testCompany;
let testInd;



beforeEach(async()=>{
    const coRes = await db.query(`INSERT INTO companies (code,name,description) VALUES ('test2','test_co', 'teeeeeeest') RETURNING *`)
    const res = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test2', '100') RETURNING *`)
    const indRes = await db.query(`INSERT INTO industries (industry) VALUES ('testIndustry') RETURNING *`)
    testCompany = coRes.rows[0]
    testInv= res.rows[0];
    testInd = indRes.rows[0];
})

afterEach(async()=>{
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM industries`);
})

afterAll(async()=>{
    await db.end();
})

describe('GET /industries', ()=>{
    test('Get a list with one industry', async()=>{
        const res = await request(app).get('/industries')

        expect(res.statusCode).toBe(200)
    })
})


describe('POST /industries', ()=>{
    test('Add an industry', async()=>{
        const res = await request(app).post(`/industries`).send({
            industry: 'testInd2'
        })

        expect(res.statusCode).toBe(201)
    })
    test('Post industry missing data', async()=>{
        const res = await request(app).post(`/industries`).send({
        })

        expect(res.statusCode).toBe(404)
    })
})

