process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('./app')
const db = require('./db')

let testCompany;

beforeEach(async()=>{
    const res = await db.query(`INSERT INTO companies (code,name,description) VALUES ('test','test_company', 'teeeest') RETURNING *`)
    testCompany = res.rows[0]
    console.log(testCompany);
})

afterEach(async()=>{
    await db.query(`DELETE FROM companies`);
})

afterAll(async()=>{
    await db.end();
})

describe('GET /companies', ()=>{
    test('Get a list with one company', async()=>{
        const res = await request(app).get('/companies')

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({companies: [testCompany]})
    })
})

describe('GET /companies/:code', ()=>{
    test('Get specific company', async()=>{
        const res = await request(app).get(`/companies/${testCompany.code}`)

        expect(res.statusCode).toBe(200)
    })
    test('Get invalid company', async()=>{
        const res = await request(app).get(`/companies/fake_co`)

        expect(res.statusCode).toBe(404)
    })

})

describe('POST /companies', ()=>{
    test('Add a company', async()=>{
        const res = await request(app).post(`/companies`).send({
            code: 't2',
            name: 'test2',
            description: 'second test'
        })

        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({company : {code: 't2', name: 'test2', description: 'second test'}})
    })
    test('Post invalid companty', async()=>{
        const res = await request(app).post(`/companies`).send({
            name: 'test2',
            description: 'second test'
        })

        expect(res.statusCode).toBe(500)
    })
})

describe('PATCH /companies/:code', ()=>{
    test('Update a company', async()=>{
        const res = await request(app).patch(`/companies/${testCompany.code}`).send({
            name: 'test2',
            description: 'second test'
        })

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({company : {code: 'test', name: 'test2', description: 'second test'}})
    })
    test('Invalid update for company', async()=>{
        const res = await request(app).patch(`/companies/${testCompany.code}`).send({
            description: 'second test'
        })

        expect(res.statusCode).toBe(500)
    })
})

describe('DELETE /companies/code', ()=>{
    test('Delete company', async()=>{
        const res = await request(app).delete(`/companies/${testCompany.code}`)

        expect(res.status).toBe(200)
        expect(res.body).toEqual({status: 'Deleted'})
    })
    test('Delete invalid company', async()=>{
        const res = await request(app).delete(`/companies/orange`)

        expect(res.status).toBe(404)
    })
})