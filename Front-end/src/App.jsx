import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import AllRoute from './Routes/Routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AllRoute />
      <Toaster />
      <Footer />
    </div>
  );
}

export default App;
