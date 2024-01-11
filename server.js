const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000; // You can change this to your desired port

// Middleware
app.use(bodyParser.json());

// Endpoint to add traffic data
app.post('/traffic', (req, res) => {
    const { ip, device, datetime } = req.body;

    const csvRow = `${ip},${datetime},${device.name},${device.agent}\n`;

    fs.appendFile('traffic.csv', csvRow, (err) => {
        if (err) {
            console.error('Error appending to traffic CSV file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const message = 'Traffic data appended to CSV file ' + ip + " " + datetime
        console.log(message);
        return res.status(200).json({ message: message });
    });
});


// Endpoint to add email data
app.post('/addEmail', (req, res) => {
    const { email, ip, device, datetime } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const csvRow = `${email},${ip},${device.name},${device.agent},${datetime}\n`;

    fs.appendFile('emails.csv', csvRow, (err) => {
        if (err) {
            console.error('Error appending to CSV file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const message = 'Email data appended to CSV file ' + email + " " + datetime
        console.log(message);
        return res.status(200).json({ message: message });
    });
});

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public' + '/index.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
