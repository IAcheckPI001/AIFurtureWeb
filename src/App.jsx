

import "./i18n";
import Header from "./components/Header.jsx"
import Footer from "./components/Footer.jsx"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Home from './pages/Home';
import Blogs from './pages/Blogs.jsx';
import Services from "./pages/Services.jsx";
import Contact from "./pages/Contact.jsx";
import NewBlog from "./pages/NewBlog.jsx";
import BlogID from "./pages/BlogID.jsx";
import ScrollToTop from "./hooks/scrollToTop.jsx";
import Session from "./pages/Session.jsx";
import.meta.env.VITE_API_URL;

function App(){
  return (
    <Router>
      <ScrollToTop />
      <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/create-blog" element={<NewBlog />} />
        <Route path="/manage-blogs" element={<Session />} />
        <Route path="/blogs/:public_id" element={<BlogID />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer/>
    </Router>
  )

}

export default App