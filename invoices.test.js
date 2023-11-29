process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('./app')
const db = require('./db')

let testInv;
let testCompany;


beforeEach(async()=>{
    const coRes = await db.query(`INSERT INTO companies (code,name,description) VALUES ('test2','test_co', 'teeeeeeest') RETURNING *`)
    testCompany = coRes.rows[0]
    const res = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test2', '100') RETURNING *`)
    testInv= res.rows[0]
    console.log(testInv);
    console.log(testCompany);
})

afterEach(async()=>{
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
})

afterAll(async()=>{
    await db.end();
})

describe('GET /invoices', ()=>{
    test('Get a list with one invoice', async()=>{
        const res = await request(app).get('/invoices')

        expect(res.statusCode).toBe(200)
    })
})

describe('GET /invoices/:id', ()=>{
    test('Get specific invoice', async()=>{
        const res = await request(app).get(`/invoices/${testInv.id}`)

        expect(res.statusCode).toBe(200)
    })
    test('Get invalid invoice', async()=>{
        const res = await request(app).get(`/invoices/1111111111`)

        expect(res.statusCode).toBe(404)
    })

})

describe('POST /invoices', ()=>{
    test('Add an invoice', async()=>{
        const res = await request(app).post(`/invoices`).send({
            comp_code: 'test2',
            amt: '200'
        })

        expect(res.statusCode).toBe(201)
    })
    test('Post invoice missing data', async()=>{
        const res = await request(app).post(`/invoices`).send({
            amt: '100'
        })

        expect(res.statusCode).toBe(500)
    })
    test('Post invoice with invalid company', async()=>{
        const res = await request(app).post(`/invoices`).send({
            comp_code: 'invalid',
            amt: '100'
        })

        expect(res.statusCode).toBe(500)
    })
})

describe('PATCH /invoices/:id', ()=>{
    test('Update an invoice', async()=>{
        const res = await request(app).patch(`/invoices/${testInv.id}`).send({
            amt : '400',
            paid: 'true'
        })

        expect(res.statusCode).toBe(200)
    })
    test('Invalid update for an invoice', async()=>{
        const res = await request(app).patch(`/invoices/${testInv.id}`).send({
            paid: 'false'
        })

        expect(res.statusCode).toBe(500)
    })
    test('Update invalid invoice', async()=>{
        const res = await request(app).patch(`/invoices/999999999`).send({
            amt: '10000',
            paid: 'false'
        })

        expect(res.statusCode).toBe(404)
    })
})

describe('DELETE /invoices/id', ()=>{
    test('Delete invoice', async()=>{
        const res = await request(app).delete(`/invoices/${testInv.id}`)

        expect(res.status).toBe(200)
        expect(res.body).toEqual({status: 'Deleted'})
    })
    test('Delete invalid invoice', async()=>{
        const res = await request(app).delete(`/invoices/0`)

        expect(res.status).toBe(404)
    })
})