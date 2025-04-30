import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import NFTDetailView from "./pages/NFTDetailView";
import CreateListingPage from "./pages/CreateListingPage";
import { Web3Provider } from "./context/Web3Context";
import { ListingsProvider } from "./context/ListingsContext";
import "./index.css";

const App = () => {
  // App-level state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Web3Provider>
        <ListingsProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route
                  path="/marketplace/:listingId"
                  element={<NFTDetailView />}
                />
                <Route path="/create-listing" element={<CreateListingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ListingsProvider>
      </Web3Provider>
    </Router>
  );
};

export default App;
