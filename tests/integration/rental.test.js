const _ = require('lodash');
const request = require('supertest');
const mongoose = require('mongoose');
const { Genre } = require('../../models/genre');
const { Customer } = require('../../models/customer');
const { Movie } = require('../../models/movie');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');

describe('/api/rentals', () => {

    beforeEach(async () => {
        server = require('../../index');
    });

    afterEach(async () => {
        await Genre.deleteMany({});
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        let name;
        let genre;
        let title;
        let dailyRentalRate;
        let numberInStock;
        let movie;
        let phone;
        let customer;

        beforeEach(async () => {
            name = '12345';
            genre = { name };
            genre = new Genre(genre);
            genre = await genre.save();

            phone = '12345';
            customer = { name, phone };
            customer = new Customer(customer);
            customer = await customer.save();

            title = '12345';
            dailyRentalRate = 2;
            numberInStock = 10;
            movie = { title, genre, dailyRentalRate, numberInStock };
            movie = new Movie(movie);
            movie = await movie.save();
        });

        it('should return all rentals', async () => {
            const rental1 = { customer, movie };
            const rental2 = {
                customer: { name: 'customer2', phone },
                movie: { title: 'title2', genre: 'genre2', dailyRentalRate, numberInStock }
            };

            await Rental.insertMany([rental1, rental2]);

            const res = await request(server).get('/api/rentals');
            const rentals = await Rental.find({}).sort('-dateOut');

            expect(res.status).toBe(200);
            for (let i in rentals) {
                expect(res.body[i]._id).toEqual(rentals[i]._id.toHexString());
            }
        });
    });

    describe('GET /:id', () => {
        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/rentals/1');

            expect(res.status).toBe(404);
        });

        it('should return 404 if no rental with the given id exists', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/rentals/' + id);

            expect(res.status).toBe(404);
        });

        it('should return a rental if valid id is passed', async () => {
            const name = '12345';
            let genre = { name };
            genre = new Genre(genre);
            genre = await genre.save();

            const phone = '12345';
            let customer = { name, phone };
            customer = new Customer(customer);
            customer = await customer.save();

            const title = '12345';
            const dailyRentalRate = 2;
            const numberInStock = 10;
            let movie = { title, genre, dailyRentalRate, numberInStock };
            movie = new Movie(movie);
            movie = await movie.save();

            let rental = { customer, movie };
            rental = new Rental(rental);
            rental = await rental.save();

            const res = await request(server).get('/api/rentals/' + rental._id);

            expect(res.status).toBe(200);
            expect(res.body._id).toEqual(rental._id.toHexString());
        });
    });

    describe('POST /', () => {
        let token;
        let name;
        let genre;
        let title;
        let dailyRentalRate;
        let numberInStock;
        let movie;
        let phone;
        let customer;
        let payload;

        const exec = () => {
            return request(server)
                .post('/api/rentals')
                .set('x-auth-token', token)
                .send(payload);
        }

        beforeEach(async () => {
            token = new User().generateAuthToken();

            name = '12345';
            genre = { name };
            genre = new Genre(genre);
            genre = await genre.save();

            phone = '12345';
            customer = { name, phone };
            customer = new Customer(customer);
            customer = await customer.save();

            title = '12345';
            dailyRentalRate = 2;
            numberInStock = 10;
            movie = { title, genre, dailyRentalRate, numberInStock };
            movie = new Movie(movie);
            movie = await movie.save();
            payload = { customerId: customer._id, movieId: movie._id };
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if customerId is not provided', async () => {
            delete payload.customerId;
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if movieId is not provided', async () => {
            delete payload.movieId;
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 404 if customer with the given Id is not found', async () => {
            payload.customerId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 404 if movie with the given Id is not found', async () => {
            payload.movieId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if movie is out of stock', async () => {
            movie.numberInStock = 0;
            await movie.save();

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should save the rental if it is valid', async () => {
            const res = await exec();
            const rental = await Rental.findById(res.body._id);

            expect(rental).not.toBeNull();
        });

        it('should return the rental if it is valid', async () => {
            const res = await exec();
            const rental = await Rental.findById(res.body._id);

            expect(res.status).toBe(200);
            expect(res.body._id).toEqual(rental._id.toHexString());
        });
    });
});