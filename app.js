require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
// const YAML = require('yaml');
const cors  = require('cors');
// const swaggerUI = require('swagger-ui-express');
const {PORT=3000} = process.env;

const fs = require("fs");
// const file = fs.readFileSync('./swagger.yaml', 'utf8');
// const swaggerDocument = YAML.parse(file);

// const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// const specs = swaggerJsDoc(options);
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// app.use(
//   "/api-docs",
//   swaggerUI.serve,
//   swaggerUI.setup(specs, { customCssUrl: CSS_URL })
// );

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.send('Hai');
});

const authRouter = require('./routes/auth.routes');
app.use('/api/v1/auth', authRouter);
  
const courseRouter = require('./routes/course.routes');
app.use('/api/v1/course', courseRouter); 
  
const categoriesRouter = require('./routes/categories.routes');
app.use('/api/v1/categories', categoriesRouter);

const enrollmentRouter = require('./routes/enrollments.routes');
app.use('/api/v1/enrollment', enrollmentRouter);

const accountsRouter = require('./routes/accounts.routes');
app.use('/api/v1/accounts', accountsRouter);

const adminRouter = require('./routes/admin.routes');
app.use('/api/v1/admin', adminRouter);

// Elephant SQL
// const pg = require('pg');

// const conString = "postgres://dfeqpmuu:js4yQoMWz9RySjDlvXjJk25gmSLb4dPj@rain.db.elephantsql.com/dfeqpmuu";
// const client = new pg.Client(conString);
// client.connect(function(err){
//     if(err){
//         return console.log('could not connect to postgres', err);
//     }
//     client.query('SELECT NOW() AS "theTime"', function(err, result) {
//         if(err){
//             return console.log('error running query', err);
//         }
//         console.log(result.rows[0].theTime);
//         client.end();
//     });
// });

app.use((req, res, next) => {
    return res.status(404).json({
        status: false,
        message: 'Sorry can\'t find that!',
        error: null,
        data: null
    });
});

// app.use((err, req, res, next) => {
//     return res.status(500).json({
//         status: false,
//         message: 'somethink broke!',
//         error: err.message,
//         data: null
//     });
// });


app.listen(PORT, () => console.log('Listening on Port', PORT));