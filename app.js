const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//Get all movie names API1

const convertMovieDbObject = (object) => {
  return {
    movieName: object.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `select movie_name from movie`;
  const movieNamesQueryResponse = await db.all(getMovieNamesQuery);
  response.send(
    movieNamesQueryResponse.map((eachItem) => convertMovieDbObject(eachItem))
  );
});

//Add new movie API2

app.post("/movies/", async (request, response) => {
  const getMoviesDetails = request.body;
  const { directorId, movieName, leadActor } = getMoviesDetails;
  const addNewMovieQuery = `insert into movie(director_id,movie_name,lead_actor)
  values(${directorId},'${movieName}','${leadActor}');`;
  await db.run(addNewMovieQuery);
  response.send("Movie Successfully Added");
});

//Get movie API3

const convertSingleMovieDbObject = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getSingleMovieQuery = `select * from movie where movie_id = ${movieId}`;
  const getSingleMovieResponse = await db.get(getSingleMovieQuery);
  response.send(convertSingleMovieDbObject(getSingleMovieResponse));
});

//Update the details of a movie API4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update 
    movie 
    set
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    where 
        movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete a movie API5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get all directors API6

const convertDirectorDbObject = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `select * from director`;
  const getDirectorsQueryResponse = await db.all(getDirectorsQuery);
  response.send(
    getDirectorsQueryResponse.map((eachItem) =>
      convertDirectorDbObject(eachItem)
    )
  );
});

//Get all movie names of a director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorQuery = `select movie_name as movieName from movie where director_id = ${directorId};`;
  const getMoviesOfDirectorQueryResponse = await db.all(
    getMoviesOfDirectorQuery
  );
  response.send(getMoviesOfDirectorQueryResponse);
});

module.exports = app;
