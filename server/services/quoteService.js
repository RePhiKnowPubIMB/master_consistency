const Quote = require('../models/Quote');

const quotesList = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "You don't become confident by shouting affirmations in the mirror, but by having a stack of undeniable proof that you are who you say you are.", author: "Alex Hormozi" },
    { text: "Motivation is garbage. It comes and goes. Discipline is reliable.", author: "David Goggins" },
    { text: "Impatience with actions, patience with results.", author: "Naval Ravikant" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "It’s not about being the best. It’s about being better than you were yesterday.", author: "Unknown" },
    { text: "The man who loves walking will walk further than the man who loves the destination.", author: "Unknown" },
    { text: "Discipline is doing what you hate to do, but doing it like you love it.", author: "Mike Tyson" },
    { text: "You can't cheat the grind. It knows how much you've invested. It won't give you anything you haven't worked for.", author: "Unknown" },
    { text: "Consistency is the playground of success.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
    { text: "A fit body, a calm mind, a house full of love. These things cannot be bought – they must be earned.", author: "Naval Ravikant" },
    { text: "The work works on you more than you work on it.", author: "Alex Hormozi" },
    { text: "If you want to be in the top 1%, you have to do what the 99% won't.", author: "Unknown" },
    { text: "Your level of success will rarely exceed your level of personal development.", author: "Jim Rohn" },
    { text: "Do it again. Play it again. Sing it again. Read it again. Write it again. Sketch it again. Rehearse it again. Run it again. Try it again.", author: "Unknown" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
    { text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.", author: "John C. Maxwell" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { text: "The hard part isn't getting your body in shape. The hard part is getting your mind in shape.", author: "Unknown" },
    { text: "Volume negates luck.", author: "Alex Hormozi" },
    { text: "Play long-term games with long-term people.", author: "Naval Ravikant" },
    { text: "I don't stop when I'm tired, I stop when I'm done.", author: "David Goggins" },
    { text: "The magic you are looking for is in the work you're avoiding.", author: "Unknown" },
    { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Focus on the process, not the outcome.", author: "Unknown" },
    { text: "The difference between who you are and who you want to be is what you do.", author: "Unknown" },
    { text: "If it was easy, everyone would do it.", author: "Unknown" },
    { text: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong" },
    { text: "Suffer the pain of discipline or suffer the pain of regret.", author: "Jim Rohn" },
    { text: "You are your habits.", author: "Unknown" },
    { text: "Great things are not done by impulse, but by a series of small things brought together.", author: "Vincent Van Gogh" },
    { text: "The most important thing is to keep the main thing the main thing.", author: "Stephen Covey" },
    { text: "Be so good they can't ignore you.", author: "Steve Martin" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Dream big. Start small. But most of all, start.", author: "Simon Sinek" },
    { text: "Don't wish it were easier. Wish you were better.", author: "Jim Rohn" },
    { text: "The distance between dreams and reality is called action.", author: "Unknown" },
    { text: "Motivation gets you going, but discipline keeps you growing.", author: "John C. Maxwell" },
    { text: "There are no traffic jams along the extra mile.", author: "Roger Staubach" },
    { text: "Do something today that your future self will thank you for.", author: "Unknown" },
    { text: "Success is stumbling from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn" },
    { text: "If you get tired, learn to rest, not to quit.", author: "Banksy" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Don't decrease the goal. Increase the effort.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
    { text: "The struggle you're in today is developing the strength you need for tomorrow.", author: "Unknown" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
    { text: "Specific knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now.", author: "Naval Ravikant" },
    { text: "You can't have a million-dollar dream with a minimum-wage work ethic.", author: "Stephen C. Hogan" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "A river cuts through rock, not because of its power, but because of its persistence.", author: "Jim Watkins" },
    { text: "Energy flows where attention goes.", author: "Tony Robbins" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "If you really want to do something, you'll find a way. If you don't, you'll find an excuse.", author: "Jim Rohn" },
    { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
    { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
    { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
    { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
    { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
    { text: "Don't wait. The time will never be just right.", author: "Napoleon Hill" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
    { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
    { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "If you can dream it, you can do it.", author: "Walt Disney" },
    { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.", author: "Unknown" },
    { text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.", author: "Steve Jobs" },
    { text: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Rob Siltanen" },
    { text: "Failure will never overtake me if my determination to succeed is strong enough.", author: "Og Mandino" },
    { text: "Entrepreneurs are great at dealing with uncertainty and also very good at minimizing risk. That's the classic entrepreneur.", author: "Mohnish Pabrai" },
    { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
    { text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang Von Goethe" },
    { text: "Imagine your life is perfect in every respect; what would it look like?", author: "Brian Tracy" },
    { text: "We generate fears while we sit. We overcome them by action.", author: "Dr. Henry Link" },
    { text: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
    { text: "Security is mostly a superstition. Life is either a daring adventure or nothing.", author: "Helen Keller" },
    { text: "The man who has confidence in himself gains the confidence of others.", author: "Hasidic Proverb" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
    { text: "What you lack in talent can be made up with desire, hustle and giving 110% all the time.", author: "Don Zimmer" },
    { text: "Do what you can with all you have, wherever you are.", author: "Theodore Roosevelt" }
];

async function seedQuotes() {
    try {
        const count = await Quote.countDocuments();
        if (count === 0) {
            await Quote.insertMany(quotesList);
            console.log('Quotes seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding quotes:', error);
    }
}

async function getDailyQuote() {
    try {
        const count = await Quote.countDocuments();
        if (count === 0) return null;

        // Use the day of the year to select a quote
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const index = dayOfYear % count;
        
        // Find the quote at that index (using skip/limit for simplicity, though not most efficient for huge dbs, fine here)
        const quote = await Quote.findOne().skip(index);
        return quote;
    } catch (error) {
        console.error('Error fetching daily quote:', error);
        return null;
    }
}

module.exports = { seedQuotes, getDailyQuote };
