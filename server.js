const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  username: "postgres",
  password: "mysqlpassword",
  database: "lms",
  define: {
    timestamps: false,
  },
});

const BookModel = sequelize.define("Books", {
  bName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bAuthor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pdate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Set up CORS middleware once

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/api/books", async (req, res) => {
  try {
    const books = await BookModel.findAll();
    res.json(books);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/submitForm", async (req, res) => {
  const { bName, bAuthor, subject, pdate } = req.body;

  try {
    if (!bName || !bAuthor || !subject || !pdate) {
      throw new Error("Incomplete form data");
    }

    if (bName.length > 30) {
      throw new Error("Name should be within 30 characters");
    }

    const newBook = await BookModel.create({
      bName,
      bAuthor,
      subject,
      pdate,
    });
    const updatedBooks = await BookModel.findAll();

    res.json({
      message: "Form submitted successfully",
      books: updatedBooks,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get("/books", async (req, res) => {
  const { subject } = req.query;

  try {
    if (!subject) {
      throw new Error("Subject code is required for filtering books.");
    }

    const books = await BookModel.findAll({
      where: {
        subject: subject,
      },
    });

    res.json(books);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});