const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// يجب أن يتم تعريف مصفوفة المستخدمين هنا أو استيرادها بشكل صحيح.
// بما أننا استخدمنا Users في general.js، نحتاج إلى ضمان التصدير والاستيراد.
// (يفترض أن هذا الملف يرى Users من general.js أو من مكان مركزي)
// للاحتياط، سنقوم بتعريفها هنا واستيرادها لاحقاً من booksdb.js/general.js إذا لزم الأمر
// لكن بما أن ملفات الـ skeleton عادة ما تستورد الـ users من general.js
// سنقوم بالاستيراد كما هو متوقع في سياق المشروع:
let users = require('./general.js').users || [];

 
// Helper function to check if username and password match the records
const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
      // تفحص اسم المستخدم وكلمة المرور
      return (user.username === username && user.password === password) 
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
}

// Task 7: Login as a Registered user
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in: Username and password are required"});
    }
  
    if (authenticatedUser(username,password)) {
      // إنشاء وتوقيع رمز JWT
      let accessToken = jwt.sign({
        data: username 
      }, 'access', { expiresIn: 60 * 60 }); 
  
      // تخزين الرمز واسم المستخدم في الجلسة (Session)
      req.session.authorization = {
        accessToken,
        username
      }
      return res.status(200).send("User successfully logged in. Access token granted.");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Task 8: Add or Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    
    // الحصول على اسم المستخدم من الجلسة (Session)
    const username = req.session.authorization.username; 
    
    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }
    if (!review) {
        return res.status(400).json({message: "Review query parameter is required"});
    }

    // التأكد من أن حقل المراجعات موجود
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    let bookReviews = books[isbn].reviews; 

    if (bookReviews.hasOwnProperty(username)) {
        // تعديل المراجعة
        bookReviews[username] = review;
        return res.status(200).json({message: `Review for ISBN ${isbn} modified successfully by ${username}.`});
    } else {
        // إضافة مراجعة جديدة
        bookReviews[username] = review;
        return res.status(200).json({message: `Review for ISBN ${isbn} added successfully by ${username}.`});
    }
});

// Task 9: Delete book review added by that particular user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    // الحصول على اسم المستخدم من الجلسة (Session)
    const username = req.session.authorization.username; 

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

    let bookReviews = books[isbn].reviews;

    if (bookReviews && bookReviews.hasOwnProperty(username)) {
        // حذف المراجعة بناءً على اسم المستخدم
        delete bookReviews[username]; 
        books[isbn].reviews = bookReviews; // تحديث الكائن
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} deleted successfully.`});
    } else {
        return res.status(404).json({message: "Review not found or you are not authorized to delete this review."});
    }
});


 module.exports.authenticated = regd_users;
