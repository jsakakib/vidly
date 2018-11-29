const request = require('supertest');
const _ = require('lodash');
const { Genre } = require('../../models/genre');
const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/movies', () => {

    beforeEach(() => {
        server = require('../../index');
    });

    afterEach(async () => {
        await Movie.deleteMany({});
        await Genre.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        const title = 'movie1';
        const name = 'genre1';
        const genre = { name };
        const numberInStock = 10;
        const dailyRentalRate = 2;
        const movie = { title, genre, numberInStock, dailyRentalRate };

        it('should return all movies', async () => {
            await Movie.insertMany([
                movie,
                { title: 'movie2', genre: { name: 'genre2' }, numberInStock, dailyRentalRate }
            ]);

            const res = await request(server).get('/api/movies');
            const movies = await Movie.find({});

            expect(res.status).toBe(200);
            for (let i in movies) {
                expect(_.omit(res.body[i], '_id', 'genre._id'))
                    .toMatchObject(_.omit(movies[i].toObject(), '_id', 'genre._id'));
            }
        });
    });

    describe('GET /:id', () => {
        const title = 'movie1';
        const name = 'genre1';
        const genre = { name };
        const numberInStock = 10;
        const dailyRentalRate = 2;
        let movie = { title, genre, numberInStock, dailyRentalRate };

        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/movies/1');
            expect(res.status).toBe(404);
        });

        it('should return 404 if no movie with the given id exists', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/movies/' + id);

            expect(res.status).toBe(404);
        });

        it('should return a movie if valid id is passed', async () => {
            movie = new Movie(movie);
            movie = await movie.save();

            const res = await request(server).get('/api/movies/' + movie.id);

            expect(res.status).toBe(200);
            expect(_.omit(res.body, '_id', 'genre._id')).toMatchObject(_.omit(movie.toObject(), '_id', 'genre._id'));
        });
    });

    describe('POST /', () => {
        let token;
        let title;
        let name;
        let genre;
        let genreId;
        let numberInStock;
        let dailyRentalRate;

        const exec = () => {
            return request(server)
                .post('/api/movies')
                .set('x-auth-token', token)
                .send({ title, genreId, numberInStock, dailyRentalRate });
        }

        beforeEach(async () => {
            token = new User().generateAuthToken();
            title = 'movie1';
            name = 'genre1';
            genre = { name };
            genre = new Genre(genre);
            genre = await genre.save();
            genreId = genre._id;

            numberInStock = 10;
            dailyRentalRate = 2;
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if movie title is less than 5 characters', async () => {
            title = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if movie title is more than 255 characters', async () => {
            title = new Array(257).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genreId is not provided', async () => {
            genreId = undefined;
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 404 if not genre is found for the movie', async () => {
            await Genre.deleteMany({});
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 400 if numberInStock is less than 0', async () => {
            numberInStock = -1;
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if numberInStock is greater than 255', async () => {
            numberInStock = 300;
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if dailyRentalRate is less than 0', async () => {
            dailyRentalRate = -1;
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if dailyRentalRate is greater than 255', async () => {
            dailyRentalRate = 300;
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should save the movie if it is valid', async () => {
            const res = await exec();
            const movie = await Movie.findById(res.body._id);
            expect(movie).not.toBeNull();
        });

        it('should return the movie if it is valid', async () => {
            const res = await exec();
            const movie = await Movie.findById(res.body._id);
            expect(res.status).toBe(200);
            expect(_.omit(res.body, '_id', 'genre._id')).toMatchObject(_.omit(movie.toObject(), '_id', 'genre._id'));
        });
    });

    describe('PUT /:id', () => {
        let token;
        let title;
        let name;
        let genre;
        let genreId;
        let numberInStock;
        let dailyRentalRate;
        let newTitle;
        let movie;
        let movieId;

        const exec = () => {
            return request(server)
                .put('/api/movies/' + movieId)
                .set('x-auth-token', token)
                .send({ title: newTitle, genreId, numberInStock, dailyRentalRate });
        }

        beforeEach(async () => {
            // Before each test we need to create a movie and 
            // put it in the database.      
            newTitle = 'updatedtitle';
            token = new User().generateAuthToken();
            title = 'movie1';
            name = 'genre1';
            genre = { name };
            genre = new Genre(genre);
            genre = await genre.save();
            genreId = genre._id;

            numberInStock = 10;
            dailyRentalRate = 2;

            movie = { title, genre, numberInStock, dailyRentalRate };
            movie = new Movie(movie);
            movie = await movie.save();
            movieId = movie._id;
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 404 if id is invalid', async () => {
            movieId = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 404 if movie with the given id was not found', async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 400 if movie is less than 5 characters', async () => {
            newTitle = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if movie is more than 255 characters', async () => {
            newTitle = new Array(257).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should update the movie if input is valid', async () => {
            const res = await exec();
            const updatedmovie = await Movie.findById(res.body._id);
            expect(updatedmovie.title).toBe(newTitle);
        });

        it('should return the updated movie if it is valid', async () => {
            const res = await exec();
            const movie = await Movie.findById(res.body._id);
            expect(res.status).toBe(200);
            expect(_.omit(res.body, '_id', 'genre._id')).toMatchObject(_.omit(movie.toObject(), '_id', 'genre._id'));
        });
    });

    describe('DELETE /:id', () => {
        let token;
        let title;
        let name;
        let genre;
        let numberInStock;
        let dailyRentalRate;
        let movie;
        let movieId;

        const exec = () => {
            return request(server)
                .delete('/api/movies/' + movieId)
                .set('x-auth-token', token)
                .send();
        }

        beforeEach(async () => {
            // Before each test we need to create a movie and 
            // put it in the database.      
            token = new User({ isAdmin: true }).generateAuthToken();
            title = 'movie1';
            name = 'genre1';
            genre = { name };
            genre = new Genre(genre);
            genre = await genre.save();

            numberInStock = 10;
            dailyRentalRate = 2;

            movie = { title, genre, numberInStock, dailyRentalRate };
            movie = new Movie(movie);
            movie = await movie.save();
            movieId = movie._id;
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });

        it('should return 404 if id is invalid', async () => {
            movieId = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 404 if no movie with the given id was found', async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should delete the movie if input is valid', async () => {
            const res = await exec();
            const movieInDb = await Movie.findById(res.body._id);
            expect(movieInDb).toBeNull();
        });

        it('should return the removed movie', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(_.omit(res.body, '_id', 'genre._id')).toMatchObject(_.omit(movie.toObject(), '_id', 'genre._id'));
        });
    });
});