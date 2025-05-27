import express from 'express';
import user from './auth/auth.router';
import location from './location/location.router';
import car from './car/car.router';
import booking from './booking/booking.router';
import reservation from './reservation/reservation.router';
import payment from './payment/payment.router';
import insurance from './insurance/insurance.router';
import maintenance from './maintenance/maintenance.router';


const app = express();
app.use(express.json()); //used to parse JSON bodies

// routes
user(app);
location(app);
car(app);
booking(app);
reservation(app);
payment(app);
insurance(app);
maintenance(app);


app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.listen(8081, () => {
    console.log('Server is running on http://localhost:8081');
}) 