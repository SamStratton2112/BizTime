\c biz_test

DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS industry_company CASCADE;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    industry text PRIMARY KEY
);

CREATE TABLE industry_company (
    comp_code TEXT NOT NULL REFERENCES companies,
    industry TEXT NOT NULL REFERENCES industries,
    PRIMARY KEY(comp_code, industry)
);

-- INSERT INTO companies
--   VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
--          ('ibm', 'IBM', 'Big blue.'),
--          ('tog', 'The One Group', 'STK.');

-- INSERT INTO invoices (comp_Code, amt, paid, paid_date)
--   VALUES ('apple', 100, false, null),
--          ('apple', 200, false, null),
--          ('apple', 300, true, '2018-01-01'),
--          ('ibm', 400, false, null);

-- INSERT INTO industries (industry) VALUES
--   ('Tech'),
--   ('Hospitality'),
--   ('Food');

-- INSERT INTO industry_company (comp_code, industry) 
-- VALUES ('apple', 'Tech'),
--        ('tog', 'Food'),
--        ('tog', 'Tech'),
--        ('apple', 'Hospitality');