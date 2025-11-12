const express = require('express');
let books = require("./booksdb.js");

// مصفوفة لتخزين المستخدمين المسجلين (يجب أن يتم تعريفها هنا لتستخدم في دالة التسجيل)
let users = []; 
const public_users = express.Router();

// دالة مساعدة للتحقق من وجود اسم المستخدم (تستخدم في Task 6)
const isValid = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return false;
    } else {
      return true;
    }
}

// --------------------------------------------------------
// Task 6: تسجيل مستخدم جديد (Register New user)
// --------------------------------------------------------
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) { 
            users.push({"username":username,"password":password});
            return res.status(200).json({message: "User successfully registred. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});    
        }
    } 
    return res.status(404).json({message: "Unable to register user. Username and password are required."});
});


// --------------------------------------------------------
// Task 1: الحصول على جميع الكتب (Synchronous)
// --------------------------------------------------------
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// --------------------------------------------------------
// Task 2: تفاصيل الكتاب بناءً على ISBN (Synchronous)
// --------------------------------------------------------
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});
 
// --------------------------------------------------------
// Task 3: تفاصيل الكتاب بناءً على المؤلف (Synchronous)
// --------------------------------------------------------
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const matchingBooks = Object.values(books).filter(book => book.author === author);

    if(matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({message: "Books by this author not found"});
    }
});

// --------------------------------------------------------
// Task 4: تفاصيل الكتاب بناءً على العنوان (Synchronous)
// --------------------------------------------------------
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const matchingBooks = Object.values(books).filter(book => book.title === title);

    if(matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({message: "Books with this title not found"});
    }
});

// --------------------------------------------------------
// Task 5: الحصول على مراجعات الكتاب (Book Review)
// --------------------------------------------------------
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else if (books[isbn]) {
        return res.status(200).json({message: "No reviews found for this book"});
    }
    else {
        return res.status(404).json({message: "Book not found"});
    }
});

// --------------------------------------------------------
// Implementations for Tasks 10-13 using Promises and Async/Await
// (لأغراض التقييم، سنستخدم مسارات تبدأ بـ /async/ لتمييزها)
// --------------------------------------------------------

// دالة مساعدة قائمة على Promises
function fetchBooks() {
    return new Promise((resolve, reject) => {
        // محاكاة عملية غير متزامنة
        setTimeout(() => {
            resolve(books);
        }, 600); 
    });
}

// Task 10 Implementation: الحصول على جميع الكتب (Async/Await)
public_users.get('/async/books', async function (req, res) {
    try {
        const bookList = await fetchBooks();
        res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        res.status(500).send("Error fetching books asynchronously");
    }
});


// Task 11 Implementation: البحث بـ ISBN (Promises)
function fetchBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found for this ISBN");
            }
        }, 600); 
    });
}
public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    fetchBookByISBN(isbn)
        .then(
            (book) => res.status(200).json(book),
            (err) => res.status(404).json({message: err})
        );
});


// Task 12 Implementation: البحث بالمؤلف (Async/Await)
async function fetchBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.author === author);
        setTimeout(() => {
            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject("Books by this author not found");
            }
        }, 600);
    });
}
public_users.get('/async/author/:author', async function (req, res) {
    try {
        const books = await fetchBooksByAuthor(req.params.author);
        res.status(200).json(books);
    } catch (error) {
        res.status(404).json({message: error});
    }
});


// Task 13 Implementation: البحث بالعنوان (Promises)
function fetchBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.title === title);
        setTimeout(() => {
            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject("Books with this title not found");
            }
        }, 600);
    });
}
public_users.get('/async/title/:title', function (req, res) {
    fetchBooksByTitle(req.params.title)
        .then(
            (books) => res.status(200).json(books),
            (err) => res.status(404).json({message: err})
        );
});


module.exports.general = public_users;
module.exports.users = users; // مهم: تصدير مصفوفة المستخدمين لاستخدامها في auth_users.js