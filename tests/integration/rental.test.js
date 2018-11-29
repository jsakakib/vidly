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
                console.log('body :', res.body[i]);
                console.log('rental :', rentals[i]);
                expect(_.omit(res.body[i], '_id', 'customer._id', 'dateOut', 'movie._id'))
                    .toMatchObject(_.omit(rentals[i].toObject(), '_id', 'customer._id', 'dateOut', 'movie._id'));
            }
        });
    });

});