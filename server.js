const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const paginate = require('mongoose-paginate-v2');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const mongoURI = 'mongodb+srv://admin:1234@cluster0.gyfqb3i.mongodb.net/project';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const conn = mongoose.connection;

// Create quote schema
const quoteSchema = new mongoose.Schema({
  text: String,
  rating: { type: Number, default: 0 }
});

quoteSchema.plugin(paginate);

const Quote = mongoose.model('Quote', quoteSchema);

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Upload endpoint for quotes
app.post('/api/quotes', async (req, res) => {
  const { text } = req.body;
  const newQuote = new Quote({ text });
  await newQuote.save();
  res.json({ success: true });
});

// Retrieve quotes based on keyword and pagination
app.get('/api/quotes', async (req, res) => {
  try {
    const { keyword, page = 1, limit = 9 } = req.query;
    const query = keyword ? { text: { $regex: new RegExp(keyword, 'i') } } : {};
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const quotes = await Quote.paginate(query, options);

    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update rating for a quote
app.put('/api/quotes/:id', async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  try {
    const updatedQuote = await Quote.findByIdAndUpdate(id, { rating }, { new: true });

    res.json(updatedQuote);
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedQuote = await Quote.findByIdAndDelete(id);
    if (!deletedQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
